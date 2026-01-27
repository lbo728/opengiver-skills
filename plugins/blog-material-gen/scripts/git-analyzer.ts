import simpleGit, { SimpleGit } from 'simple-git';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { BranchAnalysis, CommitInfo, FileChange, PRInfo, ConventionalCommitType } from './types.js';

const execAsync = promisify(exec);

const CONVENTIONAL_COMMIT_REGEX = /^(\w+)(?:\(([^)]+)\))?!?:\s*(.+)$/;

function parseConventionalCommit(message: string): { type: string; scope?: string; subject: string } {
  const match = message.match(CONVENTIONAL_COMMIT_REGEX);
  if (match) {
    return {
      type: match[1],
      scope: match[2],
      subject: match[3],
    };
  }
  return {
    type: 'chore',
    subject: message,
  };
}

function detectLanguage(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    py: 'python',
    swift: 'swift',
    kt: 'kotlin',
    java: 'java',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    vue: 'vue',
    svelte: 'svelte',
    css: 'css',
    scss: 'scss',
    html: 'html',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
  };
  return ext ? langMap[ext] : undefined;
}

export async function getMergedBranches(
  git: SimpleGit,
  dailyBranch: string,
): Promise<string[]> {
  try {
    const log = await git.log([
      '--all',
      '--merges',
      `--grep=Merge pull request.*into ${dailyBranch}`,
      '--format=%s',
    ]);

    const branchNames: string[] = [];
    for (const commit of log.all) {
      const match = commit.message.match(/from\s+[\w-]+\/(.+)/);
      if (match) {
        branchNames.push(match[1]);
      }
    }

    if (branchNames.length === 0) {
      const mergeLog = await git.log([dailyBranch, '--merges', '--format=%s']);
      for (const commit of mergeLog.all) {
        const match = commit.message.match(/Merge (?:pull request #\d+ from [\w-]+\/|branch ')(.+?)(?:'| into)/);
        if (match) {
          branchNames.push(match[1]);
        }
      }
    }

    return [...new Set(branchNames)];
  } catch (error) {
    console.error('Error getting merged branches:', error);
    return [];
  }
}

export async function getCommitsForBranch(
  git: SimpleGit,
  branchName: string,
  baseBranch: string,
): Promise<CommitInfo[]> {
  try {
    const refRange = `${baseBranch}..${branchName}`;
    let log;
    
    try {
      log = await git.log([refRange, '--format=%H|%s|%b|%ai|%an', '--no-merges']);
    } catch {
      log = await git.log(['--all', `--grep=${branchName}`, '--format=%H|%s|%b|%ai|%an', '-10']);
    }

    const commits: CommitInfo[] = [];
    for (const commit of log.all) {
      const [hash, subject, body, date, author] = (commit.message || '').split('|');
      if (!hash || !subject) continue;

      const parsed = parseConventionalCommit(subject);
      
      let files: string[] = [];
      try {
        const diffSummary = await git.diffSummary([`${hash}^`, hash]);
        files = diffSummary.files.map((f) => f.file);
      } catch {
        files = [];
      }

      commits.push({
        hash: hash.substring(0, 7),
        type: parsed.type,
        scope: parsed.scope,
        subject: parsed.subject,
        body: body || undefined,
        files,
        date,
        author,
      });
    }

    return commits;
  } catch (error) {
    console.error(`Error getting commits for ${branchName}:`, error);
    return [];
  }
}

export async function getPRInfo(branchName: string, baseBranch: string): Promise<PRInfo | undefined> {
  try {
    const { stdout } = await execAsync(
      `gh pr list --search "head:${branchName} base:${baseBranch}" --json number,title,body,url,labels,mergedAt --limit 1`,
    );

    const prs = JSON.parse(stdout);
    if (prs.length === 0) return undefined;

    const pr = prs[0];
    return {
      number: pr.number,
      title: pr.title,
      body: pr.body || '',
      url: pr.url,
      labels: pr.labels?.map((l: { name: string }) => l.name) || [],
      mergedAt: pr.mergedAt,
    };
  } catch (error) {
    console.error(`Error getting PR info for ${branchName}:`, error);
    return undefined;
  }
}

export async function getFilesChanged(
  git: SimpleGit,
  branchName: string,
  baseBranch: string,
): Promise<FileChange[]> {
  try {
    let diffSummary;
    try {
      diffSummary = await git.diffSummary([baseBranch, branchName]);
    } catch {
      diffSummary = await git.diffSummary(['HEAD~5', 'HEAD']);
    }

    const fileChanges: FileChange[] = [];
    for (const file of diffSummary.files.slice(0, 20)) {
      let diff = '';
      try {
        diff = await git.diff([baseBranch, branchName, '--', file.file]);
        if (diff.length > 5000) {
          diff = diff.substring(0, 5000) + '\n... (truncated)';
        }
      } catch {
        diff = '';
      }

      fileChanges.push({
        path: file.file,
        additions: file.insertions,
        deletions: file.deletions,
        diff,
        language: detectLanguage(file.file),
      });
    }

    return fileChanges;
  } catch (error) {
    console.error(`Error getting files changed for ${branchName}:`, error);
    return [];
  }
}

function generateBranchSummary(commits: CommitInfo[], filesChanged: FileChange[]): string {
  const commitTypes = commits.reduce(
    (acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const typeDescriptions = Object.entries(commitTypes)
    .map(([type, count]) => `${type}(${count})`)
    .join(', ');

  const languages = [...new Set(filesChanged.map((f) => f.language).filter(Boolean))];
  const totalAdditions = filesChanged.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = filesChanged.reduce((sum, f) => sum + f.deletions, 0);

  return `${commits.length}개 커밋 (${typeDescriptions}), ${filesChanged.length}개 파일 변경 (+${totalAdditions}/-${totalDeletions}), 주요 언어: ${languages.join(', ') || 'N/A'}`;
}

export class BranchNotFoundError extends Error {
  constructor(branchName: string) {
    super(`Branch '${branchName}' does not exist. Please check the branch name and try again.`);
    this.name = 'BranchNotFoundError';
  }
}

export class NoMergedBranchesError extends Error {
  constructor(dailyBranch: string) {
    super(`No merged PR branches found in '${dailyBranch}'. Make sure there are merged PRs into this branch.`);
    this.name = 'NoMergedBranchesError';
  }
}

export async function analyzeDailyBranch(
  dailyBranch: string,
  workingDirectory: string,
): Promise<BranchAnalysis[]> {
  const git: SimpleGit = simpleGit(workingDirectory);

  console.log(`📂 Analyzing daily branch: ${dailyBranch}`);
  console.log(`📁 Working directory: ${workingDirectory}`);

  const exists = await branchExists(workingDirectory, dailyBranch);
  if (!exists) {
    throw new BranchNotFoundError(dailyBranch);
  }

  const featureBranches = await getMergedBranches(git, dailyBranch);
  console.log(`🔍 Found ${featureBranches.length} merged PR branches`);

  if (featureBranches.length === 0) {
    throw new NoMergedBranchesError(dailyBranch);
  }

  const analyses: BranchAnalysis[] = [];

  for (const branch of featureBranches) {
    console.log(`  📌 Analyzing branch: ${branch}`);

    const commits = await getCommitsForBranch(git, branch, dailyBranch);
    const prInfo = await getPRInfo(branch, dailyBranch);
    const filesChanged = await getFilesChanged(git, branch, dailyBranch);

    analyses.push({
      branchName: branch,
      commits,
      prInfo,
      filesChanged,
      summary: generateBranchSummary(commits, filesChanged),
    });
  }

  return analyses;
}

export async function getCurrentBranch(workingDirectory: string): Promise<string> {
  const git: SimpleGit = simpleGit(workingDirectory);
  const status = await git.status();
  return status.current || 'main';
}

export async function getRecentDailyBranches(workingDirectory: string): Promise<string[]> {
  const git: SimpleGit = simpleGit(workingDirectory);
  try {
    const branches = await git.branch(['-a']);
    return branches.all
      .filter((b) => b.includes('daily/'))
      .map((b) => b.replace('remotes/origin/', ''))
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
      .reverse()
      .slice(0, 10);
  } catch {
    return [];
  }
}

export async function branchExists(workingDirectory: string, branchName: string): Promise<boolean> {
  const git: SimpleGit = simpleGit(workingDirectory);
  try {
    const branches = await git.branch(['-a']);
    const normalizedBranches = branches.all.map((b) => b.replace('remotes/origin/', ''));
    return normalizedBranches.some((b) => b === branchName || b.endsWith(`/${branchName}`));
  } catch {
    return false;
  }
}

export async function findBaseBranch(workingDirectory: string, currentBranch: string): Promise<string> {
  const git: SimpleGit = simpleGit(workingDirectory);
  const candidates = ['main', 'master', 'develop', 'dev'];
  
  try {
    const branches = await git.branch(['-a']);
    const dailyBranches = branches.all
      .filter((b) => b.includes('daily/'))
      .map((b) => b.replace('remotes/origin/', ''));
    candidates.push(...dailyBranches);
  } catch {
  }

  // Try local branches first, then remote refs (for worktree support)
  const candidatesWithRemote: string[] = [];
  for (const candidate of candidates) {
    candidatesWithRemote.push(candidate);
    candidatesWithRemote.push(`origin/${candidate}`);
  }

  const attemptedBranches: string[] = [];
  for (const candidate of candidatesWithRemote) {
    attemptedBranches.push(candidate);
    try {
      const mergeBase = await git.raw(['merge-base', currentBranch, candidate]);
      if (mergeBase.trim()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  // Throw clear error with list of attempted branches
  throw new Error(`Base branch not found. Tried: ${attemptedBranches.join(', ')}`);
}

export async function analyzeCurrentBranchOnly(
  workingDirectory: string,
): Promise<BranchAnalysis> {
  const git: SimpleGit = simpleGit(workingDirectory);
  
  // Fetch latest remote refs for worktree support
  console.log(`🔄 Fetching latest remote refs...`);
  await git.fetch(['origin']);
  
  const currentBranch = await getCurrentBranch(workingDirectory);
  
  console.log(`📂 Analyzing current branch: ${currentBranch}`);
  console.log(`📁 Working directory: ${workingDirectory}`);

  const baseBranch = await findBaseBranch(workingDirectory, currentBranch);
  console.log(`🔀 Base branch detected: ${baseBranch}`);

  const commits = await getCommitsForCurrentBranch(git, currentBranch, baseBranch);
  console.log(`📝 Found ${commits.length} commits`);

  const prInfo = await getPRInfo(currentBranch, baseBranch);
  const filesChanged = await getFilesChanged(git, currentBranch, baseBranch);

  return {
    branchName: currentBranch,
    commits,
    prInfo,
    filesChanged,
    summary: generateCurrentBranchSummary(commits, filesChanged),
  };
}

async function getCommitsForCurrentBranch(
  git: SimpleGit,
  currentBranch: string,
  baseBranch: string,
): Promise<CommitInfo[]> {
  try {
    const mergeBase = await git.raw(['merge-base', currentBranch, baseBranch]);
    const refRange = `${mergeBase.trim()}..${currentBranch}`;
    
    const log = await git.log([refRange, '--format=%H|%s|%b|%ai|%an', '--no-merges']);

    const commits: CommitInfo[] = [];
    for (const commit of log.all) {
      const [hash, subject, body, date, author] = (commit.message || '').split('|');
      if (!hash || !subject) continue;

      const parsed = parseConventionalCommit(subject);
      
      let files: string[] = [];
      try {
        const diffSummary = await git.diffSummary([`${hash}^`, hash]);
        files = diffSummary.files.map((f) => f.file);
      } catch {
        files = [];
      }

      commits.push({
        hash: hash.substring(0, 7),
        type: parsed.type,
        scope: parsed.scope,
        subject: parsed.subject,
        body: body || undefined,
        files,
        date,
        author,
      });
    }

    return commits;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error getting commits between ${currentBranch} and ${baseBranch}: ${errorMsg}`);
    throw error;
  }
}

function generateCurrentBranchSummary(commits: CommitInfo[], filesChanged: FileChange[]): string {
  const commitTypes = commits.reduce(
    (acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const typeDescriptions = Object.entries(commitTypes)
    .map(([type, count]) => `${type}(${count})`)
    .join(', ');

  const languages = [...new Set(filesChanged.map((f) => f.language).filter(Boolean))];
  const totalAdditions = filesChanged.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = filesChanged.reduce((sum, f) => sum + f.deletions, 0);

  return `${commits.length}개 커밋 (${typeDescriptions}), ${filesChanged.length}개 파일 변경 (+${totalAdditions}/-${totalDeletions}), 주요 언어: ${languages.join(', ') || 'N/A'}`;
}
