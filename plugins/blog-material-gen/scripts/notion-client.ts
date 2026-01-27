import { Client } from '@notionhq/client';
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints.js';
import type { DailyBranchData, NotionPageCreateResult, NotionCategory, TechOption, BranchMaterial } from './types.js';

const RATE_LIMIT_DELAY = 350;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createNotionClient(apiKey: string): Client {
  return new Client({ auth: apiKey });
}

export function extractDateFromBranch(branchName: string): string {
  const dateMatch = branchName.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }
  return new Date().toISOString().split('T')[0];
}

export function formatPageTitle(date: string): string {
  return `${date} 글쓰기 소재`;
}

function heading1(text: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'heading_1',
    heading_1: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function heading2(text: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function heading3(text: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'heading_3',
    heading_3: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function paragraph(text: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function bulletItem(text: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function codeBlock(code: string, language: string = 'typescript'): BlockObjectRequest {
  const validLanguages = [
    'abap', 'arduino', 'bash', 'basic', 'c', 'clojure', 'coffeescript', 'cpp', 'csharp', 'css',
    'dart', 'diff', 'docker', 'elixir', 'elm', 'erlang', 'flow', 'fortran', 'fsharp', 'gherkin',
    'glsl', 'go', 'graphql', 'groovy', 'haskell', 'html', 'java', 'javascript', 'json', 'julia',
    'kotlin', 'latex', 'less', 'lisp', 'livescript', 'lua', 'makefile', 'markdown', 'markup',
    'matlab', 'mermaid', 'nix', 'objective-c', 'ocaml', 'pascal', 'perl', 'php', 'plain text',
    'powershell', 'prolog', 'protobuf', 'python', 'r', 'reason', 'ruby', 'rust', 'sass', 'scala',
    'scheme', 'scss', 'shell', 'sql', 'swift', 'typescript', 'vb.net', 'verilog', 'vhdl', 'visual basic',
    'webassembly', 'xml', 'yaml', 'java/c/c++/c#',
  ];

  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rb: 'ruby',
    sh: 'shell',
    yml: 'yaml',
    text: 'plain text',
  };

  const normalizedLang = langMap[language] || language;
  const finalLang = validLanguages.includes(normalizedLang) ? normalizedLang : 'plain text';

  const truncatedCode = code.length > 2000 ? code.substring(0, 2000) + '\n// ... (truncated)' : code;

  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [{ type: 'text', text: { content: truncatedCode } }],
      language: finalLang as any,
    },
  };
}

function divider(): BlockObjectRequest {
  return {
    object: 'block',
    type: 'divider',
    divider: {},
  };
}

function callout(text: string, emoji: string = '💡'): BlockObjectRequest {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: [{ type: 'text', text: { content: text } }],
      icon: { type: 'emoji', emoji: emoji as any },
    },
  };
}

function linkPreview(url: string): BlockObjectRequest {
  return {
    object: 'block',
    type: 'link_preview',
    link_preview: {
      url,
    },
  };
}

