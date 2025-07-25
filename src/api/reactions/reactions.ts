/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Keyo API
 * API for Keyo Polls app
 * OpenAPI spec version: 1.0.0
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { customInstance } from '.././custom-instance';
import type { BodyType, ErrorType } from '.././custom-instance';
import type {
  KeyopollsCommonApiReactionGetReactions200,
  Message,
  ReactionRequest,
  ReactionResponse,
  ShareRequestSchema,
  ShareResponseSchema,
} from '.././schemas';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Toggle a reaction on any content type using pseudonymous profile.

All reactions are made using the authenticated user's pseudonymous profile.

Like and dislike reactions are mutually exclusive:
- If user likes content that they previously disliked, the dislike is removed
- If user dislikes content that they previously liked, the like is removed
- If user clicks the same reaction twice, it gets toggled (removed then added back)

content_type can be one of:
- polls
- comments

Parameters:
- content_type: The type of content to react to
- object_id: The ID of the content object
- data: ReactionRequest containing reaction_type ("like" or "dislike")
 * @summary Toggle Reaction
 */
export const keyopollsCommonApiReactionToggleReaction = (
  contentType: string,
  objectId: number,
  reactionRequest: BodyType<ReactionRequest>,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  return customInstance<ReactionResponse>(
    {
      url: `/api/common/reactions/${contentType}/${objectId}/react`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: reactionRequest,
      signal,
    },
    options
  );
};

export const getKeyopollsCommonApiReactionToggleReactionMutationOptions = <
  TError = ErrorType<Message>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof keyopollsCommonApiReactionToggleReaction>>,
    TError,
    { contentType: string; objectId: number; data: BodyType<ReactionRequest> },
    TContext
  >;
  request?: SecondParameter<typeof customInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof keyopollsCommonApiReactionToggleReaction>>,
  TError,
  { contentType: string; objectId: number; data: BodyType<ReactionRequest> },
  TContext
