'use client';

import React from 'react';

import Image from 'next/image';

import { Clock, Trophy } from 'lucide-react';

const LeaderboardContent = () => {
  const mockLeaderboardData = [
    { rank: 1, username: 'alex_chen', aura: 2847, streak: 23, avatar: null },
    { rank: 2, username: 'sarah_m', aura: 2634, streak: 19, avatar: null },
    { rank: 3, username: 'dev_mike', aura: 2521, streak: 17, avatar: null },
    { rank: 4, username: 'poll_master', aura: 2398, streak: 15, avatar: null },
    { rank: 5, username: 'community_hero', aura: 2156, streak: 12, avatar: null },
    { rank: 6, username: 'vote_ninja', aura: 1987, streak: 8, avatar: null },
    { rank: 7, username: 'debate_queen', aura: 1843, streak: 6, avatar: null },
    { rank: 8, username: 'poll_wizard', aura: 1729, streak: 4, avatar: null },
  ];

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const getRankDisplay = (index: number, rank: number) => {
    if (index < 3) {
      const colors = ['bg-warning', 'bg-text-muted', 'bg-warning/70'];
      return (
        <div
          className={`text-background flex h-9 w-9 items-center justify-center rounded-full font-bold ${colors[index]}`}
        >
          {rank}
        </div>
      );
    }
    return (
      <div className="bg-surface-elevated text-text-secondary border-border flex h-9 w-9 items-center justify-center rounded-full border font-medium">
        {rank}
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-primary mb-3">
            <Trophy className="mx-auto h-8 w-8" />
          </div>
          <h2 className="text-text mb-2 text-2xl font-bold">Community Leaderboard</h2>
          <p className="text-text-secondary text-sm">
            {currentMonth} • Top contributors ranked by Aura & Daily Streaks
          </p>
        </div>

        {/* Preview Notice */}
        <div className="border-warning/20 bg-warning/10 border-l-warning mb-8 rounded-lg border border-l-4 p-4">
          <div className="flex items-center">
            <Trophy className="text-warning mr-2 h-5 w-5" />
            <div>
              <p className="text-warning text-sm font-medium">Feature Preview</p>
              <p className="text-text-secondary mt-1 text-xs">
                Leaderboard is coming soon! This is a preview of what's to come.
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-0">
          {mockLeaderboardData.map((user, index) => (
            <div
              key={user.username}
              className={`border-border-subtle hover:bg-surface-elevated/30 border-b py-4 transition-colors ${
                index < 3 ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0">{getRankDisplay(index, user.rank)}</div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      className="h-11 w-11 rounded-full object-cover"
                      width={44}
                      height={44}
                    />
                  ) : (
                    <div className="text-background bg-primary flex h-11 w-11 items-center justify-center rounded-full font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-text truncate font-semibold">@{user.username}</span>
                    {index < 3 && (
                      <div className="text-warning">
                        <Trophy className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="text-text-secondary text-sm">
                    <span className="font-medium">{user.aura.toLocaleString()} Aura</span>
                    <span className="mx-2">•</span>
                    <span>{user.streak} day streak</span>
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="flex-shrink-0">
                  <div className="bg-success/10 text-success border-success/20 flex items-center gap-1.5 rounded-full border px-2.5 py-1.5">
                    <div className="bg-success h-1.5 w-1.5 rounded-full"></div>
                    <span className="text-xs font-medium">{user.streak}d</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="border-border bg-surface-elevated/30 mt-8 rounded-lg border p-6">
          <h3 className="text-text mb-4 font-semibold">This Month's Highlights</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-primary text-xl font-bold">
                {mockLeaderboardData[0]?.aura.toLocaleString()}
              </div>
              <div className="text-text-secondary text-xs">Top Aura</div>
            </div>
            <div>
              <div className="text-success text-xl font-bold">{mockLeaderboardData[0]?.streak}</div>
              <div className="text-text-secondary text-xs">Longest Streak</div>
            </div>
            <div>
              <div className="text-accent text-xl font-bold">{mockLeaderboardData.length}</div>
              <div className="text-text-secondary text-xs">Active Users</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border-subtle mt-8 border-t pt-8 text-center">
          <Clock className="text-text-muted mx-auto mb-3 h-6 w-6" />
          <p className="text-text-secondary text-sm">
            Full leaderboard functionality launching soon with weekly and monthly rankings
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardContent;
