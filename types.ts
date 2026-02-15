
export type EncodingType = 'o200k_base' | 'cl100k_base' | 'p50k_base' | 'r50k_base';

export interface TokenStats {
  tokens: number;
  words: number;
  characters: number;
}

export interface ModelOption {
  id: EncodingType;
  label: string;
  description: string;
}
