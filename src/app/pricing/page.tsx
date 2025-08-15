'use client';

import React, { useCallback, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Check,
  Crown,
  ExternalLink,
  Gift,
  Package,
  Plus,
  Star,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';

import BottomNavigation from '@/components/common/BottomNavigation';
import { toast } from '@/components/ui/toast';

// Pricing tiers
const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free Starter',
    description: 'Perfect for getting started',
    price: 0,
    credits: 4,
    bonusCredits: 0,
    period: 'one-time',
    popular: false,
    features: [
      '4 free credits on signup',
      'Message any mentor',
      'Basic support',
      'Community access',
    ],
    limitations: ['No recurring credits', 'Limited mentor interactions'],
    buttonText: 'Get Started Free',
    buttonVariant: 'secondary',
    badge: 'Free',
    badgeColor: 'bg-success',
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Great for regular users',
    price: 299,
    credits: 30,
    bonusCredits: 0,
    period: 'month',
    popular: false,
    features: [
      '30 credits per month',
      'Message any mentor',
      'Audio & video calls',
      'Priority support',
      'Community access',
    ],
    limitations: [],
    buttonText: 'Choose Basic',
    buttonVariant: 'secondary',
    badge: null,
    badgeColor: '',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'Most popular choice',
    price: 499,
    credits: 50,
    bonusCredits: 5,
    period: 'month',
    popular: true,
    features: [
      '50 credits per month',
      '5 bonus credits included',
      'Message any mentor',
      'Audio & video calls',
      'Live chat sessions',
      'Priority support',
      'Early access to features',
    ],
    limitations: [],
    buttonText: 'Choose Pro',
    buttonVariant: 'primary',
    badge: 'Most Popular',
    badgeColor: 'bg-primary',
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'For power users',
    price: 899,
    credits: 90,
    bonusCredits: 15,
    period: 'month',
    popular: false,
    features: [
      '90 credits per month',
      '15 bonus credits included',
      'Unlimited mentor messages',
      'Audio & video calls',
      'Live chat sessions',
      'Direct mentor booking',
      'Premium support',
      'Early access to features',
      'Monthly mentor highlights',
    ],
    limitations: [],
    buttonText: 'Choose Premium',
    buttonVariant: 'secondary',
    badge: 'Best Value',
    badgeColor: 'bg-warning',
  },
];

// Credit packages for one-time purchases
const CREDIT_PACKAGES = [
  {
    id: 'pack_small',
    name: 'Starter Pack',
    credits: 10,
    bonusCredits: 0,
    price: 99,
    originalPrice: 100,
    savings: 1,
    description: 'Perfect for trying out',
    popular: false,
    badge: null,
    badgeColor: '',
  },
  {
    id: 'pack_medium',
    name: 'Value Pack',
    credits: 25,
    bonusCredits: 3,
    price: 225,
    originalPrice: 250,
    savings: 25,
    description: 'Great for regular usage',
    popular: true,
    badge: 'Popular',
    badgeColor: 'bg-primary',
  },
  {
    id: 'pack_large',
    name: 'Power Pack',
    credits: 50,
    bonusCredits: 8,
    price: 425,
    originalPrice: 500,
    savings: 75,
    description: 'Maximum value',
    popular: false,
    badge: 'Best Deal',
    badgeColor: 'bg-success',
  },
  {
    id: 'pack_mega',
    name: 'Mega Pack',
    credits: 100,
    bonusCredits: 20,
    price: 800,
    originalPrice: 1000,
    savings: 200,
    description: 'Ultimate package',
    popular: false,
    badge: 'Max Savings',
    badgeColor: 'bg-warning',
  },
];

