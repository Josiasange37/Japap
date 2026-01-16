export interface ContentCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  isAdFriendly: boolean;
  keywords: string[];
}

export const contentCategories: ContentCategory[] = [
  {
    id: 'community',
    name: 'Community Stories',
    emoji: '🤝',
    color: 'bg-blue-500',
    description: 'Personal experiences and community updates',
    isAdFriendly: true,
    keywords: ['community', 'neighbors', 'local', 'stories', 'experience']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    emoji: '🌱',
    color: 'bg-green-500',
    description: 'Daily life, wellness, and personal growth',
    isAdFriendly: true,
    keywords: ['lifestyle', 'wellness', 'health', 'personal', 'growth']
  },
  {
    id: 'technology',
    name: 'Technology',
    emoji: '💻',
    color: 'bg-purple-500',
    description: 'Tech news, reviews, and digital life',
    isAdFriendly: true,
    keywords: ['technology', 'tech', 'digital', 'apps', 'software', 'gadgets']
  },
  {
    id: 'education',
    name: 'Education',
    emoji: '📚',
    color: 'bg-indigo-500',
    description: 'Learning, skills, and knowledge sharing',
    isAdFriendly: true,
    keywords: ['education', 'learning', 'skills', 'knowledge', 'tutorial', 'tips']
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    emoji: '🎭',
    color: 'bg-pink-500',
    description: 'Movies, music, games, and fun content',
    isAdFriendly: true,
    keywords: ['entertainment', 'movies', 'music', 'games', 'fun', 'hobbies']
  },
  {
    id: 'business',
    name: 'Business',
    emoji: '💼',
    color: 'bg-emerald-500',
    description: 'Career, entrepreneurship, and professional insights',
    isAdFriendly: true,
    keywords: ['business', 'career', 'work', 'professional', 'entrepreneur', 'success']
  },
  {
    id: 'travel',
    name: 'Travel',
    emoji: '✈️',
    color: 'bg-cyan-500',
    description: 'Travel stories, tips, and destination reviews',
    isAdFriendly: true,
    keywords: ['travel', 'vacation', 'destination', 'adventure', 'tourism', 'explore']
  },
  {
    id: 'food',
    name: 'Food',
    emoji: '🍽',
    color: 'bg-orange-500',
    description: 'Recipes, restaurants, and culinary experiences',
    isAdFriendly: true,
    keywords: ['food', 'recipes', 'cooking', 'restaurants', 'culinary', 'dining']
  },
  {
    id: 'sports',
    name: 'Sports',
    emoji: '⚽',
    color: 'bg-red-500',
    description: 'Sports news, fitness, and athletic achievements',
    isAdFriendly: true,
    keywords: ['sports', 'fitness', 'athletics', 'exercise', 'health', 'competition']
  },
  {
    id: 'general',
    name: 'General Discussion',
    emoji: '💬',
    color: 'bg-gray-500',
    description: 'General topics and open discussions',
    isAdFriendly: true,
    keywords: ['discussion', 'general', 'conversation', 'talk', 'chat']
  }
];

export const adSensitiveCategories = ['general']; // Categories requiring careful ad placement

export function getCategoryById(id: string): ContentCategory | undefined {
  return contentCategories.find(cat => cat.id === id);
}

export function getAdFriendlyCategories(): ContentCategory[] {
  return contentCategories.filter(cat => cat.isAdFriendly);
}

export function suggestCategory(content: string): ContentCategory | null {
  const lowerContent = content.toLowerCase();
  
  // Score each category based on keyword matches
  const categoryScores = contentCategories.map(category => {
    let score = 0;
    category.keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        score += 1;
      }
    });
    return { category, score };
  });

  // Find the category with highest score
  const bestMatch = categoryScores.reduce((best, current) => 
    current.score > best.score ? current : best
  , { category: contentCategories[0], score: 0 });

  return bestMatch.score > 0 ? bestMatch.category : null;
}