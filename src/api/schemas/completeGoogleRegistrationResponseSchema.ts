/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Keyo API
 * API for Keyo Polls app
 * OpenAPI spec version: 1.0.0
 */
import type { ProfileDetailsSchema } from './profileDetailsSchema';

export interface CompleteGoogleRegistrationResponseSchema {
  success: boolean;
  token?: string;
  user?: ProfileDetailsSchema;
  error?: string;
}