// FAQ data
const FAQ_DATA = [
  {
    question: 'How do credits work?',
    answer:
      'Credits are your universal currency on Pulse. Use them flexibly to interact with mentors through messages, calls, live sessions, and other premium features. Each mentor sets their own rates.',
  },
  {
    question: 'Do unused credits roll over?',
    answer:
      'Yes! Unused credits from your monthly subscription roll over to the next month. Credits from one-time packages never expire and can be used anytime.',
  },
  {
    question: 'Can I buy credit packages with an active subscription?',
    answer:
      'Absolutely! Credit packages are perfect for when you need extra credits beyond your monthly allocation. They work alongside any subscription plan.',
  },
  {
    question: 'What are bonus credits?',
    answer:
      'Bonus credits are extra credits you receive when purchasing higher-tier subscriptions or larger credit packages. They give you more value for your money.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes! You can change your plan at any time. For detailed information about billing cycles and plan changes, please check our Terms of Service.',
  },
  {
    question: 'What happens if I run out of credits?',
    answer:
      'You can purchase additional credit packs or upgrade to a higher plan. Your conversations and progress are never lost.',
  },
  {
    question: 'What is your refund policy?',
    answer:
      'We offer refunds according to our terms and conditions. For complete details about refunds, cancellations, and other policies, please visit our Terms of Service and Privacy Policy pages.',
  },
];

interface SubscriptionPlan {
  id: string;
  name: string;
  features: string[];
  limitations: string[];
  buttonText: string;
  buttonVariant: string;
  badge: string | null;
  badgeColor: string | null;
  credits: number;
  bonusCredits: number;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  price: number;
  originalPrice?: number;
  savings?: number;
  description: string;
  popular: boolean;
  badge: string | null;
  badgeColor: string | null;
}

