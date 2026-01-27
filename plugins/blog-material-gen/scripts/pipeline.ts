import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { analyzeDailyBranch, analyzeCurrentBranchOnly, getCurrentBranch, getRecentDailyBranches, getRepoUrl } from './git-analyzer.js';
import { extractMeaningfulCodeBlocks } from './code-masker.js';
import { createNotionClient, createOrAppendBlogMaterialPage, testNotionConnection, extractDateFromBranch } from './notion-client.js';
import { generateBlogDraft } from './llm-client.js';
import type {
  PipelineConfig,
  PipelineResult,
  DailyBranchData,
  BranchAnalysis,
  BranchMaterial,
  BlogIdea,
  TroubleshootingItem,
  NotionCategory,
  BlogDraft,
} from './types.js';

const CONFIG_PATH = path.join(os.homedir(), '.config', 'blog-material-gen', 'config.json');
const LOG_DIR = path.join(os.homedir(), '.config', 'blog-material-gen', 'logs');

interface UserConfig {
  api_key: string;
  database_id: string;
  database_name?: string;
  slack_webhook_url?: string;
  openai_api_key?: string;
  openai_model?: 'gpt-4o-mini' | 'gpt-4o';
}

interface LogEntry {
  timestamp: string;
  success: boolean;
  dailyBranch: string;
  workspaceName: string;
  result: PipelineResult;
  duration: number;
}

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function saveLog(entry: LogEntry): string {
  ensureLogDir();
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOG_DIR, `${date}.json`);
  
  let logs: LogEntry[] = [];
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    } catch {
      logs = [];
    }
  }
  
  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  return logFile;
}

async function sendSlackSuccessNotification(
  webhookUrl: string,
  result: PipelineResult,
  workspaceName: string,
  dailyBranch: string,
): Promise<void> {
  const date = extractDateFromBranch(dailyBranch);
  const modeText = result.appended ? '기존 페이지에 추가' : '새 페이지 생성';
  
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 블로그 소재 생성 완료',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*날짜:*\n${date}`,
          },
          {
            type: 'mrkdwn',
            text: `*워크스페이스:*\n${workspaceName}`,
          },
          {
            type: 'mrkdwn',
            text: `*분석된 브랜치:*\n${result.branchesAnalyzed}개`,
          },
          {
            type: 'mrkdwn',
            text: `*블로그 아이디어:*\n${result.blogIdeasGenerated}개`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*모드:* ${modeText}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Notion에서 보기',
              emoji: true,
            },
            url: result.notionUrl,
            style: 'primary',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log('📨 Slack notification sent');
    } else {
      console.error('⚠️ Slack notification failed:', await response.text());
    }
  } catch (error) {
    console.error('⚠️ Slack notification error:', error);
  }
}

async function sendSlackFailureNotification(
  webhookUrl: string,
  result: PipelineResult,
  workspaceName: string,
  dailyBranch: string,
  logFilePath?: string,
): Promise<void> {
  const date = extractDateFromBranch(dailyBranch);
  const errorMessages = result.errors?.join('\n• ') || '알 수 없는 오류';
  
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ 블로그 소재 생성 실패',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*날짜:*\n${date}`,
          },
          {
            type: 'mrkdwn',
            text: `*워크스페이스:*\n${workspaceName}`,
          },
          {
            type: 'mrkdwn',
            text: `*대상 브랜치:*\n${dailyBranch}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*오류 내용:*\n• ${errorMessages}`,
        },
      },
      ...(logFilePath ? [{
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📋 로그 파일: \`${logFilePath}\``,
          },
        ],
      }] : []),
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log('📨 Slack failure notification sent');
    } else {
      console.error('⚠️ Slack notification failed:', await response.text());
    }
  } catch (error) {
    console.error('⚠️ Slack notification error:', error);
  }
}

