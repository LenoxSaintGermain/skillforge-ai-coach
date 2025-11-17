import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const TypewriterPrompt = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const fullPrompt = "Generate a personalized learning scenario for prompt engineering...";
  
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullPrompt.length) {
        setDisplayedText(fullPrompt.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowResult(true), 500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
          <div className="flex-1">
            <p className="text-white/90 font-mono text-sm leading-relaxed">
              {displayedText}
              <span className="inline-block w-0.5 h-4 bg-white/80 ml-1 animate-pulse"></span>
            </p>
          </div>
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 mt-1" />
              <div className="flex-1 space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-500/20"
                >
                  <h4 className="text-white font-semibold mb-2">Your Scenario: "The Marketing Email Crisis"</h4>
                  <p className="text-white/70 text-sm">
                    Your CMO needs an AI-powered email campaign by tomorrow. You've never used prompt engineering before...
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/50 mb-1">Difficulty</p>
                    <p className="text-white text-sm font-medium">Beginner</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/50 mb-1">Duration</p>
                    <p className="text-white text-sm font-medium">15 mins</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-white/50 mb-1">Skills</p>
                    <p className="text-white text-sm font-medium">3 new</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TypewriterPrompt;