function buildBranchMaterialBlocks(branch: BranchMaterial, workspaceName?: string): BlockObjectRequest[] {
  const branchTitle = workspaceName 
    ? `📌 [${workspaceName}] ${branch.name}`
    : `📌 ${branch.name}`;
    
  const blocks: BlockObjectRequest[] = [
    heading3(branchTitle),
  ];

  if (branch.requirements) {
    blocks.push(paragraph(`**요구사항**: ${branch.requirements}`));
  }

  if (branch.tech.length > 0) {
    blocks.push(bulletItem(`**주요 기술**: ${branch.tech.join(', ')}`));
  }

  if (branch.prUrl) {
    blocks.push(paragraph(`🔗 **PR**: [#${branch.prUrl.split('/').pop()}](${branch.prUrl})`));
    blocks.push(linkPreview(branch.prUrl));
  }

  if (branch.commitUrls.length > 0) {
    const commitsWithUrl = branch.commitUrls.filter((c) => c.url);
    if (commitsWithUrl.length > 0) {
      blocks.push(heading3('🔗 커밋'));
      for (const commit of commitsWithUrl.slice(0, 5)) {
        blocks.push(bulletItem(`[${commit.hash}](${commit.url})`));
      }
    }
  }

  if (branch.codeBlocks.length > 0) {
    blocks.push(heading3('코드 예제'));
    for (const codeB of branch.codeBlocks.slice(0, 3)) {
      if (codeB.description) {
        blocks.push(paragraph(codeB.description));
      }
      blocks.push(codeBlock(codeB.exampleCode, codeB.language));
    }
  }

  if (branch.troubleshooting.length > 0) {
    blocks.push(heading3('🔧 트러블슈팅'));
    for (const ts of branch.troubleshooting) {
      blocks.push(callout(`**문제**: ${ts.problem}`, '⚠️'));
      blocks.push(bulletItem(`**원인**: ${ts.cause}`));
      blocks.push(bulletItem(`**해결**: ${ts.solution}`));
    }
  }

  if (branch.learnings.length > 0) {
    blocks.push(heading3('💡 배운 점'));
    for (const learning of branch.learnings) {
      blocks.push(bulletItem(learning));
    }
  }

   if (branch.blogIdeaTitle) {
     blocks.push(callout(`**초안 포스트 아이디어**: ${branch.blogIdeaTitle}`, '📝'));
   }

   if (branch.llmDraft) {
     blocks.push(heading3('📝 블로그 초안'));
     blocks.push(paragraph(`**제목**: ${branch.llmDraft.title}`));
     
     if (branch.llmDraft.keyPoints.length > 0) {
       blocks.push(paragraph('**핵심 포인트**:'));
       for (const point of branch.llmDraft.keyPoints) {
         blocks.push(bulletItem(point));
       }
     }
     
     if (branch.llmDraft.codeExplanation) {
       blocks.push(paragraph(`**코드 설명**: ${branch.llmDraft.codeExplanation}`));
     }
   }

   blocks.push(divider());

   return blocks;
}

export function buildNotionBlocksForNew(data: DailyBranchData, workspaceName?: string): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];

  const sectionTitle = workspaceName
    ? `📌 [${workspaceName}] ${data.dailyBranch} 작업`
    : `📌 ${data.dailyBranch} 작업 총정리`;

  blocks.push(heading1(sectionTitle));
  blocks.push(paragraph(data.summary));
  blocks.push(divider());

  blocks.push(heading2('📝 기술 블로그 소재 목록'));
  for (const idea of data.blogIdeas) {
    blocks.push(
      bulletItem(`**${idea.title}**: ${idea.description} [${idea.tags.join(', ')}]`),
    );
  }
  blocks.push(divider());

  blocks.push(heading2('🔍 브랜치별 상세 재료'));
  for (const branch of data.branches) {
    blocks.push(...buildBranchMaterialBlocks(branch, workspaceName));
  }

  return blocks;
}

export function buildNotionBlocksForAppend(data: DailyBranchData, workspaceName: string): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];

  blocks.push(divider());
  blocks.push(heading1(`📌 [${workspaceName}] ${data.dailyBranch} 작업`));
  blocks.push(paragraph(data.summary));
  blocks.push(divider());

  blocks.push(heading2('📝 기술 블로그 소재 목록'));
  for (const idea of data.blogIdeas) {
    blocks.push(
      bulletItem(`**${idea.title}**: ${idea.description} [${idea.tags.join(', ')}]`),
    );
  }
  blocks.push(divider());

  blocks.push(heading2('🔍 브랜치별 상세 재료'));
  for (const branch of data.branches) {
    blocks.push(...buildBranchMaterialBlocks(branch, workspaceName));
  }

  return blocks;
}

function determineTechOption(techs: string[]): TechOption | undefined {
  const techMap: Record<string, TechOption> = {
    typescript: 'TypeScript',
    javascript: 'Javascript',
    tsx: 'TypeScript',
    jsx: 'Javascript',
    python: 'Python',
    swift: 'Flutter',
    kotlin: 'Flutter',
    vue: 'Vue',
    nuxt: 'Nuxt',
    astro: 'Astro',
    node: 'NodeJS',
    nodejs: 'NodeJS',
    csharp: 'C#',
    'c#': 'C#',
    go: 'Software',
    rust: 'Software',
    sql: 'Software',
  };

  for (const tech of techs) {
    const normalized = tech.toLowerCase();
    if (techMap[normalized]) {
      return techMap[normalized];
    }
  }

  return '공통';
}

