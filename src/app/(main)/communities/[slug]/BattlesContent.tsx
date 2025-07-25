import React from 'react';

import { Crown, Medal, Sword, Timer, Trophy, Users, Zap } from 'lucide-react';

const BattlesContent = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="relative mb-6">
            <div className="bg-error/10 border-error/20 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border">
              <Sword className="text-error h-10 w-10" />
            </div>
            <div className="bg-warning text-background absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm">
              SOON
            </div>
          </div>

          <h1 className="text-text mb-3 text-2xl font-bold">Quiz Battles</h1>

          <p className="text-text-secondary leading-relaxed">
            Challenge community members in fast-paced quiz battles. Compete, win, and climb the
            leaderboard!
          </p>
        </div>

        {/* Battle Format */}
        <div className="border-border bg-surface-elevated/30 mb-8 rounded-xl border p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Timer className="text-error mx-auto mb-2 h-6 w-6" />
              <div className="text-text mb-1 text-lg font-bold">20 Min</div>
              <div className="text-text-secondary text-sm">Time Limit</div>
            </div>
            <div>
              <Trophy className="text-warning mx-auto mb-2 h-6 w-6" />
              <div className="text-text mb-1 text-lg font-bold">15</div>
              <div className="text-text-secondary text-sm">Questions</div>
            </div>
            <div>
              <Users className="text-error mx-auto mb-2 h-6 w-6" />
              <div className="text-text mb-1 text-lg font-bold">1v1</div>
              <div className="text-text-secondary text-sm">Head to Head</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="border-border bg-surface-elevated/30 mb-8 rounded-xl border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="text-accent h-5 w-5" />
            <h3 className="text-text font-semibold">Leaderboard</h3>
          </div>

          <div className="space-y-2">
            <div className="border-border-subtle flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-3">
                <div className="bg-warning text-background flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  1
                </div>
                <span className="text-text font-medium">Sarah K.</span>
              </div>
              <div className="text-right">
                <div className="text-text text-sm font-medium">127 Battles</div>
                <div className="text-text-secondary text-xs">89% Win Rate</div>
              </div>
            </div>

            <div className="border-border-subtle flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-3">
                <div className="bg-text-muted text-background flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  2
                </div>
                <span className="text-text font-medium">Mike R.</span>
              </div>
              <div className="text-right">
                <div className="text-text text-sm font-medium">98 Battles</div>
                <div className="text-text-secondary text-xs">85% Win Rate</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="bg-warning text-background flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  3
                </div>
                <span className="text-text font-medium">Alex P.</span>
              </div>
              <div className="text-right">
                <div className="text-text text-sm font-medium">76 Battles</div>
                <div className="text-text-secondary text-xs">82% Win Rate</div>
              </div>
            </div>
          </div>

          <div className="border-border-subtle mt-4 border-t pt-3 text-center">
            <span className="text-text-secondary text-sm">
              Ranked by battles participated & win rate
            </span>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-8 space-y-3">
          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-error/10 mt-0.5 rounded-lg p-2">
                <Zap className="text-error h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Real-time Battles</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Challenge others instantly with live scoring and immediate results.
                </p>
              </div>
            </div>
          </div>

          <div className="hover:bg-surface-elevated/30 p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-warning/10 mt-0.5 rounded-lg p-2">
                <Medal className="text-warning h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-text mb-1 font-semibold">Earn Your Rank</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Win battles to climb the leaderboard and unlock achievements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="border-border-subtle border-t p-6">
            <h3 className="text-text mb-2 text-lg font-semibold">Ready to Battle?</h3>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              Prove your knowledge and climb the leaderboard in epic quiz battles!
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

export default BattlesContent;
