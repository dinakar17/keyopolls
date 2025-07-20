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
      const colors = [
        'bg-gradient-to-r from-yellow-400 to-yellow-600',
        'bg-gradient-to-r from-gray-300 to-gray-500',
        'bg-gradient-to-r from-amber-600 to-amber-800',
      ];
      return (
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${colors[index]}`}
        >
          {rank}
        </div>
      );
    }
    return (
      <div className="bg-surface-elevated text-text-secondary flex h-10 w-10 items-center justify-center rounded-full font-medium">
        {rank}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <div className="text-primary mb-3">
          <Trophy className="mx-auto h-10 w-10" />
        </div>
        <h2 className="text-text mb-2 text-2xl font-bold">Community Leaderboard</h2>
        <p className="text-text-secondary text-sm">
          {currentMonth} • Top contributors ranked by Aura & Daily Streaks
        </p>
      </div>

      {/* Preview Notice */}
      <div className="rounded-r-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Feature Preview</p>
            <p className="mt-1 text-xs text-yellow-700">
              Leaderboard is coming soon! This is a preview of what's to come.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {mockLeaderboardData.map((user, index) => (
          <div
            key={user.username}
            className={`border-border-subtle border-b py-4 last:border-b-0 ${
              index < 3 ? 'from-primary/5 bg-gradient-to-r to-transparent' : ''
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
                    className="h-12 w-12 rounded-full object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="text-background flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-text truncate text-lg font-semibold">@{user.username}</span>
                  {index < 3 && (
                    <div className="text-primary">
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
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-green-800">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">{user.streak}d</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="bg-surface-elevated mt-6 rounded-lg p-4">
        <h3 className="text-text mb-3 font-semibold">This Month's Highlights</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-primary text-2xl font-bold">
              {mockLeaderboardData[0]?.aura.toLocaleString()}
            </div>
            <div className="text-text-secondary text-xs">Top Aura</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {mockLeaderboardData[0]?.streak}
            </div>
            <div className="text-text-secondary text-xs">Longest Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{mockLeaderboardData.length}</div>
            <div className="text-text-secondary text-xs">Active Users</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <Clock className="text-text-muted mx-auto mb-3 h-8 w-8" />
        <p className="text-text-secondary text-sm">
          Full leaderboard functionality launching soon with weekly and monthly rankings
        </p>
      </div>
    </div>
  );
};

export default LeaderboardContent;
