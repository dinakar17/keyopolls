'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { ArrowLeft, Database, Eye, Lock, MessageCircle, Shield, Users } from 'lucide-react';

import BottomNavigation from '@/components/common/BottomNavigation';

const PrivacyPolicyPage = () => {
  const router = useRouter();

  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: [
        {
          subtitle: 'Personal Information',
          items: [
            'Name, email address, and phone number when you create an account',
            'Profile information including bio, interests, and professional background',
            'Payment information (processed securely through our payment partners)',
            'Communication preferences and notification settings',
          ],
        },
        {
          subtitle: 'Usage Information',
          items: [
            'Messages, audio, and video call content between you and mentors',
            'Session recordings and transcripts (with explicit consent)',
            'Platform usage analytics and interaction patterns',
            'Device information and IP address for security purposes',
          ],
        },
        {
          subtitle: 'Automatically Collected Data',
          items: [
            'Log data including access times and pages visited',
            'Device and browser information',
            'Location data (with your permission)',
            'Cookies and similar tracking technologies',
          ],
        },
      ],
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: Users,
      content: [
        {
          subtitle: 'Service Provision',
          items: [
            'Facilitate connections between mentees and mentors',
            'Process payments and manage credit transactions',
            'Provide customer support and respond to inquiries',
            'Send service-related notifications and updates',
          ],
        },
        {
          subtitle: 'Platform Improvement',
          items: [
            'Analyze usage patterns to improve our services',
            'Develop new features and functionality',
            'Ensure platform security and prevent fraud',
            'Conduct research and analytics (anonymized data only)',
          ],
        },
        {
          subtitle: 'Communication',
          items: [
            'Send important account and service updates',
            'Notify you about mentor responses and session confirmations',
            'Share relevant educational content and platform news',
            'Marketing communications (with your consent)',
          ],
        },
      ],
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: MessageCircle,
      content: [
        {
          subtitle: 'With Mentors',
          items: [
            'Basic profile information when you connect with a mentor',
            'Messages and call content for the purpose of mentoring',
            'Session history and interaction records',
            'Feedback and ratings you provide',
          ],
        },
        {
          subtitle: 'With Service Providers',
          items: [
            'Payment processors for transaction handling',
            'Cloud storage providers for data hosting',
            'Analytics services for platform improvement',
            'Customer support tools for service delivery',
          ],
        },
        {
          subtitle: 'Legal Requirements',
          items: [
            'When required by law or legal process',
            'To protect our rights and property',
            'To ensure user safety and prevent fraud',
            'In case of business transfers or acquisitions',
          ],
        },
      ],
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Shield,
      content: [
        {
          subtitle: 'Security Measures',
          items: [
            'End-to-end encryption for messages and calls',
            'Secure data transmission using SSL/TLS protocols',
            'Regular security audits and vulnerability assessments',
            'Access controls and authentication mechanisms',
          ],
        },
        {
          subtitle: 'Data Storage',
          items: [
            'Data stored in secure, compliant cloud infrastructure',
            'Regular backups with encryption at rest',
            'Geographic data residency within India',
            'Retention policies based on legal requirements',
          ],
        },
        {
          subtitle: 'Incident Response',
          items: [
            'Immediate notification in case of data breaches',
            'Rapid response team for security incidents',
            'Regular updates on security improvements',
            'Transparent communication about security measures',
          ],
        },
      ],
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: Lock,
      content: [
        {
          subtitle: 'Data Access',
          items: [
            'Request a copy of your personal data',
            'View and download your message history',
            'Access your payment and transaction records',
            'Receive data in a portable format',
          ],
        },
        {
          subtitle: 'Data Control',
          items: [
            'Update or correct your personal information',
            'Delete your account and associated data',
            'Opt-out of marketing communications',
            'Control who can contact you on the platform',
          ],
        },
        {
          subtitle: 'Privacy Settings',
          items: [
            'Manage profile visibility settings',
            'Control notification preferences',
            'Set communication preferences with mentors',
            'Choose data sharing options',
          ],
        },
      ],
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies and Tracking',
      icon: Eye,
      content: [
        {
          subtitle: 'Essential Cookies',
          items: [
            'Required for platform functionality and security',
            'Session management and authentication',
            'Payment processing and transaction security',
            'Error tracking and performance monitoring',
          ],
        },
        {
          subtitle: 'Analytics Cookies',
          items: [
            'Usage analytics and performance metrics',
            'User behavior analysis for improvement',
            'A/B testing for feature optimization',
            'Crash reporting and bug tracking',
          ],
        },
        {
          subtitle: 'Cookie Management',
          items: [
            'Browser settings to control cookie preferences',
            'Opt-out options for non-essential cookies',
            'Regular review and update of cookie policies',
            'Clear information about cookie purposes',
          ],
        },
      ],
    },
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
              <h1 className="text-text text-2xl font-bold">Privacy Policy</h1>
              <p className="text-text-secondary text-sm">Last updated: August 13, 2025</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="p-4">
          <div className="bg-surface border-border mb-8 rounded-xl border p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-text text-xl font-bold">Your Privacy Matters</h2>
                <p className="text-text-secondary text-sm">
                  We're committed to protecting your personal information and being transparent
                  about our practices.
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
              <p className="text-text-secondary text-sm leading-relaxed">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our mentoring platform. By using our services, you agree to
                the collection and use of information in accordance with this policy. We will not
                use or share your information with anyone except as described in this Privacy
                Policy.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div key={section.id} className="bg-surface border-border rounded-xl border p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-full p-2">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h2 className="text-text text-xl font-bold">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((subsection, index) => (
                      <div key={index}>
                        <h3 className="text-text mb-3 font-semibold">{subsection.subtitle}</h3>
                        <ul className="space-y-2">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3">
                              <div className="bg-success/20 text-success mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"></div>
                              <span className="text-text-secondary text-sm leading-relaxed">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Retention */}
          <div className="bg-surface border-border mt-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Data Retention</h2>
            <div className="space-y-4">
              <div className="bg-surface-elevated rounded-lg p-4">
                <h3 className="text-text mb-2 font-semibold">Account Data</h3>
                <p className="text-text-secondary text-sm">
                  We retain your account information for as long as your account is active or as
                  needed to provide services. You can request account deletion at any time through
                  your account settings.
                </p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4">
                <h3 className="text-text mb-2 font-semibold">Communication Records</h3>
                <p className="text-text-secondary text-sm">
                  Messages and call records are retained for up to 3 years for quality assurance and
                  dispute resolution. You can delete individual conversations from your account.
                </p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-4">
                <h3 className="text-text mb-2 font-semibold">Payment Information</h3>
                <p className="text-text-secondary text-sm">
                  Payment records are retained for 7 years as required by financial regulations.
                  Sensitive payment details are never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="bg-warning/10 border-warning/30 mt-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Children's Privacy</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Our services are not intended for individuals under the age of 16. We do not knowingly
              collect personal information from children under 16. If you are a parent or guardian
              and you are aware that your child has provided us with personal information, please
              contact us immediately. If we become aware that we have collected personal information
              from children under 16 without verification of parental consent, we take steps to
              remove that information from our servers.
            </p>
          </div>

          {/* International Transfers */}
          <div className="bg-surface border-border mt-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">International Data Transfers</h2>
            <p className="text-text-secondary mb-4 text-sm leading-relaxed">
              Your information is primarily stored and processed in India. If we need to transfer
              your data internationally, we ensure appropriate safeguards are in place to protect
              your privacy rights and comply with applicable data protection laws.
            </p>
            <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
              <p className="text-text-secondary text-xs">
                We comply with data localization requirements and ensure that any international
                transfers meet the standards set by Indian data protection regulations.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-surface border-border mt-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Contact Us</h2>
            <p className="text-text-secondary mb-4 text-sm leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-medium">Email:</span>
                <span className="text-primary">privacy@mentorplatform.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-medium">Address:</span>
                <span className="text-text-secondary">
                  123 Tech Park, Pune, Maharashtra 411001, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-medium">Phone:</span>
                <span className="text-text-secondary">+91-XXXX-XXXX-XX</span>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-primary/5 border-primary/20 mt-8 rounded-xl border p-6">
            <h2 className="text-text mb-4 text-xl font-bold">Policy Updates</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
              You are advised to review this Privacy Policy periodically for any changes. Changes to
              this Privacy Policy are effective when they are posted on this page.
            </p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default PrivacyPolicyPage;
