'use client';

import React from 'react';

import Image from 'next/image';

import { Briefcase, Building, Clock, DollarSign, ExternalLink, MapPin } from 'lucide-react';

const JobsContent = () => {
  const mockJobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $160k',
      postedAt: '2 days ago',
      tags: ['React', 'TypeScript', 'Node.js'],
      logo: null,
      remote: true,
      featured: true,
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$100k - $130k',
      postedAt: '1 week ago',
      tags: ['Product Strategy', 'Analytics', 'Agile'],
      logo: null,
      remote: false,
      featured: false,
    },
    {
      id: 3,
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Remote',
      type: 'Contract',
      salary: '$80k - $100k',
      postedAt: '3 days ago',
      tags: ['Figma', 'User Research', 'Prototyping'],
      logo: null,
      remote: true,
      featured: false,
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'DataCorp',
      location: 'Boston, MA',
      type: 'Full-time',
      salary: '$110k - $140k',
      postedAt: '5 days ago',
      tags: ['Python', 'Machine Learning', 'SQL'],
      logo: null,
      remote: false,
      featured: true,
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$95k - $125k',
      postedAt: '1 week ago',
      tags: ['AWS', 'Docker', 'Kubernetes'],
      logo: null,
      remote: true,
      featured: false,
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-xl font-semibold">Community Jobs</h2>
          <p className="text-text-secondary mt-1 text-sm">
            {mockJobs.length} opportunities from community members
          </p>
        </div>
        <button className="bg-primary text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
          Post Job
        </button>
      </div>

      {/* Preview Notice */}
      <div className="rounded-r-lg border-l-4 border-purple-400 bg-purple-50 p-4">
        <div className="flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-purple-400" />
          <div>
            <p className="text-sm font-medium text-purple-800">Feature Preview</p>
            <p className="mt-1 text-xs text-purple-700">
              Job board is coming soon! This is a preview of what's to come.
            </p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {mockJobs.map((job) => (
          <div key={job.id} className="border-border-subtle border-b py-4 last:border-b-0">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {job.logo ? (
                  <Image
                    src={job.logo}
                    alt={job.company}
                    className="h-14 w-14 rounded-lg object-cover"
                    width={56}
                    height={56}
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
                    {job.company.charAt(0)}
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-text hover:text-primary cursor-pointer text-lg leading-tight font-semibold transition-colors">
                      {job.title}
                    </h3>
                    <div className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                      {job.featured && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">Featured</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="text-text-muted hover:text-primary ml-4 flex-shrink-0 transition-colors">
                    <ExternalLink className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-text-secondary mb-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                  {job.remote && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Remote
                    </span>
                  )}
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-surface-elevated text-text-secondary hover:bg-primary hover:text-background cursor-pointer rounded-full px-3 py-1 text-xs transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Posted {job.postedAt}</span>
                  <div className="flex items-center gap-3">
                    <button className="text-text-secondary hover:text-primary text-sm font-medium transition-colors">
                      Save Job
                    </button>
                    <button className="bg-primary text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <Briefcase className="text-text-muted mx-auto mb-3 h-8 w-8" />
        <p className="text-text-secondary text-sm">
          Full job board launching soon with application tracking and company profiles
        </p>
      </div>
    </div>
  );
};

export default JobsContent;
