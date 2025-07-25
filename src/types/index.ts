import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .regex(/^[0-9]{6}$/, 'OTP must be 6 digits')
    .min(6, 'OTP is required'),
});

export const registrationSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email_or_username: z
    .string()
    .min(1, 'Email or username is required')
    .max(150, 'Email or username is too long')
    .refine(
      (value) => {
        // If it contains @ symbol, validate as email
        if (value.includes('@')) {
          return z.string().email().safeParse(value).success;
        }
        // Otherwise validate as username (alphanumeric + underscore)
        return /^[a-zA-Z0-9_]+$/.test(value);
      },
      {
        message:
          'Please enter a valid email address or username (letters, numbers, and underscores only)',
      }
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const googleRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

// Poll related schemas
// Tag validation schema
const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag must be 50 characters or less')
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    'Tag can only contain letters, numbers, spaces, hyphens, and underscores'
  );

// Poll option schema
const pollOptionSchema = z.object({
  text: z.string().max(200, 'Option text too long'),
  order: z.number().min(0),
  is_correct: z.boolean(),
});

export const pollCreateSchema = z
  .object({
    title: z.string().min(20, 'Title must be at least 20 characters').max(200, 'Title too long'),
    description: z
      .string()
      .min(50, 'Description must be at least 50 characters')
      .max(1000, 'Description too long'),
    explanation: z.string().min(250, 'Explanation must be at least 250 characters'),
    poll_type: z.enum(['single', 'multiple', 'ranking', 'text_input'], {
      required_error: 'Poll type is required',
    }),
    community_id: z.number().min(1, 'Community selection is required'),
    allow_multiple_votes: z.boolean(),
    max_choices: z.number().min(1),
    requires_aura: z.number().min(0),
    has_correct_answer: z.boolean(),
    correct_text_answer: z.string().optional(),
    correct_ranking_order: z.array(z.number()).optional(),
    tags: z.array(tagSchema).max(5, 'Maximum 5 tags allowed'),
    todos: z.array(z.object({ text: z.string().max(280, 'Todo item too long') })).optional(),
    options: z
      .array(pollOptionSchema)
      .min(0, 'Invalid options')
      .max(10, 'Maximum 10 options allowed'),
  })
  .refine(
    (data) => {
      // Text input polls don't need options
      if (data.poll_type === 'text_input') {
        return true;
      }
      // Other poll types need at least 2 options
      return data.options.length >= 2;
    },
    {
      message: 'At least 2 options required for this poll type',
      path: ['options'],
    }
  )
  .refine(
    (data) => {
      // Validate max_choices for multiple choice polls
      if (data.poll_type === 'multiple' && data.max_choices) {
        return data.max_choices <= data.options.length;
      }
      return true;
    },
    {
      message: 'Max choices cannot exceed number of options',
      path: ['max_choices'],
    }
  )
  .refine(
    (data) => {
      // Validate correct text answer format
      if (data.has_correct_answer && data.poll_type === 'text_input' && data.correct_text_answer) {
        return !data.correct_text_answer.includes(' ');
      }
      return true;
    },
    {
      message: 'Correct text answer cannot contain spaces',
      path: ['correct_text_answer'],
    }
  )
  .refine(
    (data) => {
      // Validate unique tags
      if (data.tags && data.tags.length > 0) {
        const uniqueTags = new Set(data.tags.map((tag) => tag.toLowerCase().trim()));
        return uniqueTags.size === data.tags.length;
      }
      return true;
    },
    {
      message: 'Tags must be unique',
      path: ['tags'],
    }
  );

export type PollFormData = z.infer<typeof pollCreateSchema>;
