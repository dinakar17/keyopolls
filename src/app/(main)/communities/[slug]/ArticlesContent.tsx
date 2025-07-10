'use client';

import React from 'react';

import Image from 'next/image';

import { Eye, FileText, Heart, MessageSquare, Share } from 'lucide-react';

const ArticlesContent = () => {
  const mockArticles = [
    {
      id: 1,
      title: 'The Future of Web Development: Trends to Watch in 2024',
      author: 'Sarah Chen',
      authorAvatar: null,
      publishedAt: '2 days ago',
      readTime: '5 min read',
      excerpt:
        'Exploring the latest trends in web development including AI integration, serverless architecture, and the rise of WebAssembly.',
      tags: ['Web Development', 'AI', 'Trends'],
      likes: 142,
      comments: 28,
      views: 1847,
      featured: true,
    },
    {
      id: 2,
      title: 'Building Scalable React Applications: Best Practices',
      author: 'Mike Johnson',
      authorAvatar: null,
      publishedAt: '1 week ago',
      readTime: '8 min read',
      excerpt:
        'Learn how to structure your React applications for maximum scalability and maintainability with proven patterns and practices.',
      tags: ['React', 'JavaScript', 'Best Practices'],
      likes: 89,
      comments: 15,
      views: 923,
      featured: false,
    },
    {
      id: 3,
      title: 'Machine Learning for Beginners: A Comprehensive Guide',
      author: 'Dr. Lisa Wang',
      authorAvatar: null,
      publishedAt: '3 days ago',
      readTime: '12 min read',
      excerpt:
        'Everything you need to know to get started with machine learning, from basic concepts to practical implementation.',
      tags: ['Machine Learning', 'AI', 'Tutorial'],
      likes: 256,
      comments: 42,
      views: 2134,
      featured: true,
    },
    {
      id: 4,
      title: 'The Art of Code Review: Building Better Software Together',
      author: 'Alex Rodriguez',
      authorAvatar: null,
      publishedAt: '5 days ago',
      readTime: '6 min read',
      excerpt:
        'Code reviews are more than just bug hunting. Learn how to give constructive feedback and create a positive review culture.',
      tags: ['Code Review', 'Team Collaboration', 'Software Development'],
      likes: 67,
      comments: 12,
      views: 745,
      featured: false,
    },
    {
      id: 5,
      title: 'Designing User Interfaces That Convert',
      author: 'Emma Thompson',
      authorAvatar: null,
      publishedAt: '1 week ago',
      readTime: '7 min read',
      excerpt:
        'Discover the psychology behind effective UI design and how to create interfaces that drive user engagement and conversions.',
      tags: ['UI Design', 'UX', 'Conversion Optimization'],
      likes: 198,
      comments: 31,
      views: 1456,
      featured: false,
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">Community Articles</h2>
          <p className="text-text-secondary mt-1 text-sm">
            {mockArticles.length} articles from community members
          </p>
        </div>
        <button className="bg-primary text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
          Write Article
        </button>
      </div>

      {/* Preview Notice */}
      <div className="rounded-r-lg border-l-4 border-green-400 bg-green-50 p-4">
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-800">Feature Preview</p>
            <p className="mt-1 text-xs text-green-700">
              Articles platform is coming soon! This is a preview of what's to come.
            </p>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-6">
        {mockArticles.map((article) => (
          <article key={article.id} className="border-border-subtle border-b py-4 last:border-b-0">
            <div className="flex items-start gap-4">
              {/* Author Avatar */}
              <div className="flex-shrink-0">
                {article.authorAvatar ? (
                  <Image
                    src={article.authorAvatar}
                    alt={article.author}
                    className="h-12 w-12 rounded-full object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 font-medium text-white">
                    {article.author.charAt(0)}
                  </div>
                )}
              </div>

              {/* Article Details */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-text hover:text-primary cursor-pointer text-lg leading-tight font-semibold transition-colors">
                      {article.title}
                    </h3>
                    <div className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                      <span>by {article.author}</span>
                      <span>•</span>
                      <span>{article.publishedAt}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                      {article.featured && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">Featured</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="text-text-muted hover:text-primary ml-4 flex-shrink-0 transition-colors">
                    <Share className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-text-secondary mb-4 text-sm leading-relaxed">
                  {article.excerpt}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-surface-elevated text-text-secondary hover:bg-primary hover:text-background cursor-pointer rounded-full px-3 py-1 text-xs transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-text-secondary flex items-center gap-6 text-sm">
                    <button className="flex items-center gap-1 transition-colors hover:text-red-500">
                      <Heart className="h-4 w-4" />
                      <span>{article.likes}</span>
                    </button>
                    <button className="hover:text-primary flex items-center gap-1 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>{article.comments}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views.toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium transition-colors">
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <FileText className="text-text-muted mx-auto mb-3 h-8 w-8" />
        <p className="text-text-secondary text-sm">
          Full articles platform launching soon with rich text editor and publishing tools
        </p>
      </div>
    </div>
  );
};

export default ArticlesContent;
