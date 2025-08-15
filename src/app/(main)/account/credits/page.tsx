'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Check,
  CreditCard,
  ExternalLink,
  Gift,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import {
  useKeyopollsTransactionsApiGetCreditsSummary,
  useKeyopollsTransactionsApiGetUserTransactions,
} from '@/api/transactions/transactions';
import BottomNavigation from '@/components/common/BottomNavigation';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

// Loading Skeleton Components
const BalanceCardSkeleton = () => (
  <div className="from-primary to-primary/80 rounded-xl bg-gradient-to-br p-6 text-white">
    <div className="mb-4 flex items-center justify-between">
      <div className="h-6 w-32 animate-pulse rounded bg-white/20" />
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
    </div>
    <div className="mb-2">
      <div className="mb-2 h-10 w-48 animate-pulse rounded bg-white/20" />
      <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
    </div>
  </div>
);

const TransactionsSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-surface border-border flex animate-pulse items-center gap-3 rounded-lg border p-4"
      >
        <div className="bg-surface-elevated h-10 w-10 flex-shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="bg-surface-elevated h-4 w-3/4 rounded" />
          <div className="bg-surface-elevated h-3 w-1/2 rounded" />
        </div>
        <div className="bg-surface-elevated h-6 w-16 rounded" />
      </div>
    ))}
  </div>
);

