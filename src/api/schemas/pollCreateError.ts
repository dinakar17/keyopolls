/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Keyo API
 * API for Keyo Polls app
 * OpenAPI spec version: 1.0.0
 */
import type { PollCreateErrorPollId } from './pollCreateErrorPollId';

/**
 * Schema for poll creation errors
 */
export interface PollCreateError {
  message: string;
  poll_id?: PollCreateErrorPollId;
}
