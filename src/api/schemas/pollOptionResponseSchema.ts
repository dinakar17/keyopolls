/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Keyo API
 * API for Keyo Polls app
 * OpenAPI spec version: 1.0.0
 */
import type { PollOptionResponseSchemaImageUrl } from './pollOptionResponseSchemaImageUrl';

export interface PollOptionResponseSchema {
  id: number;
  text: string;
  image_url?: PollOptionResponseSchemaImageUrl;
  order: number;
  vote_count: number;
  vote_percentage: number;
}
