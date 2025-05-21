
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, BookCheck, MessageSquare, Award } from "lucide-react";

const FeatureShowcase = () => {
  const steps = [
    {
      icon: <BookOpen className="h-10 w-10 text-skillforge-primary" />,
      title: "Choose a Scenario",
      description: "Select from our library of industry-specific AI implementation scenarios or generate a custom one with Gemini."
    },
    {
      icon: <BookCheck className="h-10 w-10 text-skillforge-primary" />,
      title: "Practice Implementation",
      description: "Work through the scenario, implementing AI solutions as you would in a real-world setting."
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-skillforge-primary" />,
      title: "Get AI Coaching",
      description: "Receive personalized feedback and guidance from your AI coach to enhance your approach."
    },
    {
      icon: <Award className="h-10 w-10 text-skillforge-primary" />,
      title: "Track Progress",
      description: "Visualize your skill growth over time and identify areas for continued improvement."
    }
  ];

  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-skillforge-primary to-skillforge-secondary transform -translate-y-1/2 hidden md:block"></div>
      
      {/* Process Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="relative z-10 bg-background rounded-lg shadow-lg p-6 h-full border border-muted hover:border-skillforge-primary/20 transition-all">
              {/* Step number */}
              <div className="absolute -top-5 -left-2 w-10 h-10 rounded-full bg-gradient-to-br from-skillforge-primary to-skillforge-secondary flex items-center justify-center text-white font-bold shadow-lg">
                {index + 1}
              </div>
              
              <div className="flex flex-col items-center text-center pt-4">
                <div className="mb-4 p-3 bg-skillforge-light rounded-full">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureShowcase;
