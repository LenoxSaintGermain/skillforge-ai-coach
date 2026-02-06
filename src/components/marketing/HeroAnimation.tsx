
import React from "react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroAnimation = () => {
  return (
    <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden rounded-2xl shadow-2xl">
      {/* Main hero image with parallax effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img 
          src={heroBanner} 
          alt="AI-powered skill transformation" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-skillforge-primary/20 to-skillforge-secondary/20 mix-blend-overlay" />
      </motion.div>

      {/* Animated glow effects */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-skillforge-primary/30 via-transparent to-skillforge-secondary/30"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      {/* Floating UI elements */}
      <motion.div
        className="absolute top-8 left-8 px-4 py-3 bg-background/90 backdrop-blur-md rounded-lg border border-border/50 shadow-xl"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">AI Coach Active</span>
        </div>
      </motion.div>

      {/* Code snippet floating card */}
      <motion.div
        className="absolute top-8 right-8 max-w-xs px-4 py-3 bg-black/90 backdrop-blur-md rounded-lg border border-skillforge-primary/30 shadow-xl"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="text-xs font-mono">
          <span className="text-skillforge-primary">const</span>{" "}
          <span className="text-cyan-400">learning</span>{" "}
          <span className="text-white">=</span>{" "}
          <span className="text-yellow-400">await</span>{" "}
          <span className="text-green-400">gemini</span>
          <span className="text-white">.generate(</span>
        </div>
        <div className="text-xs font-mono pl-4">
          <span className="text-orange-400">"personalized curriculum"</span>
        </div>
        <div className="text-xs font-mono">
          <span className="text-white">);</span>
        </div>
      </motion.div>

      {/* Bottom stats bar */}
      <motion.div
        className="absolute bottom-6 left-6 right-6 flex flex-wrap justify-center gap-4 md:gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        {[
          { label: "Active Learners", value: "2.5K+" },
          { label: "Scenarios", value: "50+" },
          { label: "Skill Paths", value: "12" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="px-4 py-2 bg-background/80 backdrop-blur-md rounded-lg border border-border/50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 + i * 0.1, duration: 0.4 }}
          >
            <div className="text-lg md:text-xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Animated particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-skillforge-primary/60"
          style={{
            left: `${15 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default HeroAnimation;
