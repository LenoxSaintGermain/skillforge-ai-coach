
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const HeroAnimation = () => {
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-xl shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-skillforge-primary/10 to-skillforge-secondary/10"></div>
      
      {/* Dashboard mockup with animation */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <div className="w-full max-w-4xl bg-background border rounded-lg shadow-xl overflow-hidden">
          {/* Header mock */}
          <div className="h-10 bg-background border-b flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-4 h-4 w-40 bg-muted rounded"></div>
          </div>
          
          {/* Content mock */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="h-8 w-1/2 bg-muted rounded mb-4"></div>
                <div className="h-4 w-full bg-muted/60 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-muted/60 rounded mb-6"></div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="h-24 bg-muted/40 rounded"></div>
                  <div className="h-24 bg-muted/40 rounded"></div>
                </div>
                
                <div className="h-40 bg-muted/30 rounded"></div>
              </div>
              
              <div className="col-span-1">
                <div className="h-8 w-full bg-skillforge-primary/20 rounded mb-4"></div>
                <div className="h-20 w-full bg-muted/50 rounded mb-3"></div>
                <div className="h-20 w-full bg-muted/50 rounded mb-3"></div>
                <div className="h-20 w-full bg-muted/50 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Floating elements */}
      <motion.div 
        className="absolute w-20 h-20 rounded-full bg-skillforge-primary/20 blur-lg"
        initial={{ x: -100, y: 50 }}
        animate={{ x: -50, y: 100 }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
      />
      
      <motion.div 
        className="absolute w-32 h-32 right-20 top-10 rounded-full bg-skillforge-secondary/10 blur-xl"
        initial={{ x: 100, y: -50 }}
        animate={{ x: 50, y: -100 }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          repeatType: "reverse"
        }}
      />
      
      {/* Code snippets floating */}
      <motion.div
        className="absolute top-10 left-10 px-4 py-2 bg-black/80 rounded-lg text-green-400 text-xs font-mono"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <div>gemini.generateContent("Create AI solution for...")</div>
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-10 px-4 py-2 bg-black/80 rounded-lg text-blue-400 text-xs font-mono"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div>{"const response = await aiCoach.suggest(scenario);"}</div>
      </motion.div>
    </div>
  );
};

export default HeroAnimation;
