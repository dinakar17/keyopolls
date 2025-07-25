'use client';

import React from 'react';

import {
  Briefcase,
  Building,
  Clock,
  DollarSign,
  MapPin,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';

const JobsContent = () => {
  const mockJobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechFlow Inc.',
      location: 'Remote • US',
      salary: '$120k - $160k',
      type: 'Full-time',
      matchScore: 92,
      postedTime: '2h ago',
      skills: ['React', 'TypeScript', 'Node.js'],
      applicants: 23,
    },
    {
      id: 2,
      title: 'Frontend Engineer',
      company: 'StartupCo',
      location: 'San Francisco, CA',
      salary: '$100k - $140k',
      type: 'Full-time',
      matchScore: 78,
      postedTime: '5h ago',
      skills: ['Vue.js', 'JavaScript', 'CSS'],
      applicants: 45,
    },
    {
      id: 3,
      title: 'UI/UX Developer',
      company: 'Design Studio',
      location: 'New York, NY',
      salary: '$90k - $120k',
      type: 'Contract',
      matchScore: 65,
      postedTime: '1d ago',
      skills: ['React', 'Figma', 'CSS'],
      applicants: 12,
    },
    {
      id: 4,
      title: 'Full Stack Developer',
      company: 'GrowthTech',
      location: 'Remote • Global',
      salary: '$80k - $110k',
      type: 'Full-time',
      matchScore: 83,
      postedTime: '1d ago',
      skills: ['React', 'Python', 'AWS'],
      applicants: 67,
    },
    {
      id: 5,
      title: 'Lead Frontend Engineer',
      company: 'Enterprise Corp',
      location: 'Austin, TX',
      salary: '$140k - $180k',
      type: 'Full-time',
      matchScore: 89,
      postedTime: '2d ago',
      skills: ['React', 'TypeScript', 'Leadership'],
      applicants: 34,
    },
  ];

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-success bg-success/10 border-success/20';
    if (score >= 60) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-error bg-error/10 border-error/20';
  };

  const getMatchText = (score: number) => {
    if (score >= 80) return 'High Match';
    if (score >= 60) return 'Good Match';
    return 'Low Match';
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-primary mb-3">
            <Briefcase className="mx-auto h-8 w-8" />
          </div>
          <h1 className="text-text mb-2 text-2xl font-bold">Community-Tailored Jobs</h1>
          <p className="text-text-secondary text-sm">
            Revolutionary job board that eliminates ghosting and provides personalized opportunities
          </p>
        </div>

        {/* Preview Notice */}
        <div className="border-primary/20 bg-primary/10 border-l-primary mb-6 rounded-lg border border-l-4 p-4">
          <div className="flex items-center">
            <Zap className="text-primary mr-2 h-5 w-5" />
            <div>
              <p className="text-primary text-sm font-medium">Job Board Preview</p>
              <p className="text-text-secondary mt-1 text-xs">
                Experience the future of job hunting - tailored to Frontend Developers community
              </p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="mb-8 space-y-0">
          {mockJobs.map((job) => (
            <div
              key={job.id}
              className="border-border-subtle hover:bg-surface-elevated/30 cursor-pointer border-b py-4 transition-colors"
            >
              <div className="flex items-start justify-between">
                {/* Job Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    {/* Company Avatar */}
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="bg-primary/10 border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border">
                        <Building className="text-primary h-4 w-4" />
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-text truncate text-sm font-semibold">{job.title}</h3>
                          <p className="text-text-secondary text-sm">{job.company}</p>
                        </div>

                        {/* Match Score */}
                        <div
                          className={`ml-3 flex-shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${getMatchColor(job.matchScore)}`}
                        >
                          {job.matchScore}% {getMatchText(job.matchScore)}
                        </div>
                      </div>

                      {/* Job Meta */}
                      <div className="text-text-secondary mt-2 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{job.postedTime}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mt-2 flex items-center gap-1">
                        {job.skills.slice(0, 3).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-surface-elevated text-text-secondary rounded px-2 py-0.5 text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-text-muted text-xs">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Applicants */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-text-muted text-xs">{job.applicants} applicants</div>
                        <div className="text-primary text-xs font-medium">Apply now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Features */}
        <div className="mb-8 space-y-3">
          <h3 className="text-text flex items-center gap-2 font-semibold">
            <Star className="text-warning h-5 w-5" />
            Why This Works Better
          </h3>

          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-success/10 mt-0.5 rounded-lg p-2">
                <TrendingUp className="text-success h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-text mb-1 font-semibold">Honest Match Scores</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  See your real chances based on skills and experience. No false hope, just honest
                  assessments.
                </p>
              </div>
            </div>
          </div>

          <div className="border-border-subtle hover:bg-surface-elevated/30 border-b p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 mt-0.5 rounded-lg p-2">
                <Zap className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-text mb-1 font-semibold">Community-Specific</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Only see jobs relevant to Frontend Developers. No irrelevant spam or unrelated
                  positions.
                </p>
              </div>
            </div>
          </div>

          <div className="hover:bg-surface-elevated/30 p-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="bg-warning/10 mt-0.5 rounded-lg p-2">
                <Clock className="text-warning h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-text mb-1 font-semibold">No Ghosting Guarantee</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Every application gets a response within 4 weeks. Jobs auto-expire after 3 weeks
                  to stay fresh.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="border-border-subtle border-t p-6">
            <h3 className="text-text mb-2 text-lg font-semibold">
              Ready to Change Job Hunting Forever?
            </h3>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              Join the revolution against ghosting. Get honest feedback, real opportunities, and
              guaranteed responses.
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

export default JobsContent;
