import React from 'react';

import { BookOpen, Folder, List, Star, Target, Vote } from 'lucide-react';

const PollsListsContent = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="relative mb-6">
            <div className="bg-primary/10 border-primary/20 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border">
              <List className="text-primary h-10 w-10" />
            </div>
            <div className="bg-warning text-background absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm">
              SOON
            </div>
          </div>

          <h1 className="text-text mb-3 text-2xl font-bold">Interactive Lists & Polls</h1>

          <p className="text-text-secondary leading-relaxed">
            Master any concept with organized lists containing various poll types - from single
            choice to rankings and text inputs, all categorized into learning concepts.
          </p>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-3">
          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 mt-0.5 rounded-lg p-2">
                <Vote className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Multiple Poll Types</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Single choice, multiple choice, ranking polls, and text input questions to engage
                  with content in different ways.
                </p>
              </div>
            </div>
          </div>

          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-secondary/10 mt-0.5 rounded-lg p-2">
                <Folder className="text-secondary h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Concept Organization</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Lists organized into concept folders, allowing you to focus on specific topics and
                  track mastery of each area.
                </p>
              </div>
            </div>
          </div>

          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-accent/10 mt-0.5 rounded-lg p-2">
                <Target className="text-accent h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Concept Mastery</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Track your progress through each concept folder and see your mastery level across
                  different topics.
                </p>
              </div>
            </div>
          </div>

          <div className="hover:bg-surface-elevated/30 p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-success/10 mt-0.5 rounded-lg p-2">
                <BookOpen className="text-success h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Structured Learning</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Curated lists within each concept provide a structured approach to learning and
                  reinforcement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Stats */}
        <div className="border-border bg-surface-elevated/30 mb-8 rounded-xl border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Star className="text-warning h-5 w-5" />
            <h3 className="text-text font-semibold">What to Expect</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-primary mb-1 text-xl font-bold">50+</div>
              <div className="text-text-secondary text-sm">Concept Folders</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-1 text-xl font-bold">4</div>
              <div className="text-text-secondary text-sm">Poll Types</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-1 text-xl font-bold">Interactive</div>
              <div className="text-text-secondary text-sm">Lists</div>
            </div>
            <div className="text-center">
              <div className="text-primary mb-1 text-xl font-bold">Organized</div>
              <div className="text-text-secondary text-sm">Learning</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="border-border-subtle border-t p-6">
            <h3 className="text-text mb-2 text-lg font-semibold">
              Get Ready to Master Concepts Through Interactive Lists
            </h3>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              We're building an engaging way to learn through organized polls and interactive
              content. Stay tuned for updates!
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

export default PollsListsContent;
