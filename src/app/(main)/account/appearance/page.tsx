'use client';

import { useState } from 'react';

import { getAllThemes, getThemeConfig } from '@/lib/themes';
import { useTheme } from '@/stores/ThemeContext';

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    author: 'Sarah Chen',
    username: '@sarahchen',
    avatar: '👩‍💻',
    content: 'Just shipped a new feature using Connect! The theming system is incredible 🚀',
    timestamp: '2h',
    likes: 42,
    retweets: 12,
    comments: 5,
  },
  {
    id: 2,
    author: 'Alex Rivera',
    username: '@alexcodes',
    avatar: '🧑‍💼',
    content:
      'Working on a dark mode implementation. The Discord theme feels so familiar for developers!',
    timestamp: '4h',
    likes: 28,
    retweets: 8,
    comments: 3,
  },
  {
    id: 3,
    author: 'Jordan Taylor',
    username: '@jordantaylor',
    avatar: '🎨',
    content:
      'The Slack theme is perfect for professional networking. Love how Connect adapts to different use cases.',
    timestamp: '6h',
    likes: 156,
    retweets: 34,
    comments: 12,
  },
  {
    id: 4,
    author: 'Morgan Lee',
    username: '@morganlee',
    avatar: '🚀',
    content:
      "Connect's theme system is a game-changer. From midnight vibes to professional Slack-style - there's something for everyone!",
    timestamp: '8h',
    likes: 89,
    retweets: 45,
    comments: 7,
  },
  {
    id: 5,
    author: 'Dev Community',
    username: '@devs',
    avatar: '💻',
    content:
      'The Discord theme brings that gaming community feel to professional networking. Perfect for tech communities!',
    timestamp: '12h',
    likes: 203,
    retweets: 67,
    comments: 18,
  },
];

// Mock pages
const pages = [
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'explore', name: 'Explore', icon: '🔍' },
  { id: 'communities', name: 'Communities', icon: '👥' },
  { id: 'messages', name: 'Messages', icon: '✉️' },
  { id: 'profile', name: 'Profile', icon: '👤' },
];

