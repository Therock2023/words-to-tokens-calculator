
import { getEncoding, Tiktoken } from "js-tiktoken";
import { EncodingType } from '../types';

class TokenizerService {
  private currentEncoder: Tiktoken | null = null;
  private currentModel: EncodingType | null = null;

  /**
   * Initializes the tokenizer for the specified model.
   * By using standard ESM imports via the importmap, the library is guaranteed 
   * to be available when the code executes.
   */
  async init(model: EncodingType): Promise<boolean> {
    // Return early if already initialized with the correct model
    if (this.currentModel === model && this.currentEncoder) return true;

    try {
      // Use the direct getEncoding export from js-tiktoken
      this.currentEncoder = getEncoding(model);
      this.currentModel = model;
      console.log(`Tokenizer initialized successfully for model: ${model}`);
      return true;
    } catch (error) {
      console.error(`Tiktoken Error: Failed to initialize encoder for ${model}:`, error);
      return false;
    }
  }

  countTokens(text: string): number {
    if (!this.currentEncoder || !text) return 0;
    try {
      const tokens = this.currentEncoder.encode(text);
      return tokens.length;
    } catch (error) {
      console.error('Tokenization calculation error:', error);
      return 0;
    }
  }

  countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  countCharacters(text: string): number {
    return text.length;
  }
}

export const tokenizerService = new TokenizerService();
