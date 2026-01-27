export interface CommitInfo {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  files: string[];
  date: string;
  author: string;
}

export interface PRInfo {
  number: number;
  title: string;
  body: string;
  url: string;
  labels: string[];
  mergedAt?: string;
}

export interface FileChange {
  path: string;
  additions: number;
  deletions: number;
  diff: string;
  language?: string;
}

export interface BranchAnalysis {
  branchName: string;
  commits: CommitInfo[];
  prInfo?: PRInfo;
  filesChanged: FileChange[];
  summary: string;
}

export interface CodeBlock {
  language: string;
  realCode: string;
  exampleCode: string;
  description: string;
  filePath?: string;
}

export interface MaskingRule {
  name: string;
  pattern: RegExp;
  replacement: string;
}

export interface BlogIdea {
  title: string;
  description: string;
  tags: string[];
  category: NotionCategory;
}

export interface BranchMaterial {
  name: string;
  requirements: string;
  tech: string[];
  codeBlocks: CodeBlock[];
  troubleshooting: TroubleshootingItem[];
  learnings: string[];
  blogIdeaTitle: string;
  prUrl?: string;
  commitUrls: Array<{ hash: string; url: string }>;
  llmDraft?: BlogDraft;
}

export interface BlogDraft {
  title: string;
  keyPoints: string[];
  codeExplanation: string;
}

export interface TroubleshootingItem {
  problem: string;
  cause: string;
  solution: string;
}

export interface DailyBranchData {
  dailyBranch: string;
  date: string;
  summary: string;
  blogIdeas: BlogIdea[];
  branches: BranchMaterial[];
  tags: string[];
  tech: string[];
}

export type NotionCategory = '회고' | '기술 블로그' | '후기' | '독후감' | '리뷰' | '소프트 스킬' | '짤막 상식';
export type NotionStatus = '작성 전' | '작성 중' | '작성 완료' | '업로드';

export interface NotionDatabaseProperties {
  이름: string;
  기술?: TechOption;
  상태: NotionStatus;
  업로드날짜?: string;
  업로드링크?: string;
  종류: NotionCategory;
}

export interface NotionPageCreateResult {
  id: string;
  url: string;
  created_time: string;
}

export interface PipelineConfig {
  dailyBranch: string;
  workingDirectory: string;
  notionApiKey: string;
  notionDatabaseId: string;
  maxBranches?: number;
  includePrivateCode?: boolean;
}

export interface PipelineResult {
  success: boolean;
  notionUrl?: string;
  branchesAnalyzed: number;
  blogIdeasGenerated: number;
  appended?: boolean;
  errors?: string[];
}

export type ConventionalCommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'style'
  | 'refactor'
  | 'perf'
  | 'test'
  | 'chore'
  | 'ci'
  | 'build'
  | 'revert';

export const COMMIT_TYPE_MAP: Record<ConventionalCommitType, string> = {
  feat: '새 기능',
  fix: '버그 수정',
  docs: '문서화',
  style: '코드 스타일',
  refactor: '리팩토링',
  perf: '성능 개선',
  test: '테스트',
  chore: '기타 작업',
  ci: 'CI/CD',
  build: '빌드 설정',
  revert: '되돌리기',
};

export const TECH_SELECT_OPTIONS = [
  'Flutter',
  'Javascript',
  'TypeScript',
  'npm',
  'Astro',
  '프로덕트',
  'NodeJS',
  'WebAPI',
  'C#',
  'Python',
  'Nuxt',
  'Vue',
  'Software',
  '공통',
] as const;

export type TechOption = (typeof TECH_SELECT_OPTIONS)[number];
