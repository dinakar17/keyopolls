'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  MessageCircle,
  Phone,
  RefreshCw,
  Shield,
  Users,
  Video,
  XCircle,
} from 'lucide-react';

import BottomNavigation from '@/components/common/BottomNavigation';

const TermsOfServicePage = () => {
  const router = useRouter();

  const quickLinks = [
    { id: 'payments', title: 'Payments & Billing', icon: CreditCard },
    { id: 'refunds', title: 'Refunds & Cancellations', icon: RefreshCw },
    { id: 'mentor-services', title: 'Mentor Services', icon: Users },
    { id: 'user-conduct', title: 'User Conduct', icon: Shield },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-border-subtle border-b px-4 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-text-secondary hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-text text-2xl font-bold">Terms of Service</h1>
              <p className="text-text-secondary text-sm">Last updated: August 13, 2025</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="p-4">
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-text text-xl font-bold">Terms & Conditions</h2>
                <p className="text-text-secondary text-sm">
                  Please read these terms carefully before using our mentoring platform.
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
              <p className="text-text-secondary text-sm leading-relaxed">
                By accessing and using our mentoring platform, you accept and agree to be bound by
                the terms and provision of this agreement. These terms apply to all users of the
                platform, including mentees, mentors, and visitors.
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-lg font-bold">Quick Navigation</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {quickLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() =>
                      document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-text-secondary hover:text-text hover:bg-surface-elevated flex items-center gap-3 rounded-lg p-3 text-left transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{link.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Description */}
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Our Service</h2>
            <p className="text-text-secondary mb-4 text-sm leading-relaxed">
              Our platform connects mentees with verified industry professionals for one-on-one
              mentoring sessions. We facilitate communication through messages, audio calls, and
              video calls using a credit-based system.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-surface-elevated rounded-lg p-4">
                <MessageCircle className="text-primary mb-2 h-6 w-6" />
                <h3 className="text-text mb-1 font-medium">Messaging</h3>
                <p className="text-text-secondary text-xs">Direct messaging with mentors</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4">
                <Phone className="text-primary mb-2 h-6 w-6" />
                <h3 className="text-text mb-1 font-medium">Audio Calls</h3>
                <p className="text-text-secondary text-xs">High-quality voice consultations</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4">
                <Video className="text-primary mb-2 h-6 w-6" />
                <h3 className="text-text mb-1 font-medium">Video Calls</h3>
                <p className="text-text-secondary text-xs">Face-to-face mentoring sessions</p>
              </div>
            </div>
          </div>

          {/* Payments & Billing */}
          <div id="payments" className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 flex items-center gap-2 text-xl font-bold">
              <CreditCard className="h-6 w-6" />
              Payments & Billing
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-text mb-3 font-semibold">Credit System</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
                    <span className="text-text-secondary text-sm">
                      1 Credit = ₹10 (Indian Rupees)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
                    <span className="text-text-secondary text-sm">
                      Credits are used for all mentor interactions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
                    <span className="text-text-secondary text-sm">
                      Different services have different credit costs based on mentor rates
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Subscription Plans</h3>
                <div className="bg-surface-elevated space-y-3 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Basic Plan</span>
                    <span className="text-text font-medium">₹299/month - 30 credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Pro Plan</span>
                    <span className="text-text font-medium">
                      ₹499/month - 55 credits (+5 bonus)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Premium Plan</span>
                    <span className="text-text font-medium">
                      ₹899/month - 105 credits (+15 bonus)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Credit Packages</h3>
                <p className="text-text-secondary mb-3 text-sm">
                  One-time credit purchases that never expire and can be used alongside
                  subscriptions:
                </p>
                <div className="bg-surface-elevated space-y-3 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Starter Pack</span>
                    <span className="text-text font-medium">₹99 - 10 credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Value Pack</span>
                    <span className="text-text font-medium">₹225 - 25 credits (Save ₹25)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Power Pack</span>
                    <span className="text-text font-medium">₹425 - 50 credits (Save ₹75)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Mega Pack</span>
                    <span className="text-text font-medium">₹800 - 100 credits (Save ₹200)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Billing Terms</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Subscription plans are billed monthly in advance
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Credit packages are one-time purchases
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      All payments are processed securely through certified payment gateways
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Failed payments will result in service suspension until resolved
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Refunds & Cancellations */}
          <div id="refunds" className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 flex items-center gap-2 text-xl font-bold">
              <RefreshCw className="h-6 w-6" />
              Refunds & Cancellations
            </h2>

            <div className="space-y-6">
              <div className="bg-success/10 border-success/30 rounded-lg border p-4">
                <h3 className="text-success mb-2 flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4" />
                  7-Day Money-Back Guarantee
                </h3>
                <p className="text-text-secondary text-sm">
                  All paid subscriptions come with a 7-day money-back guarantee. Credits used during
                  this period will be deducted from any refund.
                </p>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Automatic Refund Scenarios</h3>
                <p className="text-text-secondary mb-3 text-sm">
                  You will automatically receive a full credit refund in the following situations:
                </p>
                <ul className="space-y-3">
                  <li className="bg-surface-elevated rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <span className="text-text text-sm font-medium">Unanswered Messages</span>
                        <p className="text-text-secondary mt-1 text-xs">
                          If a mentor doesn't respond to your message within 48 hours, you'll
                          receive a full credit refund
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-surface-elevated rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Phone className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <span className="text-text text-sm font-medium">Missed Audio Calls</span>
                        <p className="text-text-secondary mt-1 text-xs">
                          If a mentor doesn't join a scheduled audio call within 10 minutes of start
                          time
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-surface-elevated rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Video className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <span className="text-text text-sm font-medium">Missed Video Calls</span>
                        <p className="text-text-secondary mt-1 text-xs">
                          If a mentor doesn't join a scheduled video call within 10 minutes of start
                          time
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-surface-elevated rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <XCircle className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <span className="text-text text-sm font-medium">
                          Service Quality Issues
                        </span>
                        <p className="text-text-secondary mt-1 text-xs">
                          If a session is terminated due to technical issues or mentor
                          unavailability after starting
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="bg-surface-elevated rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <span className="text-text text-sm font-medium">Platform Downtime</span>
                        <p className="text-text-secondary mt-1 text-xs">
                          Credits used during scheduled maintenance or unexpected platform outages
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Subscription Cancellation</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Cancel anytime from your account settings
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Cancellation takes effect at the end of current billing cycle
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Unused credits from cancelled subscriptions remain available
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      No refund for partial month usage after 7-day guarantee period
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Refund Processing</h3>
                <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Clock className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Automatic refunds are processed within 24 hours
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Manual refund requests take 5-7 business days
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Refunds are credited back to original payment method
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mentor Services */}
          <div id="mentor-services" className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 flex items-center gap-2 text-xl font-bold">
              <Users className="h-6 w-6" />
              Mentor Services & Responsibilities
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-text mb-3 font-semibold">Service Standards</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Mentors must respond to messages within 48 hours
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Scheduled calls must be attended within 10 minutes of start time
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Mentors must provide professional, relevant advice
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      All interactions must maintain professional boundaries
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Credit Costs by Service</h3>
                <div className="bg-surface-elevated rounded-lg p-4">
                  <p className="text-text-secondary mb-3 text-sm">
                    Credit costs vary by mentor and service type. Typical ranges:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-text-secondary text-sm">Direct Message</span>
                      </div>
                      <span className="text-text font-medium">1-3 credits</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-text-secondary text-sm">Audio Call (per minute)</span>
                      </div>
                      <span className="text-text font-medium">0.5-1 credit</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span className="text-text-secondary text-sm">Video Call (per minute)</span>
                      </div>
                      <span className="text-text font-medium">0.7-1.5 credits</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Quality Assurance</h3>
                <div className="bg-warning/10 border-warning/30 rounded-lg border p-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Shield className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        All mentors undergo verification and background checks
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Regular quality reviews based on user feedback
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Mentors violating standards face suspension or removal
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* User Conduct */}
          <div id="user-conduct" className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 flex items-center gap-2 text-xl font-bold">
              <Shield className="h-6 w-6" />
              User Conduct & Guidelines
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-text mb-3 font-semibold">Acceptable Use</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Use the platform for legitimate mentoring and learning purposes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Maintain respectful communication with mentors
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Provide accurate information in your profile
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Respect intellectual property and confidentiality
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Prohibited Activities</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <XCircle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Harassment, abuse, or inappropriate behavior
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Sharing false or misleading information
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Attempting to bypass the credit system
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Using the platform for commercial solicitation
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-text-secondary text-sm">
                      Recording sessions without explicit consent
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-text mb-3 font-semibold">Account Suspension</h3>
                <div className="bg-error/10 border-error/30 rounded-lg border p-4">
                  <p className="text-text-secondary mb-3 text-sm">
                    Violation of these terms may result in:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Warning and temporary restrictions
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Temporary account suspension
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Permanent account termination
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="text-error mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">
                        Forfeiture of remaining credits (in severe cases)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Availability */}
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Platform Availability</h2>
            <div className="space-y-4">
              <div className="bg-surface-elevated rounded-lg p-4">
                <h3 className="text-text mb-2 font-semibold">Service Uptime</h3>
                <p className="text-text-secondary text-sm">
                  We strive to maintain 99.5% uptime but cannot guarantee uninterrupted service.
                  Scheduled maintenance will be announced 24 hours in advance.
                </p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4">
                <h3 className="text-text mb-2 font-semibold">Technical Support</h3>
                <p className="text-text-secondary text-sm">
                  Technical support is available 24/7 for platform issues. Response times vary based
                  on your subscription plan.
                </p>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-warning/10 border-warning/30 mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Limitation of Liability</h2>
            <div className="space-y-4">
              <p className="text-text-secondary text-sm leading-relaxed">
                Our platform facilitates connections between mentees and mentors but does not
                guarantee specific outcomes or results. We are not liable for the quality of advice
                provided by mentors or decisions made based on mentoring sessions.
              </p>
              <div className="bg-warning/20 rounded-lg p-3">
                <p className="text-text-secondary text-xs">
                  Our total liability for any claims arising from use of the platform is limited to
                  the amount you paid for services in the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Dispute Resolution</h2>
            <div className="space-y-4">
              <div className="bg-surface-elevated rounded-lg p-4">
                <h3 className="text-text mb-2 font-semibold">Resolution Process</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="bg-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs text-white">
                      1
                    </span>
                    <span className="text-text-secondary">
                      Contact our support team with your concern
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs text-white">
                      2
                    </span>
                    <span className="text-text-secondary">
                      We'll investigate and attempt resolution within 7 days
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs text-white">
                      3
                    </span>
                    <span className="text-text-secondary">
                      Unresolved disputes may be subject to arbitration
                    </span>
                  </li>
                </ol>
              </div>
              <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
                <p className="text-text-secondary text-xs">
                  These terms are governed by Indian law and disputes will be resolved in Pune,
                  Maharashtra courts.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Contact Us</h2>
            <p className="text-text-secondary mb-4 text-sm leading-relaxed">
              For questions about these terms or our services, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-medium">Email:</span>
                <span className="text-primary">support@mentorplatform.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-medium">Legal:</span>
                <span className="text-primary">legal@mentorplatform.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-medium">Address:</span>
                <span className="text-text-secondary">
                  123 Tech Park, Pune, Maharashtra 411001, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-medium">Support Hours:</span>
                <span className="text-text-secondary">
                  24/7 for technical issues, 9 AM - 9 PM for general support
                </span>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-primary/5 border-primary/20 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Terms Updates</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              We may update these Terms of Service from time to time. Significant changes will be
              communicated via email and platform notifications at least 30 days before taking
              effect. Continued use of the platform after changes constitutes acceptance of the new
              terms.
            </p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TermsOfServicePage;
