import React, { useState, useEffect } from 'react';
import { Mic, X, Sparkles } from 'lucide-react';

interface QuestionInputProps {
  question: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  onChange,
  onClear,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeech =
        'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setSpeechSupported(hasSpeech);
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechSupported || disabled) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognitionClass =
        (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onChange(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition not initiated:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 transition-all duration-300">
      <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        {/* Subtle input prefix icon */}
        <div className="pl-3.5 text-indigo-400/80 pointer-events-none">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Question Text Input */}
        <input
          type="text"
          value={question}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask anything... (or concentrate mentally)"
          disabled={disabled}
          maxLength={140}
          className="w-full py-3 pl-2.5 pr-20 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none disabled:opacity-50"
        />

        {/* Action icons */}
        <div className="absolute right-2 flex items-center gap-1">
          {question && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Clear question"
              aria-label="Clear question"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {speechSupported && (
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              disabled={disabled}
              className={`p-1.5 rounded-lg transition ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
              }`}
              title={isListening ? 'Listening...' : 'Speak your question'}
              aria-label="Speak your question"
            >
              {isListening ? (
                <Mic className="w-4 h-4 text-rose-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
