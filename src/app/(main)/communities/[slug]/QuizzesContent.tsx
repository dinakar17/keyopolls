import React from 'react';

import { BookOpen, Brain, Clock, Star, Target, TrendingUp } from 'lucide-react';

const QuizzesContent = () => {
  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-2xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900 shadow-md">
              SOON
            </div>
          </div>

          <h1 className="text-text mb-4 text-3xl font-bold">Smart Quizzes</h1>

          <p className="text-text-secondary mb-6 text-lg leading-relaxed">
            Enhance your reviewing and instinctive skills with adaptive quizzes designed to help you
            master any topic efficiently.
          </p>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-4">
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Adaptive Learning</h3>
                <p className="text-text-secondary">
                  Personalized quiz questions that adapt to your knowledge level and learning pace.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Spaced Repetition</h3>
                <p className="text-text-secondary">
                  Smart scheduling ensures you review concepts at optimal intervals for long-term
                  retention.
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
                  Detailed analytics on your learning progress and areas that need improvement.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Multiple Formats</h3>
                <p className="text-text-secondary">
                  Various question types including multiple choice, true/false, and
                  fill-in-the-blank.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Stats */}
        <div className="mb-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="mb-4 flex items-center gap-3">
            <Star className="h-6 w-6 text-yellow-500" />
            <h3 className="text-text text-lg font-semibold">What to Expect</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-primary mb-1 text-2xl font-bold">500+</div>
              <div className="text-text-secondary text-sm">Question Bank</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-1 text-2xl font-bold">10+</div>
              <div className="text-text-secondary text-sm">Subject Areas</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-1 text-2xl font-bold">AI</div>
              <div className="text-text-secondary text-sm">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-1 text-2xl font-bold">24/7</div>
              <div className="text-text-secondary text-sm">Available</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-surface border-border rounded-xl border p-8">
            <h3 className="text-text mb-3 text-xl font-semibold">
              Get Ready to Level Up Your Learning
            </h3>
            <p className="text-text-secondary mb-6">
              We're working hard to bring you the most effective quiz experience. Stay tuned for
              updates!
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

export default QuizzesContent;