function loadConfig(): UserConfig | null {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return null;
    }
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function extractTroubleshooting(branch: BranchAnalysis): TroubleshootingItem[] {
  const items: TroubleshootingItem[] = [];

  if (branch.prInfo?.body) {
    const troubleshootingPatterns = [
      /(?:문제|problem|issue)[:\s]*(.+?)(?:원인|cause|해결|solution|$)/gis,
      /(?:해결|fix|solved)[:\s]*(.+?)(?:\n\n|$)/gis,
      /(?:트러블슈팅|troubleshooting)[:\s]*(.+?)(?:\n\n|$)/gis,
    ];

    for (const pattern of troubleshootingPatterns) {
      const match = branch.prInfo.body.match(pattern);
      if (match) {
        items.push({
          problem: match[1]?.trim() || 'PR에서 발견된 이슈',
          cause: '분석 필요',
          solution: 'PR 참조',
        });
        break;
      }
    }
  }

  const fixCommits = branch.commits.filter((c) => c.type === 'fix');
  for (const commit of fixCommits.slice(0, 2)) {
    items.push({
      problem: commit.subject,
      cause: commit.body || '커밋 메시지 참조',
      solution: `${commit.type}: ${commit.subject}`,
    });
  }

  return items;
}

function extractLearnings(branch: BranchAnalysis): string[] {
  const learnings: string[] = [];
  const techKeywords = new Set<string>();

  for (const file of branch.filesChanged) {
    if (file.language) {
      techKeywords.add(file.language);
    }
  }

  const commitTypes = new Set(branch.commits.map((c) => c.type));
  
  if (commitTypes.has('feat')) {
    learnings.push(`새로운 기능 구현 경험: ${branch.commits.find((c) => c.type === 'feat')?.subject || ''}`);
  }
  if (commitTypes.has('fix')) {
    learnings.push(`버그 수정 및 디버깅 경험`);
  }
  if (commitTypes.has('refactor')) {
    learnings.push(`코드 리팩토링 패턴 적용`);
  }
  if (commitTypes.has('perf')) {
    learnings.push(`성능 최적화 기법 적용`);
  }

  if (techKeywords.size > 0) {
    learnings.push(`사용 기술: ${[...techKeywords].join(', ')}`);
  }

  return learnings;
}

function generateBlogIdea(branch: BranchAnalysis): BlogIdea {
  const mainCommit = branch.commits.find((c) => c.type === 'feat') || branch.commits[0];
  const techs = [...new Set(branch.filesChanged.map((f) => f.language).filter(Boolean))];
  
  let category: NotionCategory = '기술 블로그';
  
  if (branch.commits.some((c) => c.type === 'fix')) {
    category = '기술 블로그';
  }

  const title = mainCommit
    ? `${techs[0] || 'Development'}에서 ${mainCommit.subject}`
    : `${branch.branchName} 작업 정리`;

  return {
    title,
    description: branch.summary,
    tags: techs.filter((t): t is string => t !== undefined).slice(0, 3),
    category,
  };
}

async function processBranchAnalysis(
  branch: BranchAnalysis,
  repoUrl?: string,
  userConfig?: UserConfig
): Promise<BranchMaterial> {
  const codeBlocks = extractMeaningfulCodeBlocks(branch.filesChanged, 3);
  const troubleshooting = extractTroubleshooting(branch);
  const learnings = extractLearnings(branch);
  const blogIdea = generateBlogIdea(branch);
  const techs = [...new Set(branch.filesChanged.map((f) => f.language).filter(Boolean))] as string[];

  const requirements = branch.prInfo?.body
    ? extractRequirements(branch.prInfo.body)
    : branch.commits.map((c) => c.subject).join(', ');

  const commitUrls = repoUrl
    ? branch.commits.map((c) => ({
        hash: c.hash,
        url: `${repoUrl}/commit/${c.hash}`,
      }))
    : branch.commits.map((c) => ({
        hash: c.hash,
        url: '',
      }));

  // Try to generate LLM draft if API key is configured
  let llmDraft: BlogDraft | undefined;
  if (userConfig?.openai_api_key && userConfig?.openai_model) {
    console.log('[LLM] Enabled - Generating blog draft...');
    try {
      const draft = await generateBlogDraft(branch, {
        openai_api_key: userConfig.openai_api_key,
        openai_model: userConfig.openai_model,
      });
      if (draft) {
        llmDraft = draft;
        console.log('[LLM] ✅ Blog draft generated successfully');
      } else {
        console.log('[LLM] ⚠️  Failed to generate draft, using fallback');
      }
    } catch (error) {
      console.error('[LLM] ❌ Error generating draft:', error instanceof Error ? error.message : String(error));
    }
  } else {
    console.log('[LLM] Disabled (no API key configured)');
  }

  return {
    name: branch.branchName,
    requirements: requirements.substring(0, 500),
    tech: techs,
    codeBlocks,
    troubleshooting,
    learnings,
    blogIdeaTitle: blogIdea.title,
    prUrl: branch.prInfo?.url,
    commitUrls,
    llmDraft,
  };
}

