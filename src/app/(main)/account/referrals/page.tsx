'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Gift,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockReferralData = {
  referralCode: 'APEX-USER123',
  totalReferrals: 8,
  qualifiedExperts: 5,
  pendingApprovals: 2,
  totalEarnings: 2847.5,
  monthlyEarnings: 485.2,
  referralLink: 'https://apex.com/join?ref=APEX-USER123',
};

const mockReferralHistory = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 's***@email.com',
    status: 'qualified',
    joinDate: '2025-01-15',
    expertise: 'Product Management',
    monthlyEarnings: 125.5,
    totalEarned: 890.75,
    remainingMonths: 8,
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    email: 'm***@email.com',
    status: 'qualified',
    joinDate: '2024-12-10',
    expertise: 'Software Engineering',
    monthlyEarnings: 89.3,
    totalEarned: 625.1,
    remainingMonths: 6,
  },
  {
    id: 3,
    name: 'Emily Johnson',
    email: 'e***@email.com',
    status: 'pending',
    joinDate: '2025-01-28',
    expertise: 'UX Design',
    monthlyEarnings: 0,
    totalEarned: 0,
    remainingMonths: 12,
  },
  {
    id: 4,
    name: 'David Park',
    email: 'd***@email.com',
    status: 'qualified',
    joinDate: '2024-11-20',
    expertise: 'Marketing Strategy',
    monthlyEarnings: 156.8,
    totalEarned: 1098.6,
    remainingMonths: 5,
  },
];

