import { motion } from 'framer-motion';
import { UseCase } from '@/data/useCases';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target } from 'lucide-react';

interface UseCaseCardProps {
  useCase: UseCase;
  onClick: () => void;
  index: number;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
};

const categoryGradients = {
  customer: 'from-blue-500/20 to-cyan-500/20',
  employee: 'from-purple-500/20 to-pink-500/20',
  creative: 'from-orange-500/20 to-red-500/20',
  data: 'from-green-500/20 to-emerald-500/20',
  code: 'from-indigo-500/20 to-blue-500/20'
};

const UseCaseCard = ({ useCase, onClick, index }: UseCaseCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group cursor-pointer relative"
    >
      <div className="relative h-full bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-primary/50 overflow-hidden">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[useCase.category]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <Badge className={`${difficultyColors[useCase.difficulty]} border`}>
              {useCase.difficulty}
            </Badge>
            <motion.div
              whileHover={{ rotate: 15 }}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
            {useCase.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {useCase.description}
          </p>

          {/* Target Audience */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">For:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {useCase.targetAudience.slice(0, 2).map((audience, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                >
                  {audience}
                </span>
              ))}
              {useCase.targetAudience.length > 2 && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  +{useCase.targetAudience.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Value Proposition */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Impact:</p>
                <p className="text-xs text-primary font-medium">
                  {useCase.impact}
                </p>
              </div>
            </div>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-primary font-semibold">
              Explore →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UseCaseCard;
