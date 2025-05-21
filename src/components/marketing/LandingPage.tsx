
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Target, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FeatureShowcase from "./FeatureShowcase";
import TestimonialCarousel from "./TestimonialCarousel";
import HeroAnimation from "./HeroAnimation";

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage = ({ onEnterApp }: LandingPageProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "AI-Powered Scenarios",
      description: "Practice real-world AI implementation with dynamic scenarios tailored to your skill level.",
      icon: <Brain className="w-8 h-8 text-skillforge-primary" />,
      color: "bg-gradient-to-br from-skillforge-primary to-skillforge-light"
    },
    {
      title: "Personalized Learning",
      description: "Custom AI coach that adapts to your progress and provides focused guidance.",
      icon: <Target className="w-8 h-8 text-skillforge-secondary" />,
      color: "bg-gradient-to-br from-skillforge-secondary to-skillforge-light"
    },
    {
      title: "Industry Relevant",
      description: "Scenarios based on real-world industry challenges and use cases.",
      icon: <Users className="w-8 h-8 text-skillforge-dark" />,
      color: "bg-gradient-to-br from-skillforge-dark to-skillforge-light"
    },
    {
      title: "Skill Growth Tracking",
      description: "Visualize your progress and master AI implementation skills over time.",
      icon: <Trophy className="w-8 h-8 text-coach-DEFAULT" />,
      color: "bg-gradient-to-br from-coach-DEFAULT to-coach-light"
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

      {/* Testimonials */}
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
              Success Stories
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              See what our users are saying about their experience
            </motion.p>
          </div>
          
          <TestimonialCarousel />
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
