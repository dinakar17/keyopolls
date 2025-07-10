'use client';

import React from 'react';

import Image from 'next/image';

import { BookOpen, Brain, Clock, Play, Star, Users } from 'lucide-react';

const FlashcardsContent = () => {
  const mockFlashcardSets = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description:
        'Master the basics of JavaScript programming with these essential concepts and syntax.',
      cardCount: 45,
      studyTime: '30 min',
      difficulty: 'Beginner',
      author: 'CodeMaster',
      authorAvatar: null,
      createdAt: '2 days ago',
      tags: ['JavaScript', 'Programming', 'Fundamentals'],
      studyCount: 1247,
      rating: 4.8,
      featured: true,
    },
    {
      id: 2,
      title: 'React Hooks Deep Dive',
      description:
        'Comprehensive study set covering all React hooks with practical examples and use cases.',
      cardCount: 28,
      studyTime: '20 min',
      difficulty: 'Intermediate',
      author: 'ReactPro',
      authorAvatar: null,
      createdAt: '1 week ago',
      tags: ['React', 'Hooks', 'Advanced'],
      studyCount: 892,
      rating: 4.9,
      featured: false,
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms',
      description:
        'Essential data structures and algorithms for technical interviews and competitive programming.',
      cardCount: 67,
      studyTime: '45 min',
      difficulty: 'Advanced',
      author: 'AlgoExpert',
      authorAvatar: null,
      createdAt: '3 days ago',
      tags: ['Algorithms', 'Data Structures', 'Interview Prep'],
      studyCount: 2156,
      rating: 4.7,
      featured: true,
    },
    {
      id: 4,
      title: 'CSS Grid & Flexbox',
      description:
        'Master modern CSS layout techniques with practical examples and real-world applications.',
      cardCount: 32,
      studyTime: '25 min',
      difficulty: 'Intermediate',
      author: 'CSSNinja',
      authorAvatar: null,
      createdAt: '5 days ago',
      tags: ['CSS', 'Layout', 'Web Design'],
      studyCount: 634,
      rating: 4.6,
      featured: false,
    },
    {
      id: 5,
      title: 'Machine Learning Concepts',
      description:
        'Core ML concepts, algorithms, and terminology explained in simple, digestible cards.',
      cardCount: 52,
      studyTime: '35 min',
      difficulty: 'Intermediate',
      author: 'MLGuru',
      authorAvatar: null,
      createdAt: '1 week ago',
      tags: ['Machine Learning', 'AI', 'Data Science'],
      studyCount: 1089,
      rating: 4.8,
      featured: false,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600';
      case 'Intermediate':
        return 'text-yellow-600';
      case 'Advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">Study Flashcards</h2>
          <p className="text-text-secondary mt-1 text-sm">
            {mockFlashcardSets.length} flashcard sets from community members
          </p>
        </div>
        <button className="bg-primary text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
          Create Set
        </button>
      </div>

      {/* Preview Notice */}
      <div className="rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4">
        <div className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-medium text-blue-800">Feature Preview</p>
            <p className="mt-1 text-xs text-blue-700">
              Flashcards platform is coming soon! This is a preview of what's to come.
            </p>
          </div>
        </div>
      </div>

      {/* Flashcard Sets List */}
      <div className="space-y-4">
        {mockFlashcardSets.map((set) => (
          <div key={set.id} className="border-border-subtle border-b py-4 last:border-b-0">
            <div className="flex items-start gap-4">
              {/* Author Avatar */}
              <div className="flex-shrink-0">
                {set.authorAvatar ? (
                  <Image
                    src={set.authorAvatar}
                    alt={set.author}
                    className="h-12 w-12 rounded-full object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 font-medium text-white">
                    {set.author.charAt(0)}
                  </div>
                )}
              </div>

              {/* Flashcard Set Details */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-text text-lg leading-tight font-semibold">{set.title}</h3>
                    <div className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                      <span>by {set.author}</span>
                      <span>•</span>
                      <span>{set.createdAt}</span>
                      {set.featured && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">Featured</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="text-text-muted hover:text-primary ml-4 flex-shrink-0 transition-colors">
                    <Play className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-text-secondary mb-3 text-sm leading-relaxed">
                  {set.description}
                </p>

                <div className="text-text-secondary mb-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{set.cardCount} cards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{set.studyTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{set.studyCount.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{set.rating}</span>
                  </div>
                  <span className={`font-medium ${getDifficultyColor(set.difficulty)}`}>
                    {set.difficulty}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {set.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-surface-elevated text-text-secondary rounded-full px-3 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button className="bg-primary text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
                    Study Now
                  </button>
                  <button className="text-text-secondary hover:text-text text-sm font-medium transition-colors">
                    Preview Cards
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <Brain className="text-text-muted mx-auto mb-3 h-8 w-8" />
        <p className="text-text-secondary text-sm">
          Full flashcards platform launching soon with interactive study sessions
        </p>
      </div>
    </div>
  );
};

export default FlashcardsContent;
