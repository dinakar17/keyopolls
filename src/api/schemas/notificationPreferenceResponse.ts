/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Keyo API
 * API for Keyo Polls app
 * OpenAPI spec version: 1.0.0
 */
import type { NotificationPreferenceResponseCustomThresholds } from './notificationPreferenceResponseCustomThresholds';

/**
 * Schema for notification preference response
 */
export interface NotificationPreferenceResponse {
  notification_type: string;
  in_app_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  is_enabled: boolean;
  custom_thresholds?: NotificationPreferenceResponseCustomThresholds;
  can_receive_push: boolean;
}
