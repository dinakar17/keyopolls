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
  KeyopollsProfileApiGeneralEditProfileInfoBody,
  KeyopollsProfileApiGeneralGetUsersListParams,
  Message,
  ProfileDetailsSchema,
  UsersListResponseSchema,
} from '.././schemas';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Get the profile information of the authenticated user.
If no user is authenticated, returns an empty profile.
 * @summary Get Profile Info
 */
export const keyopollsProfileApiGeneralGetProfileInfo = (
  name: string,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  return customInstance<ProfileDetailsSchema>(
    { url: `/api/user/general/profile/$${name}`, method: 'GET', signal },
    options
  );
};

export const getKeyopollsProfileApiGeneralGetProfileInfoQueryKey = (name: string) => {
  return [`/api/user/general/profile/$${name}`] as const;
};

export const getKeyopollsProfileApiGeneralGetProfileInfoQueryOptions = <
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
  TError = ErrorType<Message>,
>(
  name: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getKeyopollsProfileApiGeneralGetProfileInfoQueryKey(name);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>
  > = ({ signal }) => keyopollsProfileApiGeneralGetProfileInfo(name, requestOptions, signal);

  return { queryKey, queryFn, enabled: !!name, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type KeyopollsProfileApiGeneralGetProfileInfoQueryResult = NonNullable<
  Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>
>;
export type KeyopollsProfileApiGeneralGetProfileInfoQueryError = ErrorType<Message>;

export function useKeyopollsProfileApiGeneralGetProfileInfo<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
  TError = ErrorType<Message>,
>(
  name: string,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
          TError,
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useKeyopollsProfileApiGeneralGetProfileInfo<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
  TError = ErrorType<Message>,
>(
  name: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
          TError,
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useKeyopollsProfileApiGeneralGetProfileInfo<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
  TError = ErrorType<Message>,
>(
  name: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
/**
 * @summary Get Profile Info
 */

export function useKeyopollsProfileApiGeneralGetProfileInfo<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
  TError = ErrorType<Message>,
>(
  name: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetProfileInfo>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getKeyopollsProfileApiGeneralGetProfileInfoQueryOptions(name, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

/**
 * Edit the profile information of the authenticated user.
 * @summary Edit Profile Info
 */
export const keyopollsProfileApiGeneralEditProfileInfo = (
  keyopollsProfileApiGeneralEditProfileInfoBody: BodyType<KeyopollsProfileApiGeneralEditProfileInfoBody>,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  const formData = new FormData();
  if (keyopollsProfileApiGeneralEditProfileInfoBody.avatar !== undefined) {
    formData.append(`avatar`, keyopollsProfileApiGeneralEditProfileInfoBody.avatar);
  }
  if (keyopollsProfileApiGeneralEditProfileInfoBody.banner !== undefined) {
    formData.append(`banner`, keyopollsProfileApiGeneralEditProfileInfoBody.banner);
  }
  formData.append(`data`, JSON.stringify(keyopollsProfileApiGeneralEditProfileInfoBody.data));

  return customInstance<ProfileDetailsSchema>(
    {
      url: `/api/user/general/profile`,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData,
      signal,
    },
    options
  );
};

export const getKeyopollsProfileApiGeneralEditProfileInfoMutationOptions = <
  TError = ErrorType<Message>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof keyopollsProfileApiGeneralEditProfileInfo>>,
    TError,
    { data: BodyType<KeyopollsProfileApiGeneralEditProfileInfoBody> },
    TContext
  >;
  request?: SecondParameter<typeof customInstance>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof keyopollsProfileApiGeneralEditProfileInfo>>,
  TError,
  { data: BodyType<KeyopollsProfileApiGeneralEditProfileInfoBody> },
  TContext
> => {
  const mutationKey = ['keyopollsProfileApiGeneralEditProfileInfo'];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof keyopollsProfileApiGeneralEditProfileInfo>>,
    { data: BodyType<KeyopollsProfileApiGeneralEditProfileInfoBody> }
  > = (props) => {
    const { data } = props ?? {};

    return keyopollsProfileApiGeneralEditProfileInfo(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type KeyopollsProfileApiGeneralEditProfileInfoMutationResult = NonNullable<
  Awaited<ReturnType<typeof keyopollsProfileApiGeneralEditProfileInfo>>
>;
export type KeyopollsProfileApiGeneralEditProfileInfoMutationBody =
  BodyType<KeyopollsProfileApiGeneralEditProfileInfoBody>;
export type KeyopollsProfileApiGeneralEditProfileInfoMutationError = ErrorType<Message>;

/**
 * @summary Edit Profile Info
 */
export const useKeyopollsProfileApiGeneralEditProfileInfo = <
  TError = ErrorType<Message>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof keyopollsProfileApiGeneralEditProfileInfo>>,
      TError,
      { data: BodyType<KeyopollsProfileApiGeneralEditProfileInfoBody> },
      TContext
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseMutationResult<
  Awaited<ReturnType<typeof keyopollsProfileApiGeneralEditProfileInfo>>,
  TError,
  { data: BodyType<KeyopollsProfileApiGeneralEditProfileInfoBody> },
  TContext
> => {
  const mutationOptions = getKeyopollsProfileApiGeneralEditProfileInfoMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};
/**
 * Get a paginated list of users with optional filtering and searching.

Features:
- Search by username, display_name, or email
- Filter by community membership and role
- Pagination with configurable page size
- Multiple sorting options
- Returns community-specific data when filtering by community

Query Parameters:
- search: Search term for username, display_name, or email
- community_id: Filter users by community membership
- role: Filter by role (only works with community_id)
- page: Page number (default: 1)
- per_page: Items per page (default: 20, max: 100)
- order_by: Sort field (created_at, username, total_aura with - for desc)
 * @summary Get Users List
 */
export const keyopollsProfileApiGeneralGetUsersList = (
  params?: KeyopollsProfileApiGeneralGetUsersListParams,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  return customInstance<UsersListResponseSchema>(
    { url: `/api/user/general/users`, method: 'GET', params, signal },
    options
  );
};

export const getKeyopollsProfileApiGeneralGetUsersListQueryKey = (
  params?: KeyopollsProfileApiGeneralGetUsersListParams
) => {
  return [`/api/user/general/users`, ...(params ? [params] : [])] as const;
};

export const getKeyopollsProfileApiGeneralGetUsersListQueryOptions = <
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
  TError = ErrorType<Message>,
>(
  params?: KeyopollsProfileApiGeneralGetUsersListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getKeyopollsProfileApiGeneralGetUsersListQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>
  > = ({ signal }) => keyopollsProfileApiGeneralGetUsersList(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type KeyopollsProfileApiGeneralGetUsersListQueryResult = NonNullable<
  Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>
>;
export type KeyopollsProfileApiGeneralGetUsersListQueryError = ErrorType<Message>;

export function useKeyopollsProfileApiGeneralGetUsersList<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
  TError = ErrorType<Message>,
>(
  params: undefined | KeyopollsProfileApiGeneralGetUsersListParams,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
          TError,
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useKeyopollsProfileApiGeneralGetUsersList<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
  TError = ErrorType<Message>,
>(
  params?: KeyopollsProfileApiGeneralGetUsersListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
          TError,
          Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useKeyopollsProfileApiGeneralGetUsersList<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
  TError = ErrorType<Message>,
>(
  params?: KeyopollsProfileApiGeneralGetUsersListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
/**
 * @summary Get Users List
 */

export function useKeyopollsProfileApiGeneralGetUsersList<
  TData = Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
  TError = ErrorType<Message>,
>(
  params?: KeyopollsProfileApiGeneralGetUsersListParams,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof keyopollsProfileApiGeneralGetUsersList>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getKeyopollsProfileApiGeneralGetUsersListQueryOptions(params, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
