export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_type: 'standard' | 'feed';
  display_order: number;
  icon: string;
  icon_color: string;
}

// All categories including feed type
export const ALL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'For You',
    slug: 'for-you',
    description: 'Personalized content feed',
    category_type: 'feed',
    display_order: 1,
    icon: 'Home',
    icon_color: '#3B82F6',
  },
  {
    id: 2,
    name: 'Technology',
    slug: 'technology',
    description: 'Tech, programming, gadgets, and innovation',
    category_type: 'standard',
    display_order: 2,
    icon: 'Laptop',
    icon_color: '#8B5CF6',
  },
  {
    id: 3,
    name: 'Gaming',
    slug: 'gaming',
    description: 'Video games, esports, and gaming culture',
    category_type: 'standard',
    display_order: 3,
    icon: 'Gamepad2',
    icon_color: '#10B981',
  },
  {
    id: 4,
    name: 'Sports',
    slug: 'sports',
    description: 'All sports, fitness, and athletic activities',
    category_type: 'standard',
    display_order: 4,
    icon: 'Trophy',
    icon_color: '#F59E0B',
  },
  {
    id: 5,
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, TV shows, music, and celebrity news',
    category_type: 'standard',
    display_order: 5,
    icon: 'Film',
    icon_color: '#EF4444',
  },
  {
    id: 6,
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Fashion, food, travel, and daily life',
    category_type: 'standard',
    display_order: 6,
    icon: 'Coffee',
    icon_color: '#EC4899',
  },
  {
    id: 7,
    name: 'Education',
    slug: 'education',
    description: 'Learning, academics, and knowledge sharing',
    category_type: 'standard',
    display_order: 7,
    icon: 'GraduationCap',
    icon_color: '#6366F1',
  },
  {
    id: 8,
    name: 'Business',
    slug: 'business',
    description: 'Entrepreneurship, finance, and professional topics',
    category_type: 'standard',
    display_order: 8,
    icon: 'Briefcase',
    icon_color: '#0F172A',
  },
  {
    id: 9,
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Mental health, fitness, nutrition, and wellbeing',
    category_type: 'standard',
    display_order: 9,
    icon: 'Heart',
    icon_color: '#DC2626',
  },
  {
    id: 10,
    name: 'Arts & Culture',
    slug: 'arts-culture',
    description: 'Visual arts, literature, music, and cultural topics',
    category_type: 'standard',
    display_order: 10,
    icon: 'Palette',
    icon_color: '#7C3AED',
  },
  {
    id: 11,
    name: 'Science',
    slug: 'science',
    description: 'Research, discoveries, and scientific discussions',
    category_type: 'standard',
    display_order: 11,
    icon: 'Microscope',
    icon_color: '#059669',
  },
  {
    id: 12,
    name: 'Politics',
    slug: 'politics',
    description: 'Political discussions and current affairs',
    category_type: 'standard',
    display_order: 12,
    icon: 'Vote',
    icon_color: '#1F2937',
  },
  {
    id: 13,
    name: 'Food & Cooking',
    slug: 'food-cooking',
    description: 'Recipes, restaurants, culinary discussions',
    category_type: 'standard',
    display_order: 13,
    icon: 'ChefHat',
    icon_color: '#EA580C',
  },
  {
    id: 14,
    name: 'Travel',
    slug: 'travel',
    description: 'Travel experiences, destinations, and tips',
    category_type: 'standard',
    display_order: 14,
    icon: 'Plane',
    icon_color: '#0EA5E9',
  },
  {
    id: 15,
    name: 'Photography',
    slug: 'photography',
    description: 'Photo sharing, techniques, and visual storytelling',
    category_type: 'standard',
    display_order: 15,
    icon: 'Camera',
    icon_color: '#6B7280',
  },
  {
    id: 16,
    name: 'Music',
    slug: 'music',
    description: 'Music discovery, discussion, and creation',
    category_type: 'standard',
    display_order: 16,
    icon: 'Music',
    icon_color: '#F97316',
  },
  {
    id: 17,
    name: 'Books & Reading',
    slug: 'books-reading',
    description: 'Book recommendations, reviews, and literary discussions',
    category_type: 'standard',
    display_order: 17,
    icon: 'BookOpen',
    icon_color: '#A855F7',
  },
  {
    id: 18,
    name: 'Nature & Environment',
    slug: 'nature-environment',
    description: 'Environmental issues, wildlife, and outdoor activities',
    category_type: 'standard',
    display_order: 18,
    icon: 'TreePine',
    icon_color: '#16A34A',
  },
  {
    id: 19,
    name: 'Pets & Animals',
    slug: 'pets-animals',
    description: 'Pet care, animal welfare, and cute animal content',
    category_type: 'standard',
    display_order: 19,
    icon: 'Heart',
    icon_color: '#F472B6',
  },
  {
    id: 20,
    name: 'DIY & Crafts',
    slug: 'diy-crafts',
    description: 'Do-it-yourself projects, crafting, and creative hobbies',
    category_type: 'standard',
    display_order: 20,
    icon: 'Hammer',
    icon_color: '#92400E',
  },
];

