'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ArrowDown, Brain, Music, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatWidgetProps {
  personalityScores?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  context?: string; // Current page context for smart suggestions
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ personalityScores, context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your Music Personality Assistant!\n\nI can help you understand your personality analysis, explain audio features, and suggest ways to explore new music based on your unique taste.\n\nHere are some questions to get you started:",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreStatedQuestions, setShowPreStatedQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-stated questions that appear when chat is first opened
  const getPreStatedQuestions = () => {
    return [
      { text: "How does this work?", question: "How does Music and You predict personality from music listening?" },
      { text: "What will I learn?", question: "What kind of insights can I expect from my music personality analysis?" },
      { text: "Is my data safe?", question: "How is my music data used and is it kept private?" },
      { text: "What does valence mean?", question: "Explain what valence means in music and how it relates to personality" },
      { text: "How accurate is this?", question: "How accurate is personality prediction from music? What should I know about these results?" }
    ];
  };

  // Quick reply suggestions based on context and personality scores
  const getQuickReplies = () => {
    const baseReplies = [
      "What's my highest personality trait?",
      "Explain valence in simple terms",
      "Why do I like this type of music?",
      "Suggest new music for me",
    ];

    const contextReplies: { [key: string]: string[] } = {
      analyze: [
        "Explain my Openness score",
        "What does high Extraversion mean?",
        "How accurate is this analysis?",
      ],
      data: [
        "What's my top genre saying about me?",
        "Explain my audio features",
        "Why do these songs cluster together?",
      ],
    };

    return context && contextReplies[context] 
      ? [...contextReplies[context], ...baseReplies.slice(0, 1)]
      : baseReplies.slice(0, 3);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Listen for external chat triggers
  useEffect(() => {
    const handleChatTrigger = (event: CustomEvent) => {
      const { question, context: triggerContext } = event.detail;
      setIsOpen(true);
      setTimeout(() => {
        sendMessage(question);
      }, 300); // Small delay to ensure chat is open
    };

    window.addEventListener('openChatWithQuestion', handleChatTrigger as EventListener);
    
    return () => {
      window.removeEventListener('openChatWithQuestion', handleChatTrigger as EventListener);
    };
  }, []);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowPreStatedQuestions(false); // Hide pre-stated questions after first message

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      content: 'Thinking...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
      const userId = localStorage.getItem('spotify_user_id');
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          user_id: userId,
          context: context,
          personality_scores: personalityScores,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(m => !m.isTyping);
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: data.response,
          sender: 'ai',
          timestamp: new Date(),
        };
        return [...withoutTyping, aiResponse];
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(m => !m.isTyping);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: "I'm having trouble connecting right now. Please try again in a moment! 🤖",
          sender: 'ai',
          timestamp: new Date(),
        };
        return [...withoutTyping, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage.trim());
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-full p-4 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-110 group"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
              AI
            </span>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Music AI Assistant</h3>
                <p className="text-white/80 text-sm">Ask me about your musical personality!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {message.isTyping ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
                      </div>
                      <span className="text-white/80 text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Pre-stated Questions */}
            {showPreStatedQuestions && (
              <div className="space-y-3">
                <h4 className="text-white/80 text-sm font-medium">Popular questions:</h4>
                <div className="grid gap-2">
                  {getPreStatedQuestions().map((item, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(item.question)}
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-200 text-left group"
                    >
                      <span className="text-white text-sm group-hover:text-emerald-300 transition-colors">
                        {item.text}
                      </span>
                      <MessageCircle className="w-4 h-4 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {!isLoading && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {getQuickReplies().map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-black/20">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your music personality..."
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white p-2 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
