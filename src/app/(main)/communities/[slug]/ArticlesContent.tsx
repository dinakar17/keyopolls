'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import {
  ExternalLink,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Plus,
  Share,
} from 'lucide-react';

import { useKeyopollsArticlesApiListArticles } from '@/api/default/default';
import { ArticleDetails, CommunityDetails } from '@/api/schemas';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useProfileStore } from '@/stores/useProfileStore';

interface ArticlesContentProps {
  community: CommunityDetails;
}

const ArticlesContent = ({ community }: ArticlesContentProps) => {
  const { accessToken } = useProfileStore();
  const { setCommunityDetails } = useCommunityStore();
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  // State for infinite loading
  const [allArticles, setAllArticles] = useState<ArticleDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // API call for current page
  const { data, isLoading, error } = useKeyopollsArticlesApiListArticles(
    {
      community_slug: slug || '',
      page: currentPage,
      per_page: 10,
      order_by: '-created_at',
    },
    {
      request: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
    }
  );

  // Update articles when new data comes in
  useEffect(() => {
    if (data?.data) {
      const newArticles = data.data.articles || [];
      const pagination = data.data.pagination;

      if (currentPage === 1) {
        // First page - replace all articles
        setAllArticles(newArticles);
      } else {
        // Subsequent pages - append to existing articles
        setAllArticles((prev) => [...prev, ...newArticles]);
      }

      // Check if there are more pages
      setHasMore(pagination?.has_next || false);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle article click
  const handleArticleClick = (article: ArticleDetails) => {
    if (article.link) {
      window.open(article.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle create article
  const handleCreateArticle = () => {
    setCommunityDetails(community);
    router.push(`/create-article`);
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-text text-xl font-semibold">Community Articles</h2>
            <div className="bg-surface-elevated mt-1 h-4 w-32 animate-pulse rounded"></div>
          </div>
          <div className="bg-surface-elevated h-10 w-28 animate-pulse rounded"></div>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-border-subtle border-b py-4">
              <div className="flex items-start gap-4">
                <div className="bg-surface-elevated h-12 w-12 animate-pulse rounded-full"></div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="bg-surface-elevated h-6 w-3/4 animate-pulse rounded"></div>
                  <div className="bg-surface-elevated h-4 w-1/2 animate-pulse rounded"></div>
                  <div className="bg-surface-elevated h-16 w-full animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800">Error Loading Articles</p>
              <p className="mt-1 text-xs text-red-700">
                {error?.response?.data?.message || 'Failed to load articles'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">Community Articles</h2>
        </div>
        <button
          onClick={handleCreateArticle}
          className="bg-primary text-background flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Share Article
        </button>
      </div>

      {/* Articles List */}
      {allArticles.length > 0 ? (
        <div className="space-y-6">
          {allArticles.map((article) => (
            <article
              key={article.id}
              className="border-border-subtle border-b py-4 last:border-b-0"
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  {article.author_avatar ? (
                    <Image
                      src={article.author_avatar}
                      alt={article.author_display_name}
                      className="h-12 w-12 rounded-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 font-medium text-white">
                      {article.author_display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Article Details */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <h3
                          className="text-text hover:text-primary flex-1 cursor-pointer text-lg leading-tight font-semibold transition-colors"
                          onClick={() => handleArticleClick(article)}
                        >
                          {article.title}
                        </h3>
                        {article.link && (
                          <ExternalLink
                            size={16}
                            className="text-text-muted hover:text-primary mt-1 flex-shrink-0 transition-colors"
                          />
                        )}
                      </div>

                      <div className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                        <Link
                          href={`/profile/${article.author_username}`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.author_display_name}
                        </Link>
                        <span>•</span>
                        <span>{formatDate(article.created_at)}</span>
                        {article.author_aura > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">
                              {article.author_aura} aura
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button className="text-text-muted hover:text-primary ml-4 flex-shrink-0 transition-colors">
                      <Share className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Subtitle */}
                  {article.subtitle && (
                    <p className="text-text-secondary mb-4 text-sm leading-relaxed">
                      {article.subtitle}
                    </p>
                  )}

                  {/* Featured Image */}
                  {article.main_image_url && (
                    <div
                      className="mb-4 cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => handleArticleClick(article)}
                    >
                      <Image
                        src={article.main_image_url}
                        alt={article.title}
                        width={600}
                        height={300}
                        className="h-48 w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="text-text-secondary flex items-center gap-6 text-sm">
                      <button className="flex items-center gap-1 transition-colors hover:text-red-500">
                        <Heart className="h-4 w-4" />
                        <span>{article.like_count}</span>
                      </button>
                      <button className="hover:text-primary flex items-center gap-1 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        <span>{article.comment_count}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.view_count?.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleArticleClick(article)}
                      className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                      Read Article
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 text-center">
          <FileText className="text-text-muted mx-auto mb-4 h-12 w-12" />
          <h3 className="text-text mb-2 text-lg font-medium">No articles yet</h3>
          <p className="text-text-secondary mb-6 text-sm">
            Be the first to share an article with this community!
          </p>
          <button
            onClick={handleCreateArticle}
            className="bg-primary text-background inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Share First Article
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="text-text-secondary flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading more articles...</span>
          </div>
        </div>
      )}

      {/* End of Articles */}
      {!hasMore && allArticles.length > 0 && (
        <div className="py-8 text-center">
          <FileText className="text-text-muted mx-auto mb-3 h-8 w-8" />
          <p className="text-text-secondary text-sm">You've reached the end of the articles</p>
        </div>
      )}
    </div>
  );
};

export default ArticlesContent;
