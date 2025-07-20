import React from 'react';

import { BarChart3, BookOpen, Brain, Target, TrendingUp } from 'lucide-react';

const AIAnalysisContent = () => {
  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-2xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
              <BarChart3 className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900 shadow-md">
              SOON
            </div>
          </div>

          <h1 className="text-text mb-4 text-3xl font-bold">AI Topic Analysis</h1>

          <p className="text-text-secondary mb-6 text-lg leading-relaxed">
            Our AI analyzes your quiz and poll responses to identify topics you've mastered and
            areas that need more attention.
          </p>
        </div>

        {/* Analysis Preview Cards */}
        <div className="mb-8 space-y-4">
          {/* Strong Topics */}
          <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-500 p-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 flex items-center gap-2 text-lg font-semibold">
                  Strong Topics
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-800 dark:text-green-200">
                    Well Understood
                  </span>
                </h3>
                <p className="text-text-secondary mb-3">
                  Topics you consistently answer correctly and demonstrate strong understanding.
                </p>

                {/* Mock strong topics */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800 dark:text-green-200">
                    JavaScript Fundamentals
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800 dark:text-green-200">
                    React Hooks
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-800 dark:text-green-200">
                    API Design
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Topics to Review */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 dark:border-orange-700 dark:from-orange-900/20 dark:to-red-900/20">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-500 p-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 flex items-center gap-2 text-lg font-semibold">
                  Topics to Review
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                    Needs Practice
                  </span>
                </h3>
                <p className="text-text-secondary mb-3">
                  Areas where you've had difficulty or need more practice to master the concepts.
                </p>

                {/* Mock topics to review */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                    Database Optimization
                  </span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                    System Architecture
                  </span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                    Algorithm Complexity
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-4">
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Smart Topic Detection</h3>
                <p className="text-text-secondary">
                  AI automatically identifies topics from your quiz answers and categorizes your
                  knowledge gaps.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Progress Tracking</h3>
                <p className="text-text-secondary">
                  Track how your understanding of different topics improves over time with detailed
                  analytics.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Personalized Study Plan</h3>
                <p className="text-text-secondary">
                  Get customized recommendations on which topics to focus on based on your
                  performance data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Analysis */}
        <div className="bg-surface border-border mb-8 rounded-xl border p-6">
          <h3 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="text-primary h-5 w-5" />
            Sample Topic Breakdown
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">JavaScript</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-5/6 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-medium text-green-600">85%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">React</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-3/4 rounded-full bg-blue-500"></div>
                </div>
                <span className="text-xs font-medium text-blue-600">72%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">Databases</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-1/2 rounded-full bg-orange-500"></div>
                </div>
                <span className="text-xs font-medium text-orange-600">45%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">System Design</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-1/3 rounded-full bg-red-500"></div>
                </div>
                <span className="text-xs font-medium text-red-600">32%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-surface border-border rounded-xl border p-8">
            <h3 className="text-text mb-3 text-xl font-semibold">Discover Your Knowledge Gaps</h3>
            <p className="text-text-secondary mb-6">
              Let AI analyze your responses to help you focus your learning efforts where they
              matter most.
            </p>
            <button
              disabled
              className="bg-primary/50 text-background cursor-not-allowed rounded-lg px-6 py-3 font-medium opacity-60"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisContent;