// Categories available for community creation (excluding feed type categories)
export const COMMUNITY_CATEGORIES: Category[] = ALL_CATEGORIES.filter(
  (category) => category.category_type === 'standard'
);

// Helper function to get category by id
export const getCategoryById = (id: number): Category | undefined => {
  return ALL_CATEGORIES.find((category) => category.id === id);
};

// Helper function to get category options for select components
export const getCategoryOptions = () => {
  return COMMUNITY_CATEGORIES.map((category) => ({
    value: category.id.toString(),
    label: category.name,
    description: category.description,
    icon: category.icon,
    icon_color: category.icon_color,
  }));
};

// Storage key for user category order
const USER_CATEGORIES_ORDER_KEY = 'user_categories_order';

// Save user's category order to localStorage
export const saveUserCategoriesOrder = (categories: Category[]): void => {
  try {
    // Extract just the IDs in the new order
    const categoryIds = categories.map((cat) => cat.id);
    localStorage.setItem(USER_CATEGORIES_ORDER_KEY, JSON.stringify(categoryIds));

    // Dispatch custom event to notify other components of the change
    window.dispatchEvent(
      new CustomEvent('categoriesOrderUpdated', {
        detail: { categoryIds },
      })
    );
  } catch (error) {
    console.error('Failed to save category order:', error);
  }
};

// Get user's saved category order from localStorage
export const getUserCategoriesOrder = (): number[] => {
  try {
    const savedOrder = localStorage.getItem(USER_CATEGORIES_ORDER_KEY);
    return savedOrder ? JSON.parse(savedOrder) : [];
  } catch (error) {
    console.error('Failed to get category order:', error);
    return [];
  }
};

// Get user-ordered categories (for display purposes)
export const getUserOrderedCategories = (userPreferences?: number[]): Category[] => {
  // Get preferences from localStorage if not provided
  const preferences = userPreferences || getUserCategoriesOrder();

  if (!preferences || preferences.length === 0) {
    // Return default order if no user preferences
    return [...ALL_CATEGORIES].sort((a, b) => a.display_order - b.display_order);
  }

  // Create a map for quick lookup
  const categoryMap = new Map(ALL_CATEGORIES.map((cat) => [cat.id, cat]));

  // Get preferred categories in user's order
  const preferredCategories = preferences
    .map((id) => categoryMap.get(id))
    .filter((cat): cat is Category => cat !== undefined);

  // Get remaining categories not in user preferences, sorted by display_order
  const remainingCategories = ALL_CATEGORIES.filter((cat) => !preferences.includes(cat.id)).sort(
    (a, b) => a.display_order - b.display_order
  );

  // Return preferred categories first, then remaining ones
  return [...preferredCategories, ...remainingCategories];
};

// Reset user's category order to default
export const resetUserCategoriesOrder = (): void => {
  try {
    localStorage.removeItem(USER_CATEGORIES_ORDER_KEY);

    // Dispatch custom event to notify other components of the change
    window.dispatchEvent(
      new CustomEvent('categoriesOrderUpdated', {
        detail: { categoryIds: [] },
      })
    );
  } catch (error) {
    console.error('Failed to reset category order:', error);
  }
};

// Get categories by type
export const getCategoriesByType = (type: 'standard' | 'feed'): Category[] => {
  return ALL_CATEGORIES.filter((category) => category.category_type === type).sort(
    (a, b) => a.display_order - b.display_order
  );
};

// Get standard categories only (for general display)
export const getStandardCategories = (): Category[] => {
  return getCategoriesByType('standard');
};

// Get feed categories only
export const getFeedCategories = (): Category[] => {
  return getCategoriesByType('feed');
};