function ConnectThemeDemoContent() {
  const { theme, setTheme } = useTheme();
  const [activePage, setActivePage] = useState('home');
  const themes = getAllThemes();

  // Post component
  const Post = ({ post }: { post: (typeof mockPosts)[0] }) => (
    <article className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
      <div className="flex gap-3">
        <div className="text-2xl">{post.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h3 className="text-text font-semibold">{post.author}</h3>
            <span className="text-text-secondary text-sm">{post.username}</span>
            <span className="text-text-secondary text-sm">· {post.timestamp}</span>
          </div>
          <p className="text-text mt-2 leading-relaxed">{post.content}</p>
          <div className="mt-3 flex gap-8">
            <button className="text-text-muted hover:text-primary hover:bg-primary/10 flex items-center gap-1.5 rounded-full p-2 transition-all">
              <span className="text-sm">💬</span>
              <span className="text-xs">{post.comments}</span>
            </button>
            <button className="text-text-muted hover:text-success hover:bg-success/10 flex items-center gap-1.5 rounded-full p-2 transition-all">
              <span className="text-sm">🔁</span>
              <span className="text-xs">{post.retweets}</span>
            </button>
            <button className="text-text-muted hover:text-error hover:bg-error/10 flex items-center gap-1.5 rounded-full p-2 transition-all">
              <span className="text-sm">❤️</span>
              <span className="text-xs">{post.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );

  // Page content renderer
  const renderPageContent = (pageId: string) => {
    switch (pageId) {
      case 'home':
        return (
          <div>
            <div className="border-border-subtle border-b p-4 backdrop-blur">
              <h1 className="text-text text-xl font-bold">Home</h1>
              <p className="text-text-secondary mt-1 text-sm">
                The verified voice of news in the age of AI
              </p>
            </div>
            {mockPosts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        );
      case 'explore':
        return (
          <div className="p-4">
            <h1 className="text-text mb-4 text-xl font-bold">Explore</h1>
            <div className="space-y-3">
              <div className="bg-surface-elevated border-border-subtle rounded-lg border p-4">
                <h2 className="text-primary font-semibold">#ConnectThemes</h2>
                <p className="text-text-secondary text-sm">Trending with 2.5k posts</p>
              </div>
              <div className="bg-surface-elevated border-border-subtle rounded-lg border p-4">
                <h2 className="text-primary font-semibold">#RealHumans</h2>
                <p className="text-text-secondary text-sm">1.8k posts</p>
              </div>
              <div className="bg-surface-elevated border-border-subtle rounded-lg border p-4">
                <h2 className="text-primary font-semibold">#ProfessionalNetworking</h2>
                <p className="text-text-secondary text-sm">3.2k posts</p>
              </div>
              <div className="bg-gradient-primary discord-glow rounded-lg p-4">
                <h2 className="text-background font-semibold">#ThemeShowcase</h2>
                <p className="text-background/80 text-sm">Beautiful themes are trending!</p>
              </div>
            </div>
          </div>
        );
      case 'communities':
        return (
          <div className="p-4">
            <h1 className="text-text mb-4 text-xl font-bold">Communities</h1>
            <div className="space-y-3">
              <div className="hover:bg-surface-elevated border-border-subtle rounded-lg border p-4 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-background flex h-10 w-10 items-center justify-center rounded-full font-bold">
                    🎮
                  </div>
                  <div>
                    <h3 className="text-text font-semibold">Gaming Devs</h3>
                    <p className="text-text-secondary text-sm">2.1k members</p>
                  </div>
                </div>
              </div>
              <div className="hover:bg-surface-elevated border-border-subtle rounded-lg border p-4 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary text-background flex h-10 w-10 items-center justify-center rounded-full font-bold">
                    💼
                  </div>
                  <div>
                    <h3 className="text-text font-semibold">Professional Network</h3>
                    <p className="text-text-secondary text-sm">5.4k members</p>
                  </div>
                </div>
              </div>
              <div className="hover:bg-surface-elevated border-border-subtle rounded-lg border p-4 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-accent text-background flex h-10 w-10 items-center justify-center rounded-full font-bold">
                    🎨
                  </div>
                  <div>
                    <h3 className="text-text font-semibold">Design & UI</h3>
                    <p className="text-text-secondary text-sm">3.7k members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="p-4">
            <h1 className="text-text mb-4 text-xl font-bold">Messages</h1>
            <div className="space-y-2">
              <div className="hover:bg-surface-elevated slack-border cursor-pointer rounded-lg p-3 transition-colors">
                <div className="flex justify-between">
                  <span className="text-text font-semibold">Jordan Taylor</span>
                  <span className="text-text-secondary text-sm">2h</span>
                </div>
                <p className="text-text-secondary text-sm">
                  The new theme system is incredible! 🎨
                </p>
              </div>
              <div className="hover:bg-surface-elevated cursor-pointer rounded-lg p-3 transition-colors">
                <div className="flex justify-between">
                  <span className="text-text font-semibold">Alex Rivera</span>
                  <span className="text-text-secondary text-sm">4h</span>
                </div>
                <p className="text-text-secondary text-sm">
                  Discord theme feels like home for devs!
                </p>
              </div>
              <div className="hover:bg-surface-elevated cursor-pointer rounded-lg p-3 transition-colors">
                <div className="flex justify-between">
                  <span className="text-text font-semibold">Sarah Chen</span>
                  <span className="text-text-secondary text-sm">6h</span>
                </div>
                <p className="text-text-secondary text-sm">
                  Slack theme is perfect for work discussions
                </p>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-4">
            <div className="mb-6 text-center">
              <div className="mb-3 text-5xl">👨‍💻</div>
              <h1 className="text-text text-xl font-bold">Your Profile</h1>
              <p className="text-text-secondary">@connectuser</p>
              <p className="text-text-muted mt-1 text-sm">Theme enthusiast & real human</p>
            </div>
            <div className="space-y-3">
              <div className="bg-surface-elevated border-border-subtle rounded-lg border p-4">
                <p className="text-text-secondary text-sm">Followers</p>
                <p className="text-primary text-2xl font-bold">1,234</p>
              </div>
              <div className="bg-surface-elevated border-border-subtle rounded-lg border p-4">
                <p className="text-text-secondary text-sm">Following</p>
                <p className="text-primary text-2xl font-bold">567</p>
              </div>
              <div className="card-gradient">
                <p className="text-text-secondary text-sm">Posts with themes</p>
                <p className="text-text text-2xl font-bold">89</p>
              </div>
              <div className="bg-gradient-accent ember-effect rounded-lg p-4">
                <p className="text-background/80 text-sm">Theme switches</p>
                <p className="text-background text-2xl font-bold">156</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <div className="border-border-subtle bg-surface/80 border-b p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-text text-2xl font-bold">Connect Themes</h1>
            <p className="text-text-secondary text-sm">Experience themes in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">Current:</span>
            <span className="bg-primary text-background rounded-lg px-3 py-1.5 text-sm font-medium">
              {getThemeConfig(theme).icon} {getThemeConfig(theme).displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="border-border-subtle hidden w-64 border-r p-4 md:block">
          <div className="space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                  activePage === page.id
                    ? 'bg-primary text-background scale-105 shadow-lg'
                    : 'text-text hover:bg-surface-elevated'
                }`}
              >
                <span className="text-lg">{page.icon}</span>
                <span className="font-medium">{page.name}</span>
              </button>
            ))}
          </div>

          {/* Sidebar showcase */}
          <div className="mt-6 space-y-3">
            <h3 className="text-text-secondary text-sm font-medium">Quick Actions</h3>
            <button className="btn-primary w-full text-sm">Create Post</button>
            <button className="btn-gradient discord-pulse w-full text-sm">Premium Feature</button>
            <div className="bg-gradient-animated slack-highlight flex h-12 items-center justify-center rounded-lg">
              <span className="text-background text-sm font-medium">Live Updates</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">{renderPageContent(activePage)}</div>

        {/* Right sidebar - Theme preview */}
        <div className="border-border-subtle hidden w-80 border-l p-4 lg:block">
          <h3 className="text-text mb-4 text-lg font-bold">Theme Studio</h3>
          <div className="space-y-4">
            {/* Current theme info */}
            <div className="card-special">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">{getThemeConfig(theme).icon}</span>
                <h4 className="text-text font-semibold">{getThemeConfig(theme).displayName}</h4>
              </div>
              <p className="text-text-secondary mb-3 text-sm">
                {getThemeConfig(theme).description}
              </p>
              <div className="flex gap-2">
                <div className="bg-primary h-4 w-4 rounded-full shadow-sm"></div>
                <div className="bg-secondary h-4 w-4 rounded-full shadow-sm"></div>
                <div className="bg-accent h-4 w-4 rounded-full shadow-sm"></div>
              </div>
            </div>

            {/* Gradient showcase */}
            <div className="space-y-2">
              <h4 className="text-text text-sm font-medium">Color Gradients</h4>
              <div className="bg-gradient-primary flex h-10 items-center justify-center rounded-lg">
                <span className="text-background text-xs font-medium">Primary Gradient</span>
              </div>
              <div className="bg-gradient-accent flex h-10 items-center justify-center rounded-lg">
                <span className="text-background text-xs font-medium">Accent Gradient</span>
              </div>
              <div className="bg-gradient-surface border-border flex h-10 items-center justify-center rounded-lg border">
                <span className="text-text text-xs font-medium">Surface Gradient</span>
              </div>
            </div>

            {/* Special effects demo */}
            <div className="space-y-2">
              <h4 className="text-text text-sm font-medium">Special Effects</h4>
              <div className="bg-primary glow-effect flex h-12 items-center justify-center rounded-lg">
                <span className="text-background text-xs font-medium">Glow Effect</span>
              </div>
              <div className="bg-surface-elevated wave-effect border-border flex h-12 items-center justify-center rounded-lg border">
                <span className="text-text text-xs font-medium">Wave Animation</span>
              </div>
              <div className="bg-accent ember-effect flex h-12 items-center justify-center rounded-lg">
                <span className="text-background text-xs font-medium">Ember Pulse</span>
              </div>
            </div>

            {/* Theme-specific components */}
            {theme === 'discord' && (
              <div className="space-y-2">
                <h4 className="text-text text-sm font-medium">Discord Features</h4>
                <button className="btn-discord w-full text-sm">Discord Button</button>
                <div className="discord-pulse bg-primary rounded-lg p-3 text-center">
                  <span className="text-background text-xs">Gaming Vibes</span>
                </div>
              </div>
            )}

            {theme === 'slack' && (
              <div className="space-y-2">
                <h4 className="text-text text-sm font-medium">Slack Features</h4>
                <button className="btn-slack w-full text-sm">Slack Button</button>
                <div className="slack-border bg-surface-elevated rounded-lg p-3">
                  <span className="text-text text-xs">Professional Focus</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme selector - bottom */}
      <div className="border-border-subtle bg-surface/90 border-t backdrop-blur">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-text-secondary text-sm font-medium">Choose Your Theme:</p>
            <p className="text-text-muted text-xs">{themes.length} themes available</p>
          </div>
          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {themes.map((themeConfig) => (
              <button
                key={themeConfig.name}
                onClick={() => setTheme(themeConfig.name)}
                className={`flex-shrink-0 rounded-xl border p-4 transition-all duration-200 ${
                  theme === themeConfig.name
                    ? 'border-primary bg-primary text-background scale-105 transform shadow-lg'
                    : 'border-border bg-surface hover:border-primary hover:bg-surface-elevated hover:scale-102 hover:shadow-md'
                }`}
              >
                <div className="min-w-[80px] text-center">
                  <div className="mb-2 text-2xl">{themeConfig.icon}</div>
                  <p className="text-sm font-semibold">{themeConfig.displayName}</p>
                  <p className="mt-1 text-xs opacity-75">
                    {themeConfig.isDark ? '🌙 Dark' : '☀️ Light'}
                  </p>
                  {themeConfig.specialEffects.length > 0 && (
                    <p className="mt-1 text-xs opacity-60">✨ Effects</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default function ConnectThemeDemo() {
  return (
    <div className="min-h-screen">
      <ConnectThemeDemoContent />
    </div>
  );
}
