import { useState, useMemo } from 'react';
import { useCases } from '@/data/useCases';
import UseCaseCard from './UseCaseCard';
import UseCaseFilter from './UseCaseFilter';
import UseCaseModal from './UseCaseModal';
import { motion, AnimatePresence } from 'framer-motion';

const UseCaseExplorer = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);

  const filteredUseCases = useMemo(() => {
    return useCases.filter((useCase) => {
      const matchesCategory = !selectedCategory || useCase.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || useCase.difficulty === selectedDifficulty;
      const matchesSearch = !searchQuery || 
        useCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        useCase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        useCase.targetAudience.some(audience => 
          audience.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const hasActiveFilters = selectedCategory !== null || selectedDifficulty !== null || searchQuery !== '';

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSearchQuery('');
  };

  const selectedUseCaseData = useCases.find(uc => uc.id === selectedUseCase);

  const handleSelectRelated = (id: string) => {
    setSelectedUseCase(id);
  };

  return (
    <div className="w-full">
      {/* Filter Section */}
      <div className="mb-12">
        <UseCaseFilter
          selectedCategory={selectedCategory}
          selectedDifficulty={selectedDifficulty}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onDifficultyChange={setSelectedDifficulty}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Results Count */}
      <motion.div
        key={filteredUseCases.length}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredUseCases.length}</span> use case
          {filteredUseCases.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtered)'}
        </p>
      </motion.div>

      {/* Cards Grid */}
      <AnimatePresence mode="wait">
        {filteredUseCases.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUseCases.map((useCase, index) => (
              <UseCaseCard
                key={useCase.id}
                useCase={useCase}
                onClick={() => setSelectedUseCase(useCase.id)}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <p className="text-xl font-semibold text-muted-foreground mb-2">
              No use cases found
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={handleClearFilters}
              className="text-primary hover:underline font-medium"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <UseCaseModal
        useCase={selectedUseCaseData || null}
        isOpen={selectedUseCase !== null}
        onClose={() => setSelectedUseCase(null)}
        onSelectRelated={handleSelectRelated}
      />
    </div>
  );
};

export default UseCaseExplorer;
