import React from 'react';

import { BarChart3, BookOpen, Brain, Target, TrendingUp } from 'lucide-react';

const AIAnalysisContent = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="relative mb-6">
            <div className="bg-success/10 border-success/20 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border">
              <BarChart3 className="text-success h-10 w-10" />
            </div>
            <div className="bg-warning text-background absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm">
              SOON
            </div>
          </div>

          <h1 className="text-text mb-3 text-2xl font-bold">AI Topic Analysis</h1>

          <p className="text-text-secondary leading-relaxed">
            Our AI analyzes your quiz and poll responses to identify topics you've mastered and
            areas that need more attention.
          </p>
        </div>

        {/* Analysis Preview Cards */}
        <div className="mb-8 space-y-6">
          {/* Strong Topics */}
          <div className="border-border bg-surface-elevated/30 rounded-xl border p-6">
            <div className="flex items-start gap-3">
              <div className="bg-success/10 mt-0.5 rounded-lg p-2">
                <Target className="text-success h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 flex items-center gap-2 font-semibold">
                  Strong Topics
                  <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs">
                    Well Understood
                  </span>
                </h3>
                <p className="text-text-secondary mb-3 text-sm leading-relaxed">
                  Topics you consistently answer correctly and demonstrate strong understanding.
                </p>

                {/* Mock strong topics */}
                <div className="flex flex-wrap gap-1">
                  <span className="bg-success/10 text-success rounded-full px-2 py-1 text-xs">
                    JavaScript Fundamentals
                  </span>
                  <span className="bg-success/10 text-success rounded-full px-2 py-1 text-xs">
                    React Hooks
                  </span>
                  <span className="bg-success/10 text-success rounded-full px-2 py-1 text-xs">
                    API Design
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Topics to Review */}
          <div className="border-border bg-surface-elevated/30 rounded-xl border p-6">
            <div className="flex items-start gap-3">
              <div className="bg-warning/10 mt-0.5 rounded-lg p-2">
                <BookOpen className="text-warning h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 flex items-center gap-2 font-semibold">
                  Topics to Review
                  <span className="bg-warning/10 text-warning rounded-full px-2 py-0.5 text-xs">
                    Needs Practice
                  </span>
                </h3>
                <p className="text-text-secondary mb-3 text-sm leading-relaxed">
                  Areas where you've had difficulty or need more practice to master the concepts.
                </p>

                {/* Mock topics to review */}
                <div className="flex flex-wrap gap-1">
                  <span className="bg-warning/10 text-warning rounded-full px-2 py-1 text-xs">
                    Database Optimization
                  </span>
                  <span className="bg-warning/10 text-warning rounded-full px-2 py-1 text-xs">
                    System Architecture
                  </span>
                  <span className="bg-warning/10 text-warning rounded-full px-2 py-1 text-xs">
                    Algorithm Complexity
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-3">
          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 mt-0.5 rounded-lg p-2">
                <Brain className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Smart Topic Detection</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  AI automatically identifies topics from your quiz answers and categorizes your
                  knowledge gaps.
                </p>
              </div>
            </div>
          </div>

          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-accent/10 mt-0.5 rounded-lg p-2">
                <TrendingUp className="text-accent h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Progress Tracking</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Track how your understanding of different topics improves over time with detailed
                  analytics.
                </p>
              </div>
            </div>
          </div>

          <div className="hover:bg-surface-elevated/30 p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-success/10 mt-0.5 rounded-lg p-2">
                <Target className="text-success h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Personalized Study Plan</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Get customized recommendations on which topics to focus on based on your
                  performance data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Analysis */}
        <div className="border-border bg-surface-elevated/30 mb-8 rounded-xl border p-6">
          <h3 className="text-text mb-4 flex items-center gap-2 font-semibold">
            <BarChart3 className="text-primary h-5 w-5" />
            Sample Topic Breakdown
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">JavaScript</span>
              <div className="flex items-center gap-2">
                <div className="border-border h-2 w-20 overflow-hidden rounded-full border">
                  <div className="bg-success h-full w-5/6 rounded-full"></div>
                </div>
                <span className="text-success w-8 text-right text-xs font-medium">85%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">React</span>
              <div className="flex items-center gap-2">
                <div className="border-border h-2 w-20 overflow-hidden rounded-full border">
                  <div className="bg-primary h-full w-3/4 rounded-full"></div>
                </div>
                <span className="text-primary w-8 text-right text-xs font-medium">72%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">Databases</span>
              <div className="flex items-center gap-2">
                <div className="border-border h-2 w-20 overflow-hidden rounded-full border">
                  <div className="bg-warning h-full w-1/2 rounded-full"></div>
                </div>
                <span className="text-warning w-8 text-right text-xs font-medium">45%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text text-sm font-medium">System Design</span>
              <div className="flex items-center gap-2">
                <div className="border-border h-2 w-20 overflow-hidden rounded-full border">
                  <div className="bg-error h-full w-1/3 rounded-full"></div>
                </div>
                <span className="text-error w-8 text-right text-xs font-medium">32%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="border-border-subtle border-t p-6">
            <h3 className="text-text mb-2 text-lg font-semibold">Discover Your Knowledge Gaps</h3>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              Let AI analyze your responses to help you focus your learning efforts where they
              matter most.
            </p>
            <button
              disabled
              className="bg-primary/40 text-background cursor-not-allowed rounded-lg px-6 py-2.5 text-sm font-medium"
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