export async function findExistingPageByDate(
  notion: Client,
  databaseId: string,
  date: string,
): Promise<{ id: string; url: string } | null> {
  const pageTitle = formatPageTitle(date);
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: '이름',
        title: {
          equals: pageTitle,
        },
      },
    });

    if (response.results.length > 0) {
      const page = response.results[0];
      const pageUrl = (page as any).url || `https://notion.so/${page.id.replace(/-/g, '')}`;
      return {
        id: page.id,
        url: pageUrl,
      };
    }

    return null;
  } catch (error) {
    console.error('Error searching for existing page:', error);
    return null;
  }
}

export async function appendToExistingPage(
  notion: Client,
  pageId: string,
  children: BlockObjectRequest[],
): Promise<void> {
  const batchSize = 100;
  
  for (let i = 0; i < children.length; i += batchSize) {
    const batch = children.slice(i, i + batchSize);
    console.log(`  📝 Appending block batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(children.length / batchSize)}...`);
    await notion.blocks.children.append({
      block_id: pageId,
      children: batch,
    });
    await delay(RATE_LIMIT_DELAY);
  }
}

export async function createOrAppendBlogMaterialPage(
  notion: Client,
  databaseId: string,
  data: DailyBranchData,
  workspaceName: string,
): Promise<NotionPageCreateResult & { appended: boolean }> {
  const date = extractDateFromBranch(data.dailyBranch);
  const pageTitle = formatPageTitle(date);

  const existingPage = await findExistingPageByDate(notion, databaseId, date);
  await delay(RATE_LIMIT_DELAY);

  if (existingPage) {
    console.log(`📄 Found existing page for ${date}, appending content...`);
    const appendBlocks = buildNotionBlocksForAppend(data, workspaceName);
    await appendToExistingPage(notion, existingPage.id, appendBlocks);
    
    return {
      id: existingPage.id,
      url: existingPage.url,
      created_time: new Date().toISOString(),
      appended: true,
    };
  }

  console.log(`📄 Creating new page for ${date}...`);
  const children = buildNotionBlocksForNew(data, workspaceName);

  const category: NotionCategory = data.blogIdeas[0]?.category || '기술 블로그';
  const techOption = determineTechOption(data.tech);

  const properties: Record<string, any> = {
    이름: {
      title: [{ text: { content: pageTitle } }],
    },
    상태: {
      status: { name: '작성 전' },
    },
    종류: {
      select: { name: category },
    },
  };

  if (techOption) {
    properties['기술'] = {
      select: { name: techOption },
    };
  }

  const batchSize = 100;
  const firstBatch = children.slice(0, batchSize);
  const remainingBatches: BlockObjectRequest[][] = [];
  
  for (let i = batchSize; i < children.length; i += batchSize) {
    remainingBatches.push(children.slice(i, i + batchSize));
  }

  console.log(`📄 Creating Notion page with ${children.length} blocks...`);

  const response = await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: databaseId,
    },
    properties,
    children: firstBatch,
  });

  await delay(RATE_LIMIT_DELAY);

  for (let i = 0; i < remainingBatches.length; i++) {
    console.log(`  📝 Appending block batch ${i + 2}/${remainingBatches.length + 1}...`);
    await notion.blocks.children.append({
      block_id: response.id,
      children: remainingBatches[i],
    });
    await delay(RATE_LIMIT_DELAY);
  }

  const pageUrl = (response as any).url || `https://notion.so/${response.id.replace(/-/g, '')}`;

  return {
    id: response.id,
    url: pageUrl,
    created_time: (response as any).created_time,
    appended: false,
  };
}

export async function testNotionConnection(notion: Client, databaseId: string): Promise<boolean> {
  try {
    await notion.databases.retrieve({ database_id: databaseId });
    return true;
  } catch (error) {
    console.error('Notion connection test failed:', error);
    return false;
  }
}
