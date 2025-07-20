import React from 'react';

import { Clock, Crown, Medal, Sword, Timer, Trophy, Users, Zap } from 'lucide-react';

const BattlesContent = () => {
  return (
    <div className="bg-background min-h-screen p-4">
      <div className="mx-auto max-w-2xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <Zap className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900 shadow-md">
              SOON
            </div>
          </div>

          <h1 className="text-text mb-4 text-3xl font-bold">Quiz Battles</h1>

          <p className="text-text-secondary mb-6 text-lg leading-relaxed">
            Compete against other community members in fast-paced, time-based quiz challenges. Test
            your knowledge and climb the leaderboard!
          </p>
        </div>

        {/* Battle Format Preview */}
        <div className="mb-8 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6 dark:border-red-700 dark:from-red-900/20 dark:to-orange-900/20">
          <div className="mb-4 flex items-center gap-3">
            <Sword className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h3 className="text-text text-lg font-semibold">Battle Format</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white/50 p-4 text-center dark:bg-gray-800/50">
              <Timer className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <div className="text-text mb-1 text-xl font-bold">20 Min</div>
              <div className="text-text-secondary text-sm">Time Limit</div>
            </div>
            <div className="rounded-lg bg-white/50 p-4 text-center dark:bg-gray-800/50">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-orange-500" />
              <div className="text-text mb-1 text-xl font-bold">10-20</div>
              <div className="text-text-secondary text-sm">Questions</div>
            </div>
            <div className="rounded-lg bg-white/50 p-4 text-center dark:bg-gray-800/50">
              <Users className="mx-auto mb-2 h-8 w-8 text-red-600" />
              <div className="text-text mb-1 text-xl font-bold">1v1</div>
              <div className="text-text-secondary text-sm">Head to Head</div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-4">
          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Real-time Competition</h3>
                <p className="text-text-secondary">
                  Challenge other members to intense quiz battles with live scoring and immediate
                  results.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Time Pressure</h3>
                <p className="text-text-secondary">
                  Quick thinking is key! Answer questions fast and accurately to gain an edge over
                  your opponent.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <Medal className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Ranking System</h3>
                <p className="text-text-secondary">
                  Earn points, climb rankings, and unlock achievements based on your battle
                  performance.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border-border hover:bg-surface-elevated rounded-xl border p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-2 text-lg font-semibold">Tournament Mode</h3>
                <p className="text-text-secondary">
                  Participate in community tournaments and special events for ultimate bragging
                  rights.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Stats Preview */}
        <div className="bg-surface border-border mb-8 rounded-xl border p-6">
          <h3 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Battle Arena Statistics
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-primary mb-1 text-2xl font-bold">Fast</div>
              <div className="text-text-secondary text-sm">Lightning Rounds</div>
            </div>
            <div>
              <div className="text-primary mb-1 text-2xl font-bold">Fair</div>
              <div className="text-text-secondary text-sm">Skill-based Matching</div>
            </div>
            <div>
              <div className="text-primary mb-1 text-2xl font-bold">Fun</div>
              <div className="text-text-secondary text-sm">Competitive Spirit</div>
            </div>
            <div>
              <div className="text-primary mb-1 text-2xl font-bold">Fierce</div>
              <div className="text-text-secondary text-sm">Epic Battles</div>
            </div>
          </div>
        </div>

        {/* Challenge Preview */}
        <div className="mb-8 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Sword className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-text mb-2 text-lg font-semibold">Ready for Battle?</h3>
            <p className="text-text-secondary text-sm">
              Sharpen your knowledge and prepare for intense quiz battles coming to your community!
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-surface border-border rounded-xl border p-8">
            <h3 className="text-text mb-3 text-xl font-semibold">The Arena Awaits</h3>
            <p className="text-text-secondary mb-6">
              Get ready to prove your knowledge supremacy in thrilling quiz battles against fellow
              community members!
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

export default BattlesContent;
