/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Keyo API
 * API for Keyo Polls app
 * OpenAPI spec version: 1.0.0
 */
import type { CommunityCreateSchemaCategoryId } from './communityCreateSchemaCategoryId';
import type { CommunityCreateSchemaDescription } from './communityCreateSchemaDescription';

export interface CommunityCreateSchema {
  name: string;
  description?: CommunityCreateSchemaDescription;
  community_type?: string;
  category_id?: CommunityCreateSchemaCategoryId;
  tag_names?: string[];
}
