import React, { useState, useEffect, useCallback } from 'react';
import { tokenizerService } from './services/tokenizerService';
import { EncodingType, TokenStats } from './types';
import { MODELS } from './constants';
import StatCard from './components/StatCard';

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [encoding, setEncoding] = useState<EncodingType>('o200k_base');
  const [stats, setStats] = useState<TokenStats>({ tokens: 0, words: 0, characters: 0 });
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const calculateStats = useCallback((val: string) => {
    const tokens = tokenizerService.countTokens(val);
    const words = tokenizerService.countWords(val);
    const characters = tokenizerService.countCharacters(val);
    setStats({ tokens, words, characters });
  }, [encoding]);

  // Initialize tokenizer
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const success = await tokenizerService.init(encoding);
      if (isMounted) {
        if (success) {
          setIsReady(true);
          setError(null);
          calculateStats(text);
        } else {
          setError('Failed to load tokenizer engine. Please refresh.');
          setIsReady(false);
        }
      }
    };
    init();
    return () => { isMounted = false; };
  }, [encoding, calculateStats, text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (isReady) calculateStats(val);
  };

  const handleClear = () => {
    setText('');
    setStats({ tokens: 0, words: 0, characters: 0 });
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm" role="banner">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">AI Token Counter</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official Tiktoken Engine</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 ${isReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'}`}>
              <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {isReady ? 'System Active' : 'Initializing Engine...'}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full" role="main">
        {/* Model Selection */}
        <section aria-labelledby="tokenizer-selector">
          <h2 id="tokenizer-selector" className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">Select Tokenizer Encoding</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {MODELS.map((model) => (
              <button
                key={model.id}
                disabled={!isReady && encoding !== model.id}
                onClick={() => setEncoding(model.id)}
                aria-pressed={encoding === model.id}
                className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  encoding === model.id
                    ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-50 shadow-sm'
                    : 'border-white bg-white hover:border-slate-200 hover:shadow-sm'
                } ${!isReady && encoding !== model.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`text-sm font-black ${encoding === model.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {model.label}
                </span>
                <span className="text-xs text-slate-500 mt-1 font-medium leading-snug">{model.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Input Area */}
        <section className="relative" aria-label="Text Entry">
          <label htmlFor="token-textarea" className="sr-only">Paste your text content here</label>
          <textarea
            id="token-textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="Paste text, code snippets, or prompts here to calculate tokens..."
            className="w-full h-80 p-8 text-lg bg-white border border-slate-200 rounded-[2.5rem] shadow-sm focus:ring-8 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all resize-none font-sans leading-relaxed"
          />
          <div className="absolute bottom-6 right-6 flex gap-3">
            {text && (
              <>
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all active:scale-95 shadow-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95"
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Resulting Text'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10" aria-label="Statistics">
          <StatCard
            label="Total Tokens"
            value={stats.tokens}
            colorClass="bg-emerald-50 text-emerald-600"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <StatCard
            label="Total Words"
            value={stats.words}
            colorClass="bg-blue-50 text-blue-600"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            label="Characters"
            value={stats.characters}
            colorClass="bg-purple-50 text-purple-600"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
          />
        </section>

        {/* SEO Article Section */}
        <article className="mt-20 border-t border-slate-200 pt-16 mb-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Understanding AI Tokenization</h2>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <section>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">What is a Token?</h3>
                <p>
                  In Large Language Models (LLMs), a <strong>token</strong> is the fundamental unit of text processing. A single token can be as short as one character or as long as a whole word. For English text, <strong>1,000 tokens are roughly 750 words</strong>.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Which Tokenizer Should I Use?</h3>
                <ul className="space-y-4">
                  <li>
                    <strong className="text-slate-900">o200k_base:</strong> The newest and most efficient tokenizer. Used by <strong>GPT-4o</strong>, GPT-4o-mini, and the o1/o3 reasoning models. It's much better at handling non-English text.
                  </li>
                  <li>
                    <strong className="text-slate-900">cl100k_base:</strong> The standard for <strong>GPT-4</strong> and GPT-3.5-Turbo. Most current enterprise applications use this.
                  </li>
                  <li>
                    <strong className="text-slate-900">p50k_base:</strong> Used by older code models and Davinci-class models.
                  </li>
                </ul>
              </section>

              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl mt-12">
                <h3 className="text-xl font-bold text-emerald-900 mb-2">Privacy First Calculation</h3>
                <p className="text-emerald-800 text-sm">
                  Our tool runs entirely in your browser using standard WebAssembly/JavaScript. Your data is <strong>never uploaded to any server</strong>, ensuring complete privacy for sensitive prompts and code.
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12" role="contentinfo">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-400">&copy; {new Date().getFullYear()} AI Token Counter &bull; Optimized for Google & Yandex</p>
          <p className="mt-2 text-[10px] text-slate-300 uppercase tracking-widest font-black">Not Affiliated with OpenAI</p>
        </div>
      </footer>
    </div>
  );
};

export default App;