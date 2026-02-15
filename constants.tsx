
import React from 'react';
import { ModelOption } from './types';

export const MODELS: ModelOption[] = [
  {
    id: 'o200k_base',
    label: 'GPT-4o / o1 / o3',
    description: 'Latest high-efficiency tokenizer for Omni models.'
  },
  {
    id: 'cl100k_base',
    label: 'GPT-4 / GPT-3.5',
    description: 'Standard tokenizer for most production LLMs.'
  },
  {
    id: 'p50k_base',
    label: 'Codex / Davinci',
    description: 'Used by older code-specific and Davinci models.'
  }
];

export const APP_CONFIG = {
  primaryColor: '#10a37f',
  secondaryColor: '#f4f4f9'
};
