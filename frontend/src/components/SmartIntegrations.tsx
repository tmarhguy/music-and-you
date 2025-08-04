'use client';

import React from 'react';
import { HelpCircle, MessageCircle, Brain, Lightbulb } from 'lucide-react';

interface SmartTooltipProps {
  type: 'trait' | 'feature' | 'insight';
  title: string;
  content: string;
  onAskAI?: () => void;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ 
  type, 
  title, 
  content, 
  onAskAI 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'trait':
        return <Brain className="w-4 h-4" />;
      case 'feature':
        return <HelpCircle className="w-4 h-4" />;
      case 'insight':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'trait':
        return 'from-emerald-500 to-cyan-500';
      case 'feature':
        return 'from-blue-500 to-purple-500';
      case 'insight':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="group relative inline-block">
      <button className={`p-1 rounded-full bg-gradient-to-r ${getColor()} text-white hover:scale-110 transition-all duration-200`}>
        {getIcon()}
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-white/10 max-w-xs">
          <h4 className="font-semibold mb-2">{title}</h4>
          <p className="text-sm text-slate-300 mb-3">{content}</p>
          
          {onAskAI && (
            <button
              onClick={onAskAI}
              className="flex items-center gap-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-full transition-colors duration-200"
            >
              <MessageCircle className="w-3 h-3" />
              Ask AI for more
            </button>
          )}
        </div>
        
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};

interface AskAIButtonProps {
  question: string;
  context?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  onAsk?: (question: string) => void;
}

export const AskAIButton: React.FC<AskAIButtonProps> = ({ 
  question, 
  context, 
  variant = 'primary',
  size = 'md',
  onAsk 
}) => {
  const handleClick = () => {
    if (onAsk) {
      onAsk(question);
    } else {
      // Default behavior - could trigger chat widget with pre-filled question
      const event = new CustomEvent('openChatWithQuestion', { 
        detail: { question, context } 
      });
      window.dispatchEvent(event);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center gap-2 rounded-full transition-all duration-200 font-medium";
    
    const sizeClasses = {
      sm: "px-3 py-1 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    const variantClasses = {
      primary: "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-emerald-500/25",
      secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
      minimal: "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  return (
    <button
      onClick={handleClick}
      className={getButtonClasses()}
    >
      <Brain className="w-4 h-4" />
      Ask AI
    </button>
  );
};

interface ChatTriggerProps {
  children: React.ReactNode;
  question: string;
  context?: string;
  className?: string;
}

export const ChatTrigger: React.FC<ChatTriggerProps> = ({ 
  children, 
  question, 
  context, 
  className = "" 
}) => {
  const handleClick = () => {
    const event = new CustomEvent('openChatWithQuestion', { 
      detail: { question, context } 
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className={`group ${className}`}
    >
      {children}
      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200"></div>
    </button>
  );
};

interface ContextSuggestionsProps {
  context: 'analyze' | 'data' | 'home';
  personalityScores?: any;
  className?: string;
}

export const ContextSuggestions: React.FC<ContextSuggestionsProps> = ({ 
  context, 
  personalityScores, 
  className = "" 
}) => {
  const getSuggestions = () => {
    switch (context) {
      case 'analyze':
        return [
          { icon: "", text: "What does my highest trait mean?", question: "Explain my highest personality trait and what it says about my music taste" },
          { icon: "", text: "How accurate is this?", question: "How accurate is personality prediction from music? What should I know about these results?" },
          { icon: "", text: "Find similar music", question: "Based on my personality analysis, suggest new music I might like" }
        ];
      case 'data':
        return [
          { icon: "", text: "Explain my audio features", question: "What do the audio features of my music say about my personality?" },
          { icon: "", text: "Top genre insights", question: "What does my top genre reveal about my personality?" },
          { icon: "", text: "Listening patterns", question: "What do my listening patterns and habits say about me?" }
        ];
      case 'home':
        return [
          { icon: "", text: "How does this work?", question: "How does Music and You predict personality from music listening?" },
          { icon: "", text: "What will I learn?", question: "What kind of insights can I expect from my music personality analysis?" },
          { icon: "", text: "Is my data safe?", question: "How is my music data used and is it kept private?" }
        ];
      default:
        return [];
    }
  };

  const handleSuggestionClick = (question: string) => {
    const event = new CustomEvent('openChatWithQuestion', { 
      detail: { question, context } 
    });
    window.dispatchEvent(event);
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-white font-semibold text-sm flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-emerald-400" />
        Quick Questions
      </h3>
      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion.question)}
            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-200 text-left group"
          >
            <span className="text-white text-sm group-hover:text-emerald-300 transition-colors">
              {suggestion.text}
            </span>
            <MessageCircle className="w-4 h-4 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};