const CreditsPage = () => {
  const router = useRouter();
  const { accessToken } = useProfileStore();

  // Fetch transactions
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useKeyopollsTransactionsApiGetUserTransactions(
    {
      page: 1,
      per_page: 50, // Get more transactions for better UX
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  // Fetch credits summary
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useKeyopollsTransactionsApiGetCreditsSummary({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, earned, spent, purchases

  // Extract data from API responses
  const transactions = useMemo(
    () => transactionsData?.data?.transactions || [],
    [transactionsData?.data?.transactions]
  );
  const transactionSummary = transactionsData?.data?.summary;
  const creditsSummary = summaryData?.data;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    switch (filterType) {
      case 'earned':
        filtered = filtered.filter((t) => t.is_credit);
        break;
      case 'spent':
        filtered = filtered.filter((t) => t.is_debit);
        break;
      case 'purchases':
        filtered = filtered.filter((t) => t.transaction_type === 'purchase');
        break;
      default:
        break;
    }

    return filtered;
  }, [transactions, searchQuery, filterType]);

  // Helper functions - Updated to format credits instead of dollars
  const formatCredits = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const getTransactionIcon = useCallback((type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="h-5 w-5" />;
      case 'message_sent':
        return <MessageCircle className="h-5 w-5" />;
      case 'message_received':
        return <MessageCircle className="h-5 w-5" />;
      case 'bonus':
        return <Gift className="h-5 w-5" />;
      case 'refund':
        return <RefreshCw className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  }, []);

  const getTransactionColor = useCallback((isCredit: boolean) => {
    return isCredit ? 'text-success' : 'text-error';
  }, []);

  const getTransactionBgColor = useCallback((isCredit: boolean) => {
    return isCredit ? 'bg-success/10' : 'bg-error/10';
  }, []);

  // Handlers
  const handleFilterChange = useCallback((newFilter: string) => {
    setFilterType(newFilter);
  }, []);

  const handleBuyCredits = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  const handleRetry = useCallback(() => {
    refetchTransactions();
    refetchSummary();
  }, [refetchTransactions, refetchSummary]);

  // Show error state
  if (transactionsError || summaryError) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl">
          <div className="border-border-subtle border-b px-4 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="text-text-secondary hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-text text-xl font-bold">Credits</h1>
            </div>
          </div>

          <div className="p-4">
            <div className="py-12 text-center">
              <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Wallet className="text-error h-8 w-8" />
              </div>
              <h3 className="text-text mb-2 text-lg font-semibold">Failed to load credits data</h3>
              <p className="text-text-secondary mx-auto mb-4 max-w-sm text-sm">
                There was an error loading your credits information. Please try again.
              </p>
              <button
                onClick={handleRetry}
                className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="border-border-subtle border-b px-4 py-6">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-text-secondary hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-text text-xl font-bold">Credits</h1>
              <p className="text-text-secondary text-sm">Manage your account balance</p>
            </div>
          </div>

          {/* Balance Card */}
          {summaryLoading ? (
            <BalanceCardSkeleton />
          ) : (
            <div className="from-primary to-primary/80 rounded-xl bg-gradient-to-br p-6 text-white">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Current Balance</h2>
                <Wallet className="h-6 w-6" />
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold">
                  {formatCredits(creditsSummary?.total_credits || 0)} credits
                </div>
                <p className="text-sm text-white/80">Available to spend</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {creditsSummary?.total_earned !== undefined &&
                    (creditsSummary?.total_earned ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>Earned: {formatCredits(creditsSummary.total_earned)} credits</span>
                      </div>
                    )}
                </div>

                <button
                  onClick={handleBuyCredits}
                  className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/30"
                >
                  <Plus className="h-4 w-4" />
                  Buy Credits
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Section */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-text mb-3 text-lg font-semibold">Transaction History</h3>

            {/* Search and Filter */}
            <div className="mb-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="border-border focus:border-primary bg-surface-elevated text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                />
              </div>

              {/* Filter buttons */}
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { key: 'all', label: 'All', icon: null },
                  { key: 'earned', label: 'Earned', icon: TrendingUp },
                  { key: 'spent', label: 'Spent', icon: TrendingDown },
                  { key: 'purchases', label: 'Purchases', icon: CreditCard },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange(key)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      filterType === key
                        ? 'bg-primary text-white'
                        : 'border-border bg-surface text-text-secondary hover:text-text border'
                    }`}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {transactionsLoading ? (
            <TransactionsSkeleton />
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Wallet className="text-text-secondary h-8 w-8" />
              </div>
              <h3 className="text-text mb-2 text-lg font-semibold">
                {searchQuery ? 'No transactions found' : 'No transactions yet'}
              </h3>
              <p className="text-text-secondary mx-auto mb-4 max-w-sm text-sm">
                {searchQuery
                  ? `No transactions match "${searchQuery}". Try a different search term.`
                  : 'Your transaction history will appear here as you use credits.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleBuyCredits}
                  className="bg-primary text-background inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Buy Your First Credits
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-surface border-border hover:bg-surface-elevated/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
                >
                  {/* Icon */}
                  <div
                    className={`rounded-full p-2.5 ${getTransactionBgColor(transaction.is_credit)}`}
                  >
                    <div className={getTransactionColor(transaction.is_credit)}>
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-text truncate text-sm font-medium">
                          {transaction.description || transaction.transaction_type_display}
                        </h4>
                        <div className="text-text-secondary flex items-center gap-2 text-xs">
                          <span>{formatTime(transaction.created_at)}</span>
                          {transaction.status === 'completed' && (
                            <div className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>Completed</span>
                            </div>
                          )}
                          {transaction.status === 'pending' && (
                            <span className="text-warning">Pending</span>
                          )}
                        </div>

                        {/* Additional info from timeline item */}
                        {transaction.timeline_item && (
                          <div className="mt-1 flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-text-secondary text-xs">
                              {transaction.timeline_item.item_type === 'text'
                                ? 'Text message'
                                : transaction.timeline_item.item_type === 'voice_call'
                                  ? 'Voice call'
                                  : transaction.timeline_item.item_type === 'video_call'
                                    ? 'Video call'
                                    : transaction.timeline_item.item_type}
                            </span>
                          </div>
                        )}

                        {transaction.payment_method && (
                          <p className="text-text-secondary text-xs">
                            via {transaction.payment_method}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${getTransactionColor(transaction.is_credit)}`}
                        >
                          {transaction.is_credit ? '+' : '-'}
                          {formatCredits(transaction.amount)} credits
                        </div>
                        {transaction.payment_reference && (
                          <p className="text-text-secondary text-xs">
                            {transaction.payment_reference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more indicator */}
              <div className="py-4 text-center">
                <p className="text-text-secondary text-xs">
                  Showing {filteredTransactions.length} transactions
                </p>
                {transactionSummary?.total_transactions &&
                  transactionSummary?.total_transactions > filteredTransactions.length && (
                    <button
                      className="text-primary mt-2 text-sm hover:underline"
                      onClick={() => {
                        // TODO: Implement load more functionality
                        toast.info('Load more functionality coming soon!');
                      }}
                    >
                      Load more transactions
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CreditsPage;