const PricingPage = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'packages'>('subscriptions');

  // Format price in rupees
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Handle plan selection
  const handleSelectPlan = useCallback(
    async (plan: SubscriptionPlan) => {
      if (plan.id === 'free') {
        // Handle free signup
        toast.success("Welcome! You've received 4 free credits to get started!");
        router.push('/onboarding');
        return;
      }

      setIsLoading(true);
      setSelectedPlan(plan);

      try {
        // Simulate API call for subscription
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success(`Successfully subscribed to ${plan.name}!`);
        router.push('/dashboard');
      } catch {
        toast.error('Failed to process subscription. Please try again.');
      } finally {
        setIsLoading(false);
        setSelectedPlan(null);
      }
    },
    [router]
  );

  // Handle credit package purchase
  const handleBuyPackage = useCallback(async (package_: CreditPackage) => {
    setIsLoading(true);
    setSelectedPackage(package_);

    try {
      // Simulate API call for credit package purchase
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Successfully purchased ${package_.credits + package_.bonusCredits} credits!`);
      // Don't navigate away, just show success
    } catch {
      toast.error('Failed to purchase credits. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  }, []);

  // Handle FAQ toggle
  const handleFaqToggle = useCallback(
    (index: number) => {
      setExpandedFaq(expandedFaq === index ? null : index);
    },
    [expandedFaq]
  );

  if (isLoading && (selectedPlan || selectedPackage)) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-primary/20 border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
          <h3 className="text-text mb-2 text-lg font-semibold">
            {selectedPlan ? 'Processing Subscription' : 'Processing Purchase'}
          </h3>
          <p className="text-text-secondary text-sm">
            {selectedPlan
              ? `Setting up your ${selectedPlan.name}...`
              : `Purchasing ${selectedPackage?.credits} credits...`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl">
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
              <h1 className="text-text text-2xl font-bold">Choose Your Plan</h1>
              <p className="text-text-secondary text-sm">
                Start with 4 free credits, choose a subscription, or buy credit packages
              </p>
            </div>
          </div>

          {/* Credit explanation */}
          <div className="bg-surface border-border rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Wallet className="text-primary h-5 w-5" />
              <h3 className="text-text font-medium">How Credits Work</h3>
            </div>
            <p className="text-text-secondary text-sm">
              Credits are your universal currency on Pulse. Use them flexibly to interact with
              mentors and access premium features. Each mentor sets their own rates for different
              services.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-border-subtle border-b px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'subscriptions'
                  ? 'border-primary text-primary'
                  : 'text-text-secondary hover:text-text border-transparent'
              }`}
            >
              <Package className="mr-2 inline h-4 w-4" />
              Monthly Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'packages'
                  ? 'border-primary text-primary'
                  : 'text-text-secondary hover:text-text border-transparent'
              }`}
            >
              <Plus className="mr-2 inline h-4 w-4" />
              Credit Packages
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'subscriptions' ? (
            <>
              {/* Pricing Cards */}
              <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {PRICING_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className={`bg-surface border-border relative rounded-xl border p-6 transition-all hover:shadow-lg ${
                      tier.popular ? 'ring-primary scale-105 ring-2' : ''
                    }`}
                  >
                    {/* Badge */}
                    {tier.badge && (
                      <div
                        className={`${tier.badgeColor} absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium text-white`}
                      >
                        {tier.popular && <Star className="mr-1 inline h-3 w-3" />}
                        {tier.badge}
                      </div>
                    )}

                    {/* Plan name and description */}
                    <div className="mb-6 text-center">
                      <h3 className="text-text mb-2 text-xl font-bold">{tier.name}</h3>
                      <p className="text-text-secondary text-sm">{tier.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6 text-center">
                      {tier.price === 0 ? (
                        <div className="text-text text-3xl font-bold">Free</div>
                      ) : (
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-text text-3xl font-bold">
                            {formatPrice(tier.price)}
                          </span>
                          <span className="text-text-secondary text-sm">/{tier.period}</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-center gap-1">
                        <span className="text-primary text-lg font-semibold">
                          {tier.credits + tier.bonusCredits} credits
                        </span>
                        {tier.bonusCredits > 0 && (
                          <span className="text-success text-sm font-medium">
                            (+{tier.bonusCredits} bonus)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6 space-y-3">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span className="text-text-secondary text-sm">{feature}</span>
                        </div>
                      ))}

                      {tier.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <X className="text-text-muted mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span className="text-text-muted text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(tier)}
                      disabled={isLoading}
                      className={`w-full rounded-lg py-3 text-sm font-medium transition-colors ${
                        tier.buttonVariant === 'primary'
                          ? 'bg-primary hover:bg-primary/90 text-white'
                          : tier.id === 'free'
                            ? 'bg-success hover:bg-success/90 text-white'
                            : 'border-border bg-surface-elevated text-text hover:bg-surface border'
                      } disabled:opacity-50`}
                    >
                      {isLoading ? 'Processing...' : tier.buttonText}
                    </button>

                    {/* Free plan special note */}
                    {tier.id === 'free' && (
                      <div className="bg-success/10 text-success mt-3 rounded-lg p-2 text-center text-xs">
                        <Gift className="mr-1 inline h-3 w-3" />
                        No credit card required
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Credit Packages */}
              <div className="mb-8">
                <div className="mb-6 text-center">
                  <h2 className="text-text mb-2 text-2xl font-bold">Buy Additional Credits</h2>
                  <p className="text-text-secondary mx-auto max-w-2xl text-sm">
                    Need more credits? Purchase credit packages that work alongside your
                    subscription or as standalone purchases. Credits never expire and can be used
                    flexibly for any mentor interactions.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {CREDIT_PACKAGES.map((package_) => (
                    <div
                      key={package_.id}
                      className={`bg-surface border-border relative rounded-xl border p-6 transition-all hover:shadow-lg ${
                        package_.popular ? 'ring-primary scale-105 ring-2' : ''
                      }`}
                    >
                      {/* Badge */}
                      {package_.badge && (
                        <div
                          className={`${package_.badgeColor} absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium text-white`}
                        >
                          {package_.popular && <Star className="mr-1 inline h-3 w-3" />}
                          {package_.badge}
                        </div>
                      )}

                      {/* Package name and description */}
                      <div className="mb-6 text-center">
                        <h3 className="text-text mb-2 text-xl font-bold">{package_.name}</h3>
                        <p className="text-text-secondary text-sm">{package_.description}</p>
                      </div>

                      {/* Credits */}
                      <div className="mb-4 text-center">
                        <div className="text-primary text-3xl font-bold">
                          {package_.credits + package_.bonusCredits}
                        </div>
                        <div className="text-text-secondary text-sm">
                          credits
                          {package_.bonusCredits > 0 && (
                            <span className="text-success ml-1">
                              (+{package_.bonusCredits} bonus)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-6 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-text text-2xl font-bold">
                            {formatPrice(package_.price)}
                          </span>
                        </div>

                        {package_.savings && package_.savings > 0 && (
                          <div className="mt-1 flex items-center justify-center gap-2 text-sm">
                            <span className="text-text-muted line-through">
                              {formatPrice(package_.originalPrice!)}
                            </span>
                            <span className="text-success font-medium">
                              Save {formatPrice(package_.savings)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleBuyPackage(package_)}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 w-full rounded-lg py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Buy Credits'}
                      </button>

                      {/* Special note */}
                      <div className="bg-primary/10 text-primary mt-3 rounded-lg p-2 text-center text-xs">
                        <Zap className="mr-1 inline h-3 w-3" />
                        Credits never expire
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credit packages benefits */}
                <div className="bg-surface border-border mt-8 rounded-xl border p-6">
                  <h3 className="text-text mb-4 text-center text-xl font-bold">
                    Why Buy Credit Packages?
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="bg-success/10 text-success mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <Zap className="h-6 w-6" />
                      </div>
                      <h4 className="text-text mb-1 font-medium">Never Expire</h4>
                      <p className="text-text-secondary text-sm">
                        Use your credits anytime, no monthly limits or expiry dates
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-warning/10 text-warning mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <Gift className="h-6 w-6" />
                      </div>
                      <h4 className="text-text mb-1 font-medium">Bonus Credits</h4>
                      <p className="text-text-secondary text-sm">
                        Get extra bonus credits with larger packages for even more value
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h4 className="text-text mb-1 font-medium">Flexible Usage</h4>
                      <p className="text-text-secondary text-sm">
                        Spend credits however you want - messages, calls, or any mentor services
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Features comparison */}
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h3 className="text-text mb-4 text-center text-xl font-bold">All Plans Include</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="text-text mb-1 font-medium">Community Access</h4>
                <p className="text-text-secondary text-sm">
                  Join discussions and connect with like-minded people
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                  <Crown className="h-6 w-6" />
                </div>
                <h4 className="text-text mb-1 font-medium">Expert Mentors</h4>
                <p className="text-text-secondary text-sm">
                  Connect with verified industry professionals
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                  <Zap className="h-6 w-6" />
                </div>
                <h4 className="text-text mb-1 font-medium">Flexible Credits</h4>
                <p className="text-text-secondary text-sm">
                  Use credits however you want for any mentor interactions
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-surface border-border rounded-xl border p-6">
            <h3 className="text-text mb-6 text-center text-xl font-bold">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {FAQ_DATA.map((faq, index) => (
                <div key={index} className="border-border-subtle border-b pb-4 last:border-b-0">
                  <button
                    onClick={() => handleFaqToggle(index)}
                    className="text-text hover:text-primary flex w-full items-center justify-between text-left font-medium transition-colors"
                  >
                    {faq.question}
                    <div
                      className={`transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="text-text-secondary mt-2 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legal links */}
            <div className="border-border-subtle mt-6 border-t pt-4 text-center">
              <p className="text-text-secondary mb-2 text-sm">
                For detailed information about our policies:
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/terms')}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm transition-colors"
                >
                  Terms of Service
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  onClick={() => router.push('/privacy-policy')}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm transition-colors"
                >
                  Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="from-primary to-primary/80 mt-8 rounded-xl bg-gradient-to-r p-6 text-center text-white">
            <h3 className="mb-2 text-xl font-bold">Ready to Start Learning?</h3>
            <p className="mb-4 text-sm text-white/90">
              Join thousands of learners already growing their skills with expert mentors
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => handleSelectPlan(PRICING_TIERS[0])}
                className="text-primary rounded-lg bg-white px-6 py-3 font-medium transition-colors hover:bg-white/90"
              >
                Get Started for Free
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className="rounded-lg border border-white/30 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                Browse Credit Packages
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default PricingPage;
