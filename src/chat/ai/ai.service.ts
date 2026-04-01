import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { config } from 'src/config';

export interface ChatContext {
  role: 'user' | 'assistant';
  content: string;
  name?: string;
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor() {
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  async generateResponse(
    userMessage: string,
    context: ChatContext[],
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Echo AI, a helpful assistant integrated into a team chat workspace. You help team members with questions, provide suggestions, and offer expertise when summoned with @ai. Keep responses concise and relevant to the conversation context.',
          },
          ...context,
          { role: 'user', content: userMessage },
        ],
        max_tokens: 500,
      });

      return (
        response.choices[0]?.message?.content ??
        'I was unable to generate a response. Please try again.'
      );
    } catch (err) {
      this.logger.error('OpenAI API error:', err);
      return 'I encountered an error while processing your request. Please try again.';
    }
  }
}
