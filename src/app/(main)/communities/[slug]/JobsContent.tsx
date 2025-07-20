'use client';

import React from 'react';

import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

const JobsContent = () => {
  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-2xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Briefcase className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900 shadow-md">
              SOON
            </div>
          </div>

          <h1 className="text-text mb-4 text-3xl font-bold">Community-Tailored Jobs</h1>

          <p className="text-text-secondary mb-6 text-lg leading-relaxed">
            Revolutionary job board that eliminates ghosting and provides personalized opportunities
            for your specific community expertise.
          </p>
        </div>

        {/* Community-Specific Feature */}
        <div className="mb-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-500 p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-text mb-2 flex items-center gap-2 text-lg font-semibold">
                Tailored to Your Community
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                  Smart Matching
                </span>
              </h3>
              <p className="text-text-secondary mb-3 text-sm">
                See only jobs relevant to your community expertise. Machine Learning Engineers see
                ML jobs, Frontend Developers see React positions, Data Scientists see analytics
                roles.
              </p>
              <div className="rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                <p className="text-text-secondary text-xs">
                  <strong>Example:</strong> In "Machine Learning Engineers" community, you'll only
                  see positions requiring ML expertise - no irrelevant job spam!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revolutionary Features */}
        <div className="mb-8 space-y-4">
          <h2 className="text-text mb-4 flex items-center gap-2 text-xl font-semibold">
            <Zap className="h-5 w-5 text-yellow-500" />
            Game-Changing Features
          </h2>

          {/* No Resume Required */}
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">No Resume Required</h3>
                <p className="text-text-secondary mb-3">
                  AI-powered profile fields automatically generate standardized applications. Simply
                  fill out your skills and experience once - our AI handles the rest.
                </p>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✨ <strong>Smart Feature:</strong> AI creates professional applications from
                    your profile data
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Honest Probability */}
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">
                  Honest Selection Probability
                </h3>
                <p className="text-text-secondary mb-3">
                  No more delusion! See your actual chances based on skills and experience. Low
                  probability? We'll tell you upfront and suggest improvements.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-text-secondary">
                      High Match (80-100%): Apply with confidence
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-text-secondary">Medium Match (50-79%): Worth a shot</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-text-secondary">
                      Low Match (0-49%): Improve skills first
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Jobs Only */}
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">3-Week Active Window</h3>
                <p className="text-text-secondary mb-3">
                  All jobs auto-expire after 3 weeks. No stale postings, no false hope. Every job
                  you see is actively hiring right now.
                </p>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ⏰ <strong>Real-time updates:</strong> Jobs vanish automatically to keep the
                    board fresh and relevant
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guaranteed Responses */}
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <Bell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">100% Response Guarantee</h3>
                <p className="text-text-secondary mb-3">
                  Every application gets a response within 4 weeks - via email or app notification.
                  No more ghosting, ever.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-text-secondary text-sm">
                    Zero applications left unanswered
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Limits */}
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Quality Over Quantity</h3>
                <p className="text-text-secondary mb-3">
                  Maximum 20 applications per week to prevent spam and ensure quality applications.
                  Choose wisely, apply strategically.
                </p>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    🎯 <strong>Strategic applications:</strong> Focus on quality matches rather than
                    mass applying
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mb-8 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-text mb-2 text-lg font-semibold">Ending Job Market Ghosting</h3>
            <p className="text-text-secondary mb-4 text-sm">
              We're revolutionizing job hunting by eliminating the "ghostly" experience. Every
              candidate deserves honest feedback and realistic expectations.
            </p>
            <div className="rounded-lg bg-white/50 p-4 dark:bg-gray-800/50">
              <p className="text-text text-sm font-medium">
                "No more delusion. No more ghosting. Just honest, transparent job hunting that
                respects both candidates and employers."
              </p>
            </div>
          </div>
        </div>

        {/* Sample Community Examples */}
        <div className="bg-surface border-border mb-8 rounded-xl border p-6">
          <h3 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
            <Target className="text-primary h-5 w-5" />
            Community-Specific Job Examples
          </h3>

          <div className="space-y-3">
            <div className="bg-surface-elevated rounded-lg p-3">
              <div className="text-text mb-1 text-sm font-medium">Machine Learning Engineers</div>
              <div className="text-text-secondary text-xs">
                ML Engineer, Data Scientist, AI Researcher, MLOps Engineer
              </div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-3">
              <div className="text-text mb-1 text-sm font-medium">Frontend Developers</div>
              <div className="text-text-secondary text-xs">
                React Developer, Vue.js Engineer, UI Developer, Frontend Lead
              </div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-3">
              <div className="text-text mb-1 text-sm font-medium">Product Managers</div>
              <div className="text-text-secondary text-xs">
                Senior PM, Technical PM, Growth PM, Strategy Manager
              </div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-3">
              <div className="text-text mb-1 text-sm font-medium">DevOps Engineers</div>
              <div className="text-text-secondary text-xs">
                Cloud Engineer, Site Reliability Engineer, Platform Engineer
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-surface border-border rounded-xl border p-8">
            <h3 className="text-text mb-3 text-xl font-semibold">
              Ready to Change Job Hunting Forever?
            </h3>
            <p className="text-text-secondary mb-6">
              Join the revolution against ghosting. Get honest feedback, real opportunities, and
              guaranteed responses.
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

export default JobsContent;
