import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GoogleProvider } from './providers/google.js';
import type { LLMConfig, LLMProvider, BlogDraft } from './types.js';

export type { LLMConfig, LLMProvider, BlogDraft };

export function createProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider({ api_key: config.api_key, model: config.model });
    case 'anthropic':
      return new AnthropicProvider({ api_key: config.api_key, model: config.model });
    case 'google':
      return new GoogleProvider({ api_key: config.api_key, model: config.model });
    default:
      throw new Error(`Unknown provider: ${(config as LLMConfig).provider}`);
  }
}