function extractRequirements(prBody: string): string {
  const patterns = [
    /(?:요구사항|requirements?|what)[:\s]*(.+?)(?:\n\n|##|$)/is,
    /(?:summary|개요|목적)[:\s]*(.+?)(?:\n\n|##|$)/is,
  ];

  for (const pattern of patterns) {
    const match = prBody.match(pattern);
    if (match) {
      return match[1].trim().replace(/\n/g, ' ');
    }
  }

  const firstParagraph = prBody.split('\n\n')[0];
  return firstParagraph.replace(/[#*`]/g, '').trim();
}

function generateDailySummary(branches: BranchAnalysis[]): string {
  const totalCommits = branches.reduce((sum, b) => sum + b.commits.length, 0);
  const totalFiles = branches.reduce((sum, b) => sum + b.filesChanged.length, 0);
  const allTechs = [...new Set(branches.flatMap((b) => b.filesChanged.map((f) => f.language).filter(Boolean)))];
  
  const commitTypeCounts: Record<string, number> = {};
  for (const branch of branches) {
    for (const commit of branch.commits) {
      commitTypeCounts[commit.type] = (commitTypeCounts[commit.type] || 0) + 1;
    }
  }

  const mainWork = Object.entries(commitTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => {
      const typeMap: Record<string, string> = {
        feat: '기능 추가',
        fix: '버그 수정',
        refactor: '리팩토링',
        docs: '문서화',
        test: '테스트',
        chore: '기타 작업',
      };
      return typeMap[type] || type;
    })
    .join(', ');

  return `오늘은 ${branches.length}개의 feature 브랜치에서 ${totalCommits}개의 커밋을 통해 ${totalFiles}개의 파일을 변경했습니다. 주요 작업: ${mainWork}. 사용 기술: ${allTechs.slice(0, 5).join(', ') || 'N/A'}`;
}

function extractWorkspaceName(workingDirectory: string): string {
  return path.basename(workingDirectory);
}

export async function generateBlogMaterialFromCurrentBranch(config: Omit<PipelineConfig, 'dailyBranch'>, userConfig?: UserConfig): Promise<PipelineResult> {
  const errors: string[] = [];
  const workspaceName = extractWorkspaceName(config.workingDirectory);
  const today = new Date().toISOString().split('T')[0];

  console.log('🚀 Starting blog material generation from current branch...');
  console.log(`   Working Dir: ${config.workingDirectory}`);
  console.log(`   Workspace: ${workspaceName}`);
  console.log(`   Target Date: ${today}`);

  try {
    const notion = createNotionClient(config.notionApiKey);
    
    console.log('🔗 Testing Notion connection...');
    const isConnected = await testNotionConnection(notion, config.notionDatabaseId);
    if (!isConnected) {
      return {
        success: false,
        branchesAnalyzed: 0,
        blogIdeasGenerated: 0,
        errors: ['Failed to connect to Notion. Please check your API key and database ID.'],
      };
    }
    console.log('✅ Notion connection successful');

    console.log('📂 Analyzing current branch...');
    const branchAnalysis = await analyzeCurrentBranchOnly(config.workingDirectory);
    console.log(`✅ Analyzed branch: ${branchAnalysis.branchName}`);

    if (branchAnalysis.commits.length === 0) {
      return {
        success: false,
        branchesAnalyzed: 0,
        blogIdeasGenerated: 0,
        errors: ['No commits found in current branch compared to base branch.'],
      };
    }

     console.log('🔧 Processing branch data...');
     const repoUrl = await getRepoUrl(config.workingDirectory);
     const branchMaterial = await processBranchAnalysis(branchAnalysis, repoUrl, userConfig);
     const blogIdea = generateBlogIdea(branchAnalysis);
     const allTechs = [...new Set(branchMaterial.tech)];

    const dailyData: DailyBranchData = {
      dailyBranch: branchAnalysis.branchName,
      date: today,
      summary: branchAnalysis.summary,
      blogIdeas: [blogIdea],
      branches: [branchMaterial],
      tags: blogIdea.tags,
      tech: allTechs,
    };

    const notionPage = await createOrAppendBlogMaterialPage(
      notion,
      config.notionDatabaseId,
      dailyData,
      workspaceName,
    );

    if (notionPage.appended) {
      console.log(`✅ Appended to existing Notion page: ${notionPage.url}`);
    } else {
      console.log(`✅ Created new Notion page: ${notionPage.url}`);
    }

    return {
      success: true,
      notionUrl: notionPage.url,
      branchesAnalyzed: 1,
      blogIdeasGenerated: 1,
      appended: notionPage.appended,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Pipeline failed:', errorMessage);
    errors.push(errorMessage);

    return {
      success: false,
      branchesAnalyzed: 0,
      blogIdeasGenerated: 0,
      errors,
    };
  }
}

export async function generateBlogMaterial(config: PipelineConfig, userConfig?: UserConfig): Promise<PipelineResult> {
  const errors: string[] = [];
  const workspaceName = extractWorkspaceName(config.workingDirectory);

  console.log('🚀 Starting blog material generation...');
  console.log(`   Daily Branch: ${config.dailyBranch}`);
  console.log(`   Working Dir: ${config.workingDirectory}`);
  console.log(`   Workspace: ${workspaceName}`);

  try {
    const notion = createNotionClient(config.notionApiKey);
    
    console.log('🔗 Testing Notion connection...');
    const isConnected = await testNotionConnection(notion, config.notionDatabaseId);
    if (!isConnected) {
      return {
        success: false,
        branchesAnalyzed: 0,
        blogIdeasGenerated: 0,
        errors: ['Failed to connect to Notion. Please check your API key and database ID.'],
      };
    }
    console.log('✅ Notion connection successful');

    console.log('📂 Analyzing Git repository...');
    const branchAnalyses = await analyzeDailyBranch(config.dailyBranch, config.workingDirectory);
    console.log(`✅ Analyzed ${branchAnalyses.length} branches`);

    if (branchAnalyses.length === 0) {
      return {
        success: false,
        branchesAnalyzed: 0,
        blogIdeasGenerated: 0,
        errors: ['No branches found to analyze.'],
      };
    }

     console.log('🔧 Processing branch data...');
     const repoUrl = await getRepoUrl(config.workingDirectory);
     const branchMaterials = await Promise.all(
       branchAnalyses.map((b) => processBranchAnalysis(b, repoUrl, userConfig))
     );
     const blogIdeas = branchAnalyses.map(generateBlogIdea);
     const allTechs = [...new Set(branchMaterials.flatMap((b) => b.tech))];

    const dailyData: DailyBranchData = {
      dailyBranch: config.dailyBranch,
      date: extractDateFromBranch(config.dailyBranch),
      summary: generateDailySummary(branchAnalyses),
      blogIdeas,
      branches: branchMaterials,
      tags: blogIdeas.flatMap((i) => i.tags).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10),
      tech: allTechs,
    };

    const notionPage = await createOrAppendBlogMaterialPage(
      notion,
      config.notionDatabaseId,
      dailyData,
      workspaceName,
    );

    if (notionPage.appended) {
      console.log(`✅ Appended to existing Notion page: ${notionPage.url}`);
    } else {
      console.log(`✅ Created new Notion page: ${notionPage.url}`);
    }

    return {
      success: true,
      notionUrl: notionPage.url,
      branchesAnalyzed: branchAnalyses.length,
      blogIdeasGenerated: blogIdeas.length,
      appended: notionPage.appended,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Pipeline failed:', errorMessage);
    errors.push(errorMessage);

    return {
      success: false,
      branchesAnalyzed: 0,
      blogIdeasGenerated: 0,
      errors,
    };
  }
}

async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const isCurrentBranchMode = args.includes('--current-branch');
  const filteredArgs = args.filter(arg => arg !== '--current-branch');
  let dailyBranch = filteredArgs[0];
  const workingDirectory = filteredArgs[1] || process.cwd();

  const userConfig = loadConfig();
  
  if (!userConfig || !userConfig.api_key || !userConfig.database_id) {
    console.error('❌ 설정이 완료되지 않았습니다.');
    console.error(`   설정 파일: ${CONFIG_PATH}`);
    console.error('   /blog-material-gen:setup 을 실행해주세요.');
    process.exit(1);
  }

  let result: PipelineResult;
  let branchForLog: string;

   if (isCurrentBranchMode) {
     branchForLog = await getCurrentBranch(workingDirectory);
     result = await generateBlogMaterialFromCurrentBranch({
       workingDirectory,
       notionApiKey: userConfig.api_key,
       notionDatabaseId: userConfig.database_id,
     }, userConfig);
   } else {
    if (!dailyBranch) {
      console.log('ℹ️  No daily branch specified. Looking for recent daily branches...');
      const recentBranches = await getRecentDailyBranches(workingDirectory);
      
      if (recentBranches.length > 0) {
        dailyBranch = recentBranches[0];
        console.log(`   Using most recent: ${dailyBranch}`);
      } else {
        const currentBranch = await getCurrentBranch(workingDirectory);
        dailyBranch = currentBranch;
        console.log(`   Using current branch: ${dailyBranch}`);
      }
    }

     const config: PipelineConfig = {
       dailyBranch,
       workingDirectory,
       notionApiKey: userConfig.api_key,
       notionDatabaseId: userConfig.database_id,
     };

     result = await generateBlogMaterial(config, userConfig);
     branchForLog = dailyBranch;
  }
  const workspaceName = extractWorkspaceName(workingDirectory);
  const duration = Date.now() - startTime;

  console.log('\n📊 Pipeline Result:');
  console.log(`   Success: ${result.success}`);
  console.log(`   Mode: ${result.appended ? 'Appended to existing page' : 'Created new page'}`);
  console.log(`   Branches Analyzed: ${result.branchesAnalyzed}`);
  console.log(`   Blog Ideas Generated: ${result.blogIdeasGenerated}`);
  console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
  
  if (result.notionUrl) {
    console.log(`   Notion URL: ${result.notionUrl}`);
  }
  
  if (result.errors && result.errors.length > 0) {
    console.log(`   Errors: ${result.errors.join(', ')}`);
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    success: result.success,
    dailyBranch: branchForLog,
    workspaceName,
    result,
    duration,
  };
  const logFilePath = saveLog(logEntry);
  console.log(`   Log saved: ${logFilePath}`);

  if (userConfig.slack_webhook_url) {
    if (result.success) {
      await sendSlackSuccessNotification(
        userConfig.slack_webhook_url,
        result,
        workspaceName,
        branchForLog,
      );
    } else {
      await sendSlackFailureNotification(
        userConfig.slack_webhook_url,
        result,
        workspaceName,
        branchForLog,
        logFilePath,
      );
    }
  }

  process.exit(result.success ? 0 : 1);
}

main().catch(console.error);
