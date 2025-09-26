import { supabase } from '@/integrations/supabase/client';

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scenario?: string;
  expectedAnswer?: string;
}

export interface AssessmentResult {
  score: number;
  maxScore: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  categoryScores: Record<string, number>;
  strengths: string[];
  improvementAreas: string[];
  recommendations: {
    title: string;
    description: string;
    actionUrl?: string;
  }[];
  detailedFeedback: string;
}

export class SkillAssessmentService {
  
  /**
   * Save assessment results to database
   */
  static async saveAssessmentResults(
    userId: string,
    questionsData: AssessmentQuestion[],
    answersData: Record<string, string>,
    result: AssessmentResult
  ) {
    try {
      const { data, error } = await supabase
        .from('prompt_skill_assessments')
        .insert({
          user_id: userId,
          questions_data: JSON.parse(JSON.stringify(questionsData)),
          answers_data: JSON.parse(JSON.stringify(answersData)),
          score: result.score,
          max_score: result.maxScore,
          assessment_type: 'comprehensive',
          skill_level: result.skillLevel,
          strengths: result.strengths,
          improvement_areas: result.improvementAreas,
          recommendations: JSON.parse(JSON.stringify({
            suggestions: result.recommendations,
            detailed_feedback: result.detailedFeedback,
            category_scores: result.categoryScores
          }))
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving assessment results:', error);
      throw error;
    }
  }

  /**
   * Get user's assessment history
   */
  static async getUserAssessmentHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('prompt_skill_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      throw error;
    }
  }

  /**
   * Get latest assessment for user
   */
  static async getLatestAssessment(userId: string) {
    try {
      const { data, error } = await supabase
        .from('prompt_skill_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching latest assessment:', error);
      throw error;
    }
  }

  /**
   * Analyze user answers and generate results
   */
  static analyzeAssessmentResults(
    questions: AssessmentQuestion[],
    userAnswers: Record<string, string>
  ): AssessmentResult {
    let totalScore = 0;
    const categoryScores: Record<string, { correct: number; total: number }> = {};
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    // Analyze each question
    questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = userAnswer === correctOption?.id;

      if (isCorrect) {
        totalScore += 1;
      }

      // Track category performance
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { correct: 0, total: 0 };
      }
      categoryScores[question.category].total += 1;
      if (isCorrect) {
        categoryScores[question.category].correct += 1;
      }
    });

    // Calculate category percentages and identify strengths/weaknesses
    const categoryPercentages: Record<string, number> = {};
    Object.entries(categoryScores).forEach(([category, scores]) => {
      const percentage = (scores.correct / scores.total) * 100;
      categoryPercentages[category] = percentage;
      
      if (percentage >= 80) {
        strengths.push(category);
      } else if (percentage < 60) {
        improvementAreas.push(category);
      }
    });

    // Determine skill level
    const overallPercentage = (totalScore / questions.length) * 100;
    let skillLevel: AssessmentResult['skillLevel'] = 'beginner';
    if (overallPercentage >= 90) skillLevel = 'expert';
    else if (overallPercentage >= 75) skillLevel = 'advanced';
    else if (overallPercentage >= 60) skillLevel = 'intermediate';

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      skillLevel,
      categoryPercentages,
      improvementAreas
    );

    // Generate detailed feedback
    const detailedFeedback = this.generateDetailedFeedback(
      overallPercentage,
      skillLevel,
      categoryPercentages,
      strengths,
      improvementAreas
    );

    return {
      score: totalScore,
      maxScore: questions.length,
      skillLevel,
      categoryScores: categoryPercentages,
      strengths,
      improvementAreas,
      recommendations,
      detailedFeedback
    };
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    skillLevel: AssessmentResult['skillLevel'],
    categoryScores: Record<string, number>,
    improvementAreas: string[]
  ) {
    const recommendations = [];

    // Base recommendations by skill level
    if (skillLevel === 'beginner') {
      recommendations.push({
        title: 'Start with Fundamentals',
        description: 'Master the basics of prompt structure, context setting, and clear instruction writing.',
        actionUrl: '/gemini-training'
      });
    } else if (skillLevel === 'intermediate') {
      recommendations.push({
        title: 'Advanced Techniques',
        description: 'Explore chain-of-thought prompting, few-shot learning, and role-based prompting.',
        actionUrl: '/scenarios'
      });
    } else if (skillLevel === 'advanced') {
      recommendations.push({
        title: 'Specialized Applications',
        description: 'Apply your skills to complex scenarios and domain-specific use cases.',
        actionUrl: '/scenarios'
      });
    }

    // Category-specific recommendations
    improvementAreas.forEach(area => {
      switch (area) {
        case 'Prompt Structure':
          recommendations.push({
            title: 'Improve Prompt Structure',
            description: 'Learn how to organize prompts with clear instructions, context, and examples.',
            actionUrl: '/gemini-training'
          });
          break;
        case 'Context Management':
          recommendations.push({
            title: 'Master Context Setting',
            description: 'Practice providing relevant context and background information in your prompts.',
            actionUrl: '/prompt-playground'
          });
          break;
        case 'Output Optimization':
          recommendations.push({
            title: 'Optimize AI Responses',
            description: 'Learn techniques to get more precise and useful outputs from AI models.',
            actionUrl: '/scenarios'
          });
          break;
      }
    });

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  }

  /**
   * Generate detailed feedback text
   */
  private static generateDetailedFeedback(
    overallPercentage: number,
    skillLevel: AssessmentResult['skillLevel'],
    categoryScores: Record<string, number>,
    strengths: string[],
    improvementAreas: string[]
  ): string {
    let feedback = `You scored ${overallPercentage.toFixed(1)}% on this comprehensive prompt engineering assessment, placing you at the ${skillLevel} level.\n\n`;

    if (strengths.length > 0) {
      feedback += `**Your Strengths:**\n`;
      strengths.forEach(strength => {
        feedback += `• ${strength}: ${categoryScores[strength].toFixed(1)}% mastery\n`;
      });
      feedback += '\n';
    }

    if (improvementAreas.length > 0) {
      feedback += `**Areas for Improvement:**\n`;
      improvementAreas.forEach(area => {
        feedback += `• ${area}: ${categoryScores[area].toFixed(1)}% - Focus on strengthening this area\n`;
      });
      feedback += '\n';
    }

    feedback += `**Next Steps:**\nBased on your performance, we recommend focusing on ${skillLevel === 'beginner' ? 'fundamental concepts and basic prompt structure' : skillLevel === 'intermediate' ? 'advanced techniques and real-world applications' : 'specialized use cases and optimization strategies'}.`;

    return feedback;
  }

  /**
   * Update user's learning progress based on assessment
   */
  static async updateLearningProgress(userId: string, result: AssessmentResult) {
    try {
      // Check if user has existing progress record
      const { data: existingProgress } = await supabase
        .from('prompt_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_area', 'prompt_engineering')
        .maybeSingle();

      const progressData = {
        user_id: userId,
        skill_area: 'prompt_engineering',
        current_level: result.skillLevel,
        experience_points: Math.floor(result.score * 10), // Award 10 XP per correct answer
        exercises_completed: (existingProgress?.exercises_completed || 0) + 1,
        best_practices_learned: result.strengths,
        last_practice_session: new Date().toISOString()
      };

      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('prompt_learning_progress')
          .update(progressData)
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('prompt_learning_progress')
          .insert(progressData);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating learning progress:', error);
      // Don't throw - this is non-critical
    }
  }
}