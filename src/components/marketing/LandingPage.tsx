import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Lightbulb, Users, Rocket, BookOpen, Code, Sparkles, Eye, Heart, Zap, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FeatureShowcase from "./FeatureShowcase";
import TestimonialCarousel from "./TestimonialCarousel";
import HeroAnimation from "./HeroAnimation";
import UseCaseExplorer from "./UseCaseExplorer";
import ScrollReveal from "./ScrollReveal";
import LearningPathGenerator from "./LearningPathGenerator";

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage = ({ onEnterApp }: LandingPageProps) => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const personas = [
    {
      title: "The Curious Experimenter",
      description: "You don't want to read the manual—you want to open the hood and see how it works. You learn best by playing, breaking things, and discovering what happens.",
      icon: Wrench,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "The Practical Professional",
      description: "You need to use AI at work, not write papers about it. You need hands-on skills that solve real problems, not theoretical knowledge.",
      icon: Lightbulb,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "The Thoughtful Educator",
      description: "You're trying to understand what AI-native learning looks like—not to replace teaching, but to understand where education is going.",
      icon: BookOpen,
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "The Builder",
      description: "You're a developer, designer, or product person who learns by seeing working examples. The meta-experience matters to you.",
      icon: Code,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const features = [
    {
      title: "Dynamic Scenarios",
      description: "Real-world challenges that adapt to your learning journey, not templated lessons.",
      icon: <Zap className="w-8 h-8 text-skillforge-primary" />,
      color: "bg-gradient-to-br from-skillforge-primary/10 to-skillforge-primary/5"
    },
    {
      title: "AI Co-Developer",
      description: "Work alongside AI that generates, adapts, and evolves with you—not just answers questions.",
      icon: <Rocket className="w-8 h-8 text-skillforge-secondary" />,
      color: "bg-gradient-to-br from-skillforge-secondary/10 to-skillforge-secondary/5"
    },
    {
      title: "Learn by Building",
      description: "Practice implementing AI solutions in contexts that matter to your work.",
      icon: <Wrench className="w-8 h-8 text-skillforge-accent" />,
      color: "bg-gradient-to-br from-skillforge-accent/10 to-skillforge-accent/5"
    },
    {
      title: "Progressive Mastery",
      description: "From curious beginner to confident implementer through deliberate practice.",
      icon: <Eye className="w-8 h-8 text-skillforge-dark" />,
      color: "bg-gradient-to-br from-skillforge-dark/10 to-skillforge-dark/5"
    }
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      onEnterApp();
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-background overflow-x-hidden" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-skillforge-light to-transparent opacity-50"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-skillforge-light text-skillforge-primary text-sm font-medium mb-4">
                Welcome to SkillForge AI Coach
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-skillforge-primary via-skillforge-secondary to-skillforge-accent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Master AI Implementation Through Practice
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Supercharge your AI skills with personalized scenarios, expert coaching, and hands-on practice. Learn how to implement AI solutions in real-world business contexts.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                onClick={onEnterApp}
                className="text-lg px-8 py-6 bg-gradient-to-r from-skillforge-primary to-skillforge-secondary text-white hover:shadow-lg hover:opacity-90 transition-all group"
              >
                Start Your AI Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Press <kbd className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">Enter</kbd> to continue
              </p>
            </motion.div>
          </div>
          
          {/* Animated visual */}
          <div className="mt-16">
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="relative">
                Features <Sparkles className="absolute -top-6 -right-6 w-5 h-5 text-skillforge-secondary animate-pulse" />
              </span>
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Everything you need to master AI implementation skills
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="border-none shadow-lg h-full hover:shadow-xl transition-shadow overflow-hidden group">
                  <div className={`h-2 ${feature.color}`}></div>
                  <CardContent className="pt-6">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-background shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Our simple process to help you master AI implementation
            </motion.p>
          </div>
          
          <FeatureShowcase />
        </div>
      </section>

      {/* Learning Path Generator Section - MOVED BEFORE Use Case Explorer */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"
              >
                <GraduationCap className="w-8 h-8 text-primary" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Build Your <span className="bg-gradient-to-r from-skillforge-primary to-skillforge-secondary bg-clip-text text-transparent">Learning Path</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Access Google Cloud's extensive catalog of courses and labs. Let AI curate a personalized 
                curriculum, then practice your new skills in SkillForge.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <LearningPathGenerator onEnterApp={onEnterApp} />
          </ScrollReveal>
        </div>
      </section>

      {/* Use Case Explorer Section */}
      <section className="py-24 bg-muted/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"
              >
                <Lightbulb className="w-8 h-8 text-primary" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Discover What's <span className="text-primary">Possible</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore 20+ real-world AI applications from leading organizations. Find inspiration, 
                understand the impact, and start building your own solutions today.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-1">20+</div>
                  <div className="text-sm text-muted-foreground">Use Cases</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-1">5</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Real-World</div>
                </motion.div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <UseCaseExplorer />
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.5}>
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-lg font-medium">
                  Ready to bring these ideas to life?
                </p>
                <Button 
                  size="lg" 
                  onClick={onEnterApp}
                  className="group"
                >
                  Start Building with AI
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Explore <a 
                    href="https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    1,001+ more use cases
                  </a> from Google Cloud
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-skillforge-light/30 via-background to-skillforge-light/20 z-0"></div>
        <div className="container relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your AI Skills?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start practicing with real-world scenarios today and accelerate your journey to AI mastery.
            </p>
            <Button 
              size="lg" 
              onClick={onEnterApp}
              className="text-lg px-8 py-6 bg-gradient-to-r from-skillforge-primary to-skillforge-secondary text-white hover:shadow-lg hover:opacity-90 transition-all animate-pulse-slow"
            >
              Enter SkillForge AI Coach
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold">SkillForge AI Coach</h3>
              <p className="text-muted-foreground">Mastering AI implementation through practice</p>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">Terms</Button>
              <Button variant="ghost" size="sm">Privacy</Button>
              <Button variant="ghost" size="sm">Contact</Button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SkillForge AI Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
