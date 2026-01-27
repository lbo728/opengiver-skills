import OpenAI from 'openai';
import { BranchAnalysis } from './types.js';

export interface BlogDraftConfig {
  openai_api_key: string;
  openai_model: 'gpt-4o-mini' | 'gpt-4o';
}

export interface BlogDraft {
  title: string;
  keyPoints: string[];
  codeExplanation: string;
}

/**
 * Generate a structured blog draft from branch analysis using OpenAI
 * 
 * @param branchAnalysis - Analyzed branch data (commits, PR info, file changes)
 * @param config - OpenAI configuration (API key, model)
 * @returns BlogDraft with title, key points, and code explanation, or null on failure
 */
export async function generateBlogDraft(
  branchAnalysis: BranchAnalysis,
  config: BlogDraftConfig
): Promise<BlogDraft | null> {
  const client = new OpenAI({
    apiKey: config.openai_api_key,
  });

  const prompt = buildPrompt(branchAnalysis);
  const maxRetries = 3;
  const baseDelayMs = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[LLM] Attempt ${attempt + 1}/${maxRetries}: Generating blog draft...`);

      const response = await client.chat.completions.create({
        model: config.openai_model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Log token usage
      const usage = response.usage;
      console.log(`[LLM] Token usage - Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`);

      // Parse response
      const message = response.choices[0].message;
      if (!message.content) {
        throw new Error('Empty response from OpenAI');
      }

      const draft = parseResponse(message.content);
      console.log(`[LLM] ✅ Blog draft generated successfully`);
      return draft;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const delayMs = baseDelayMs * Math.pow(2, attempt);

      if (isLastAttempt) {
        console.error(`[LLM] ❌ Failed after ${maxRetries} attempts:`, error instanceof Error ? error.message : String(error));
        return null;
      }

      console.warn(`[LLM] ⚠️  Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  return null;
}

/**
 * Build the prompt for OpenAI based on branch analysis
 */
function buildPrompt(branchAnalysis: BranchAnalysis): string {
  const commitSummary = branchAnalysis.commits
    .map((c) => `- [${c.type}] ${c.subject}${c.body ? '\n  ' + c.body : ''}`)
    .join('\n');

  const filesSummary = branchAnalysis.filesChanged
    .slice(0, 5)
    .map((f) => `- ${f.path} (+${f.additions}/-${f.deletions})`)
    .join('\n');

  const prInfo = branchAnalysis.prInfo
    ? `PR #${branchAnalysis.prInfo.number}: ${branchAnalysis.prInfo.title}\n${branchAnalysis.prInfo.body}`
    : 'No PR information';

  return `당신은 기술 블로그 작성 전문가입니다. 다음 Git 브랜치 분석 데이터를 바탕으로 블로그 초안을 작성해주세요.

## 브랜치 정보
- 브랜치명: ${branchAnalysis.branchName}
- 요약: ${branchAnalysis.summary}

## 커밋 목록
${commitSummary}

## 변경된 파일 (상위 5개)
${filesSummary}

## PR 정보
${prInfo}

## 요청사항
다음 JSON 형식으로 응답해주세요:
\`\`\`json
{
  "title": "블로그 제목 (한국어)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "codeExplanation": "코드 변경사항에 대한 설명 (한국어, 2-3문장)"
}
\`\`\`

주의사항:
- 제목은 간결하고 매력적이어야 합니다
- 핵심 포인트는 3-5개여야 합니다
- 모든 텍스트는 한국어로 작성해주세요
- JSON만 응답해주세요 (추가 설명 없음)`;
}

/**
 * Parse JSON response from OpenAI
 */
function parseResponse(text: string): BlogDraft {
  // Extract JSON from markdown code block if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  const parsed = JSON.parse(jsonStr);

  return {
    title: parsed.title || 'Untitled',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    codeExplanation: parsed.codeExplanation || '',
  };
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