const ReferralsPage: React.FC = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(mockReferralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Apex - Learn from those who've lived it",
          text: "Connect with experienced professionals who've been there and done that.",
          url: mockReferralData.referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'qualified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle size={12} />
            Qualified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <Clock size={12} />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background border-border-subtle sticky top-0 z-10 border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="text-text-muted hover:text-text rounded-full p-2 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Gift className="text-primary h-6 w-6" />
                <h1 className="text-text text-xl font-semibold">Referral Program</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Program Overview */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <Award className="text-primary h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-text mb-2 text-lg font-semibold">Earn 5% for 1 Year</h2>
              <p className="text-text-secondary mb-4 text-sm">
                When you refer a qualified expert who gets approved on Apex, you'll earn 5% of their
                monthly earnings for 12 months. Help grow our community of experienced
                professionals!
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-text text-xl font-bold">
                    {mockReferralData.totalReferrals}
                  </div>
                  <div className="text-text-secondary text-xs">Total Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-text text-xl font-bold">
                    {mockReferralData.qualifiedExperts}
                  </div>
                  <div className="text-text-secondary text-xs">Qualified Experts</div>
                </div>
                <div className="text-center">
                  <div className="text-primary text-xl font-bold">
                    {formatCurrency(mockReferralData.totalEarnings)}
                  </div>
                  <div className="text-text-secondary text-xs">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(mockReferralData.monthlyEarnings)}
                  </div>
                  <div className="text-text-secondary text-xs">This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Your Link */}
        <div className="bg-surface-elevated border-border mb-6 rounded-lg border p-6">
          <h3 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
            <Share2 size={20} />
            Share Your Referral Link
          </h3>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={mockReferralData.referralLink}
                readOnly
                className="bg-background border-border text-text flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="bg-primary text-background hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="border-border text-text hover:bg-surface-elevated flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                <Share2 size={16} />
                Share Link
              </button>
              <button
                onClick={() =>
                  window.open(
                    `mailto:?subject=Join Apex&body=Connect with experienced professionals at ${mockReferralData.referralLink}`,
                    '_blank'
                  )
                }
                className="border-border text-text hover:bg-surface-elevated flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                <ExternalLink size={16} />
                Email
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Your referral code:</strong> {mockReferralData.referralCode}
            </p>
            <p className="mt-1 text-xs text-blue-700">
              Referrals can also use this code during signup to link their account to you.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border-subtle mb-6 border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'text-text-muted hover:text-text border-transparent'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'text-text-muted hover:text-text border-transparent'
              }`}
            >
              Referral History ({mockReferralHistory.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Earnings Summary */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-surface-elevated border-border rounded-lg border p-6">
                <div className="mb-4 flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-text text-lg font-semibold">Current Earnings</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">This Month</span>
                    <span className="text-text font-medium">
                      {formatCurrency(mockReferralData.monthlyEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Total Lifetime</span>
                    <span className="text-text font-medium">
                      {formatCurrency(mockReferralData.totalEarnings)}
                    </span>
                  </div>
                  <div className="bg-border-subtle my-3 h-px"></div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Active Referrals</span>
                    <span className="text-primary font-medium">
                      {mockReferralData.qualifiedExperts}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-elevated border-border rounded-lg border p-6">
                <div className="mb-4 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="text-text text-lg font-semibold">Performance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Conversion Rate</span>
                    <span className="text-text font-medium">62.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Avg. Monthly per Referral</span>
                    <span className="text-text font-medium">
                      {formatCurrency(
                        mockReferralData.monthlyEarnings / mockReferralData.qualifiedExperts
                      )}
                    </span>
                  </div>
                  <div className="bg-border-subtle my-3 h-px"></div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Pending Approvals</span>
                    <span className="font-medium text-yellow-600">
                      {mockReferralData.pendingApprovals}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-surface-elevated border-border rounded-lg border p-6">
              <h3 className="text-text mb-4 text-lg font-semibold">How It Works</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 p-3">
                    <Share2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-text mb-2 font-medium">1. Share Your Link</h4>
                  <p className="text-text-secondary text-sm">
                    Send your unique referral link to potential experts in your network.
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 p-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="text-text mb-2 font-medium">2. They Get Approved</h4>
                  <p className="text-text-secondary text-sm">
                    Your referral signs up and gets approved as a qualified expert on Apex.
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 p-3">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="text-text mb-2 font-medium">3. You Earn 5%</h4>
                  <p className="text-text-secondary text-sm">
                    Receive 5% of their monthly earnings for 12 months automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {mockReferralHistory.map((referral) => (
              <div
                key={referral.id}
                className="bg-surface-elevated border-border rounded-lg border p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h4 className="text-text font-medium">{referral.name}</h4>
                      {getStatusBadge(referral.status)}
                    </div>
                    <p className="text-text-secondary text-sm">
                      {referral.email} • {referral.expertise}
                    </p>
                    <p className="text-text-secondary text-xs">
                      Joined {formatDate(referral.joinDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-text font-medium">
                      {formatCurrency(referral.totalEarned)}
                    </div>
                    <div className="text-text-secondary text-sm">Total earned</div>
                  </div>
                </div>

                {referral.status === 'qualified' && (
                  <div className="border-border-subtle grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-3">
                    <div>
                      <div className="text-text-secondary text-xs">Monthly Earnings</div>
                      <div className="text-text font-medium">
                        {formatCurrency(referral.monthlyEarnings)}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-xs">Remaining Months</div>
                      <div className="text-text font-medium">{referral.remainingMonths} months</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-xs">Next Payment</div>
                      <div className="text-text font-medium">Jan 31, 2025</div>
                    </div>
                  </div>
                )}

                {referral.status === 'pending' && (
                  <div className="border-border-subtle border-t pt-4">
                    <div className="rounded-lg bg-yellow-50 p-3">
                      <p className="text-sm text-yellow-800">
                        <Clock size={14} className="mr-1 inline" />
                        Application under review. You'll start earning once approved.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {mockReferralHistory.length === 0 && (
              <div className="py-12 text-center">
                <Users className="text-text-muted mx-auto mb-4 h-12 w-12" />
                <h3 className="text-text mb-2 text-lg font-medium">No referrals yet</h3>
                <p className="text-text-secondary">
                  Start sharing your referral link to earn from qualified experts!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsPage;
