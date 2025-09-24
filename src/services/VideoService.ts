export interface Video {
  id: string;
  title: string;
  url: string;
  duration?: string;
  topics: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bestFor: string;
}

export interface VideoRecommendation {
  videos: Video[];
  reasoning: string;
}

class VideoService {
  private videos: Video[] = [];
  private initialized = false;

  // Extract video ID from YouTube URL
  private extractVideoId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  }

  // Parse the video catalog markdown files
  private parseVideoCatalog(): Video[] {
    const videos: Video[] = [
      // Beginner Tutorials
      {
        id: 'Py5aHOLpAMg',
        title: 'Google AI Studio Tutorial for Beginners: Master it in 10 Minutes!',
        url: 'https://www.youtube.com/watch?v=Py5aHOLpAMg',
        duration: '9:59',
        topics: ['basics', 'quick start', 'overview'],
        category: 'Beginner Tutorials',
        difficulty: 'beginner',
        bestFor: 'Complete beginners, quick introduction'
      },
      {
        id: '13EPujO40iE',
        title: 'Google AI Studio In 26 Minutes',
        url: 'https://www.youtube.com/watch?v=13EPujO40iE',
        duration: '26:00',
        topics: ['complete overview', 'all features', 'detailed walkthrough'],
        category: 'Beginner Tutorials',
        difficulty: 'beginner',
        bestFor: 'Comprehensive beginner introduction'
      },
      {
        id: '-aT3Uh1hyis',
        title: 'Master Google AI Studio in 15 Minutes',
        url: 'https://www.youtube.com/watch?v=-aT3Uh1hyis',
        duration: '15:00',
        topics: ['no-code', 'applications', 'quick start'],
        category: 'Beginner Tutorials',
        difficulty: 'beginner',
        bestFor: 'Building applications without coding'
      },
      {
        id: 'G2fqAlgmoPo',
        title: 'Introduction to Generative AI Studio',
        url: 'https://www.youtube.com/watch?v=G2fqAlgmoPo',
        duration: '',
        topics: ['generative ai studio', 'vertex ai', 'overview'],
        category: 'AI Fundamentals',
        difficulty: 'beginner',
        bestFor: 'Understanding the platform fundamentals'
      },
      // Model Training & Fine-tuning
      {
        id: 'VwpDvvNjN2I',
        title: 'Fine tuning Gemini with Google AI Studio',
        url: 'https://www.youtube.com/watch?v=VwpDvvNjN2I',
        duration: '7:18',
        topics: ['fine-tuning', 'gemini', 'model customization'],
        category: 'Model Training & Fine-tuning',
        difficulty: 'intermediate',
        bestFor: 'Basic fine-tuning introduction'
      },
      {
        id: 'T_dAkcMgHaI',
        title: 'Google AI Studio: How to Fine Tune AI Models With Ease - No Coding',
        url: 'https://www.youtube.com/watch?v=T_dAkcMgHaI',
        duration: '2:46',
        topics: ['fine-tuning', 'no-code', 'classification'],
        category: 'Model Training & Fine-tuning',
        difficulty: 'intermediate',
        bestFor: 'No-code fine-tuning'
      },
      {
        id: 'HiCHkG2mOO4',
        title: 'Easy Fine Tuning tutorial with Google AI Studio',
        url: 'https://www.youtube.com/watch?v=HiCHkG2mOO4',
        duration: '14:07',
        topics: ['fine-tuning', 'LLM', 'deployment'],
        category: 'Model Training & Fine-tuning',
        difficulty: 'intermediate',
        bestFor: 'Comprehensive fine-tuning process'
      },
      {
        id: '2zCAY07d7Ns',
        title: 'Fine Tuning Gemini in AI Studio and Vertex AI',
        url: 'https://www.youtube.com/watch?v=2zCAY07d7Ns',
        duration: '33:06',
        topics: ['fine-tuning', 'vertex ai', 'expert level'],
        category: 'Model Training & Fine-tuning',
        difficulty: 'advanced',
        bestFor: 'Advanced fine-tuning techniques'
      },
      // Practical Applications
      {
        id: 'zxye_ZfRpD0',
        title: 'How to Build an AI Recipe Generator with Python, Tkinter and Gemini API',
        url: 'https://www.youtube.com/watch?v=zxye_ZfRpD0',
        duration: '8:04',
        topics: ['python', 'tkinter', 'recipe generator'],
        category: 'Practical Applications',
        difficulty: 'intermediate',
        bestFor: 'Python developers building GUI apps'
      },
      {
        id: 'LS5eIqvtJSE',
        title: 'Build a Real World AI Recipe Gen with Python and Google Gemini',
        url: 'https://www.youtube.com/watch?v=LS5eIqvtJSE',
        duration: '',
        topics: ['python', 'real-world', 'gemini pro'],
        category: 'Practical Applications',
        difficulty: 'intermediate',
        bestFor: 'Real-world application development'
      },
      {
        id: 'B1RKFL6ASts',
        title: 'Gemini API and Flutter: Practical, AI-driven apps with Google AI tools',
        url: 'https://www.youtube.com/watch?v=B1RKFL6ASts',
        duration: '',
        topics: ['flutter', 'mobile app', 'cooking app'],
        category: 'Practical Applications',
        difficulty: 'intermediate',
        bestFor: 'Mobile app developers'
      },
      {
        id: 'wuh3uqlU9kQ',
        title: 'AI Recipe Generator with Gemini & Streamlit',
        url: 'https://www.youtube.com/watch?v=wuh3uqlU9kQ',
        duration: '',
        topics: ['streamlit', 'web app', 'python'],
        category: 'Practical Applications',
        difficulty: 'intermediate',
        bestFor: 'Web application development'
      },
      // Developer-Focused Content
      {
        id: '4oyqd7CB09c',
        title: 'Introduction to Gemini APIs and AI Studio',
        url: 'https://www.youtube.com/watch?v=4oyqd7CB09c',
        duration: '18:07',
        topics: ['gemini api', 'automation', 'no-code'],
        category: 'Developer-Focused Content',
        difficulty: 'intermediate',
        bestFor: 'API integration basics'
      },
      {
        id: 'Y10WeRIDKiw',
        title: 'How to use the Gemini APIs: Advanced techniques',
        url: 'https://www.youtube.com/watch?v=Y10WeRIDKiw',
        duration: '',
        topics: ['advanced apis', 'long context', 'code execution'],
        category: 'Developer-Focused Content',
        difficulty: 'advanced',
        bestFor: 'Advanced API usage patterns'
      },
      {
        id: 'DJbgn8R2SGE',
        title: 'AI Developer Tools at Google with Paige Bailey',
        url: 'https://www.youtube.com/watch?v=DJbgn8R2SGE',
        duration: '37:29',
        topics: ['developer tools', 'colab', 'kaggle'],
        category: 'Developer-Focused Content',
        difficulty: 'intermediate',
        bestFor: 'Understanding Google\'s AI ecosystem'
      },
      {
        id: 'VRT8YNiD7xg',
        title: 'Google Gemini APIs and AI Studio: Accelerating creative workflows',
        url: 'https://www.youtube.com/watch?v=VRT8YNiD7xg',
        duration: '50:24',
        topics: ['creative workflows', 'multimodal capabilities'],
        category: 'Developer-Focused Content',
        difficulty: 'advanced',
        bestFor: 'Creative and research applications'
      },
      // Advanced Features
      {
        id: '8qg_6OWE8cc',
        title: 'Take your AI projects further with Google AI Studio',
        url: 'https://www.youtube.com/shorts/8qg_6OWE8cc',
        duration: 'Short',
        topics: ['advanced projects', 'enhanced features'],
        category: 'Advanced Features',
        difficulty: 'advanced',
        bestFor: 'Scaling up existing projects'
      },
      {
        id: 'TGaoZpvs1Fo',
        title: 'Unlock Gemini\'s Powers in Google AI Studio (Full Guide)',
        url: 'https://www.youtube.com/watch?v=TGaoZpvs1Fo',
        duration: '28:08',
        topics: ['full features', 'video analysis', 'app building'],
        category: 'Advanced Features',
        difficulty: 'advanced',
        bestFor: 'Complete feature exploration'
      },
      {
        id: 'vAvs4lBqSFo',
        title: 'This AI Changes Everything... Google AI Studio Tutorial',
        url: 'https://www.youtube.com/watch?v=vAvs4lBqSFo',
        duration: '13:43',
        topics: ['mobile', 'desktop', 'all features'],
        category: 'Advanced Features',
        difficulty: 'intermediate',
        bestFor: 'Cross-platform usage'
      },
      // AI Fundamentals
      {
        id: '7OwOhRJVGDc',
        title: 'What is Generative AI Studio?',
        url: 'https://www.youtube.com/watch?v=7OwOhRJVGDc',
        duration: '0:48',
        topics: ['llm', 'no-code', 'quick intro'],
        category: 'AI Fundamentals',
        difficulty: 'beginner',
        bestFor: 'Quick platform introduction'
      },
      {
        id: 'PmZZYXoDnu8',
        title: 'Generative AI Full Course (2025)',
        url: 'https://www.youtube.com/watch?v=PmZZYXoDnu8',
        duration: '9:54:30',
        topics: ['comprehensive ai course', 'technical details'],
        category: 'AI Fundamentals',
        difficulty: 'beginner',
        bestFor: 'Complete AI education'
      },
      // Specialized Features
      {
        id: '_wo0V1HpxGE',
        title: 'Google AI Studio: Your AI playground',
        url: 'https://www.youtube.com/shorts/_wo0V1HpxGE',
        duration: 'Short',
        topics: ['chatbots', 'video analysis', 'creative text'],
        category: 'Specialized Features',
        difficulty: 'intermediate',
        bestFor: 'Feature overview'
      },
      {
        id: '1O27hf17BaY',
        title: 'A whistle stop tour of AI creation with Paige Bailey',
        url: 'https://www.youtube.com/watch?v=1O27hf17BaY',
        duration: '49:23',
        topics: ['ai creation', 'tools overview', 'multimodality'],
        category: 'Specialized Features',
        difficulty: 'intermediate',
        bestFor: 'Comprehensive tool exploration'
      },
      {
        id: '4uNPqAyCyZY',
        title: 'Paige Bailey: A Beginner\'s Guide to Multimodal AI with Gemini 2.0',
        url: 'https://www.youtube.com/watch?v=4uNPqAyCyZY',
        duration: '31:25',
        topics: ['multimodal ai', 'gemini 2.0', 'veo 2', 'imagen 3'],
        category: 'Specialized Features',
        difficulty: 'beginner',
        bestFor: 'Latest multimodal capabilities'
      },
      {
        id: 'OMf2BAxmupg',
        title: 'Google AI Studio Beginner\'s Tutorial',
        url: 'https://www.youtube.com/watch?v=OMf2BAxmupg',
        duration: '',
        topics: ['beginner tutorial', 'complete walkthrough'],
        category: 'Specialized Features',
        difficulty: 'beginner',
        bestFor: 'Step-by-step guidance'
      }
    ];

    return videos;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.videos = this.parseVideoCatalog();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize VideoService:', error);
      // Fallback to empty array if parsing fails
      this.videos = [];
      this.initialized = true;
    }
  }

  // Get videos by phase with smart mapping
  async getVideosForPhase(phaseId: number): Promise<Video[]> {
    await this.initialize();

    const phaseMapping: Record<number, string[]> = {
      1: ['Beginner Tutorials', 'AI Fundamentals'], // Foundations
      2: ['Developer-Focused Content', 'Beginner Tutorials'], // Planning  
      3: ['Practical Applications', 'Model Training & Fine-tuning'], // Prototype
      4: ['Advanced Features', 'Developer-Focused Content'], // Testing
      5: ['Advanced Features', 'Specialized Features'] // Deployment
    };

    const relevantCategories = phaseMapping[phaseId] || ['Beginner Tutorials'];
    
    return this.videos.filter(video => 
      relevantCategories.includes(video.category)
    ).slice(0, 3); // Limit to 3 videos per phase
  }

  // Get videos by topic/keywords
  async getVideosByTopic(keywords: string[]): Promise<VideoRecommendation> {
    await this.initialize();

    const scoredVideos = this.videos.map(video => {
      let score = 0;
      const searchText = `${video.title} ${video.topics.join(' ')} ${video.bestFor}`.toLowerCase();
      
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (searchText.includes(keywordLower)) {
          score += 1;
        }
        // Boost score for exact topic matches
        if (video.topics.some(topic => topic.toLowerCase().includes(keywordLower))) {
          score += 2;
        }
      });

      return { video, score };
    });

    const recommendedVideos = scoredVideos
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.video);

    const reasoning = recommendedVideos.length > 0 
      ? `Found ${recommendedVideos.length} videos matching "${keywords.join(', ')}" topics`
      : 'No specific matches found, showing default beginner videos';

    return {
      videos: recommendedVideos.length > 0 ? recommendedVideos : this.videos.slice(0, 3),
      reasoning
    };
  }

  // Get videos by difficulty level
  async getVideosByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<Video[]> {
    await this.initialize();
    return this.videos.filter(video => video.difficulty === difficulty).slice(0, 4);
  }

  // Get all videos
  async getAllVideos(): Promise<Video[]> {
    await this.initialize();
    return this.videos;
  }

  // Get videos for phase with enhanced keyword matching
  async getVideosForPhaseWithKeywords(phaseId: number, keyTerms: string[]): Promise<Video[]> {
    await this.initialize();

    // Start with phase-specific videos
    const phaseVideos = await this.getVideosForPhase(phaseId);
    
    // Get keyword-based recommendations
    const keywordRecommendation = await this.getVideosByTopic(keyTerms);
    
    // Combine and deduplicate
    const combinedVideos = [...phaseVideos];
    keywordRecommendation.videos.forEach(video => {
      if (!combinedVideos.find(existing => existing.id === video.id)) {
        combinedVideos.push(video);
      }
    });
    
    // Return top 3-4 most relevant videos
    return combinedVideos.slice(0, 3);
  }

  // Get fallback videos (for when other methods fail)
  getFallbackVideos(): Video[] {
    return [
      {
        id: 'Py5aHOLpAMg',
        title: 'Google AI Studio Tutorial for Beginners: Master it in 10 Minutes!',
        url: 'https://www.youtube.com/watch?v=Py5aHOLpAMg',
        duration: '9:59',
        topics: ['basics', 'quick start', 'overview'],
        category: 'Beginner Tutorials',
        difficulty: 'beginner',
        bestFor: 'Complete beginners, quick introduction'
      },
      {
        id: '13EPujO40iE',
        title: 'Google AI Studio In 26 Minutes',
        url: 'https://www.youtube.com/watch?v=13EPujO40iE',
        duration: '26:00',
        topics: ['complete overview', 'all features', 'detailed walkthrough'],
        category: 'Beginner Tutorials',
        difficulty: 'beginner',
        bestFor: 'Comprehensive beginner introduction'
      },
      {
        id: '4oyqd7CB09c',
        title: 'Introduction to Gemini APIs and AI Studio',
        url: 'https://www.youtube.com/watch?v=4oyqd7CB09c',
        duration: '18:07',
        topics: ['gemini api', 'automation', 'no-code'],
        category: 'Developer-Focused Content',
        difficulty: 'intermediate',
        bestFor: 'API integration basics'
      }
    ];
  }
}

export const videoService = new VideoService();
export default VideoService;