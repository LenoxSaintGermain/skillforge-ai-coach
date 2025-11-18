import { motion } from 'framer-motion';
import { categories, difficulties } from '@/data/useCases';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UseCaseFilterProps {
  selectedCategory: string | null;
  selectedDifficulty: string | null;
  searchQuery: string;
  onCategoryChange: (category: string | null) => void;
  onDifficultyChange: (difficulty: string | null) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const UseCaseFilter = ({
  selectedCategory,
  selectedDifficulty,
  searchQuery,
  onCategoryChange,
  onDifficultyChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters
}: UseCaseFilterProps) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search use cases..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Difficulty</h3>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => (
            <motion.button
              key={difficulty.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDifficultyChange(selectedDifficulty === difficulty.id ? null : difficulty.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedDifficulty === difficulty.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {difficulty.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Clear all filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default UseCaseFilter;