> => {
  const mutationKey = ['keyopollsCommonApiReactionToggleReaction'];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof keyopollsCommonApiReactionToggleReaction>>,
    { contentType: string; objectId: number; data: BodyType<ReactionRequest> }
  > = (props) => {
    const { contentType, objectId, data } = props ?? {};

    return keyopollsCommonApiReactionToggleReaction(contentType, objectId, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type KeyopollsCommonApiReactionToggleReactionMutationResult = NonNullable<
  Awaited<ReturnType<typeof keyopollsCommonApiReactionToggleReaction>>
>;
export type KeyopollsCommonApiReactionToggleReactionMutationBody = BodyType<ReactionRequest>;
export type KeyopollsCommonApiReactionToggleReactionMutationError = ErrorType<Message>;

/**
 * @summary Toggle Reaction
 */
export const useKeyopollsCommonApiReactionToggleReaction = <
  TError = ErrorType<Message>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof keyopollsCommonApiReactionToggleReaction>>,
      TError,
      { contentType: string; objectId: number; data: BodyType<ReactionRequest> },
      TContext
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseMutationResult<
  Awaited<ReturnType<typeof keyopollsCommonApiReactionToggleReaction>>,
  TError,
  { contentType: string; objectId: number; data: BodyType<ReactionRequest> },
  TContext
> => {
  const mutationOptions = getKeyopollsCommonApiReactionToggleReactionMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};
/**
 * Get reaction counts and user's reaction status for a content object.

Returns reaction counts for all users and the authenticated user's reaction status
(if authenticated with a pseudonymous profile).

Parameters:
- content_type: The type of content
- object_id: The ID of the content object
 * @summary Get Reactions
 */
export const keyopollsCommonApiReactionGetReactions = (
  contentType: string,
  objectId: number,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  return customInstance<KeyopollsCommonApiReactionGetReactions200>(
    { url: `/api/common/reactions/${contentType}/${objectId}/reactions`, method: 'GET', signal },
    options
  );
};

export const getKeyopollsCommonApiReactionGetReactionsQueryKey = (
  contentType: string,
  objectId: number
) => {
  return [`/api/common/reactions/${contentType}/${objectId}/reactions`] as const;
};

export const getKeyopollsCommonApiReactionGetReactionsQueryOptions = <
  TData = Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
  TError = ErrorType<Message>,
>(
  contentType: string,
  objectId: number,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ??
    getKeyopollsCommonApiReactionGetReactionsQueryKey(contentType, objectId);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>
  > = ({ signal }) =>
    keyopollsCommonApiReactionGetReactions(contentType, objectId, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!(contentType && objectId),
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type KeyopollsCommonApiReactionGetReactionsQueryResult = NonNullable<
  Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>
>;
export type KeyopollsCommonApiReactionGetReactionsQueryError = ErrorType<Message>;

export function useKeyopollsCommonApiReactionGetReactions<
  TData = Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
  TError = ErrorType<Message>,
>(
  contentType: string,
  objectId: number,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
          TError,
          Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useKeyopollsCommonApiReactionGetReactions<
  TData = Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
  TError = ErrorType<Message>,
>(
  contentType: string,
  objectId: number,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
          TError,
          Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useKeyopollsCommonApiReactionGetReactions<
  TData = Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
  TError = ErrorType<Message>,
>(
  contentType: string,
  objectId: number,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
/**
 * @summary Get Reactions
 */

export function useKeyopollsCommonApiReactionGetReactions<
  TData = Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
  TError = ErrorType<Message>,
>(
  contentType: string,
  objectId: number,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsCommonApiReactionGetReactions>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getKeyopollsCommonApiReactionGetReactionsQueryOptions(
    contentType,
    objectId,
    options
  );

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Record a share event for any content type using pseudonymous profile
 * @summary Share Content
 */
export const keyopollsCommonApiReactionShareContent = (
  contentType: 'Poll' | 'GenericComment',
  objectId: number,
  shareRequestSchema: BodyType<ShareRequestSchema>,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  return customInstance<ShareResponseSchema>(
    {
      url: `/api/common/reactions/share/${contentType}/${objectId}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: shareRequestSchema,
      signal,
    },
    options
  );
};

export const getKeyopollsCommonApiReactionShareContentMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof keyopollsCommonApiReactionShareContent>>,
    TError,
    {
      contentType: 'Poll' | 'GenericComment';
      objectId: number;
      data: BodyType<ShareRequestSchema>;
    },
    TContext
  >;
  request?: SecondParameter<typeof customInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof keyopollsCommonApiReactionShareContent>>,
  TError,
  { contentType: 'Poll' | 'GenericComment'; objectId: number; data: BodyType<ShareRequestSchema> },
  TContext
> => {
  const mutationKey = ['keyopollsCommonApiReactionShareContent'];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof keyopollsCommonApiReactionShareContent>>,
    { contentType: 'Poll' | 'GenericComment'; objectId: number; data: BodyType<ShareRequestSchema> }
  > = (props) => {
    const { contentType, objectId, data } = props ?? {};

    return keyopollsCommonApiReactionShareContent(contentType, objectId, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type KeyopollsCommonApiReactionShareContentMutationResult = NonNullable<
  Awaited<ReturnType<typeof keyopollsCommonApiReactionShareContent>>
>;
export type KeyopollsCommonApiReactionShareContentMutationBody = BodyType<ShareRequestSchema>;
export type KeyopollsCommonApiReactionShareContentMutationError = ErrorType<unknown>;

/**
 * @summary Share Content
 */
export const useKeyopollsCommonApiReactionShareContent = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof keyopollsCommonApiReactionShareContent>>,
      TError,
      {
        contentType: 'Poll' | 'GenericComment';
        objectId: number;
        data: BodyType<ShareRequestSchema>;
      },
      TContext
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseMutationResult<
  Awaited<ReturnType<typeof keyopollsCommonApiReactionShareContent>>,
  TError,
  { contentType: 'Poll' | 'GenericComment'; objectId: number; data: BodyType<ShareRequestSchema> },
  TContext
> => {
  const mutationOptions = getKeyopollsCommonApiReactionShareContentMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};
