
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
          setError('The Tokenization Engine failed to load. Please refresh.');
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
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm" role="banner">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-none">AI Token Counter</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official Tiktoken Logic</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 ${isReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'}`}>
              <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {isReady ? 'System Active' : 'Loading Engine...'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full" role="main">
        {/* Model Selection Context */}
        <section aria-labelledby="model-selection-heading">
          <h2 id="model-selection-heading" className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Select LLM Tokenizer Encoding</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {MODELS.map((model) => (
              <button
                key={model.id}
                disabled={!isReady && encoding !== model.id}
                onClick={() => setEncoding(model.id)}
                aria-pressed={encoding === model.id}
                className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  encoding === model.id
                    ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-50'
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

        {/* Text Input Section */}
        <section aria-label="Text Tokenization Tool">
          <div className="relative group">
            <label htmlFor="token-input" className="sr-only">Paste your text here</label>
            <textarea
              id="token-input"
              value={text}
              onChange={handleTextChange}
              placeholder="Paste your text or code snippets here to calculate exact token count..."
              className="w-full h-80 p-6 text-lg bg-white border border-slate-200 rounded-[2rem] shadow-sm focus:ring-8 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all resize-none font-sans leading-relaxed"
            />
            <div className="absolute bottom-6 right-6 flex gap-2">
              {text && (
                <>
                  <button
                    onClick={handleClear}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all active:scale-95"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
                  >
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Results / Stats Dashboard */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10" aria-label="Counting Results">
          <StatCard
            label="Tokens"
            value={stats.tokens}
            colorClass="bg-emerald-50 text-emerald-600"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <StatCard
            label="Words"
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

        {/* Informational SEO Content Section */}
        <article className="mt-20 border-t border-slate-200 pt-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Expert Guide: AI Tokenization</h2>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <section>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">What is an AI Token?</h3>
                <p>
                  In the world of Large Language Models (LLMs), a <strong>token</strong> is the fundamental unit of measurement. While humans count by words or sentences, models like <span className="text-emerald-600 font-semibold">GPT-4o</span> see chunks of characters. These chunks are generated using <strong>Byte Pair Encoding (BPE)</strong>.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">GPT-4o vs GPT-4 Tokenizer (o200k vs cl100k)</h3>
                <p>
                  OpenAI's latest model, <strong>GPT-4o</strong>, uses the <code>o200k_base</code> tokenizer. This is significantly more efficient for non-English languages compared to the older <code>cl100k_base</code> used in <strong>GPT-4</strong>. Using the correct tokenizer is vital for calculating costs and staying within <strong>Context Window</strong> limits (e.g., 128k tokens).
                </p>
              </section>

              <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm mt-12">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Why Accurate Token Counting Matters
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="text-emerald-500 font-black">01</span>
                    <p><strong className="text-slate-900">Cost Optimization:</strong> API providers charge per 1k tokens. Predicting your spend prevents billing surprises.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-emerald-500 font-black">02</span>
                    <p><strong className="text-slate-900">Model Memory:</strong> Every model has a hard limit. Exceeding it causes the model to "forget" earlier parts of the conversation.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-emerald-500 font-black">03</span>
                    <p><strong className="text-slate-900">Privacy:</strong> Our tool runs 100% client-side. Your proprietary prompts never leave your device.</p>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </article>
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white py-12 text-center text-slate-500" role="contentinfo">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-sm font-semibold">&copy; {new Date().getFullYear()} AI Token Counter &bull; Built with js-tiktoken</p>
          <div className="flex justify-center gap-6 mt-4 text-xs font-bold text-slate-400">
            <span className="hover:text-emerald-600 cursor-default transition-colors">PRIVACY POLICY</span>
            <span className="hover:text-emerald-600 cursor-default transition-colors">TERMS OF SERVICE</span>
            <span className="hover:text-emerald-600 cursor-default transition-colors">API DOCS</span>
          </div>
          <p className="mt-6 text-[10px] text-slate-300 max-w-lg mx-auto leading-relaxed">
            All calculations are performed locally using standard BPE algorithms. Not officially affiliated with OpenAI, Anthropic, or Google.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
