/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Plotwist
 * OpenAPI spec version: 0.1.0
 */
import {
  useMutation,
  useQuery,
  useSuspenseQuery
} from '@tanstack/react-query'
import type {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult
} from '@tanstack/react-query'
import type {
  GetUserItems200Item,
  GetUserItemsParams,
  PostUserItem201,
  PostUserItemBody
} from './endpoints.schemas'
import { axiosInstance } from '../services/axios-instance';




/**
 * Create user item
 */
export const postUserItem = (
    postUserItemBody: PostUserItemBody,
 ) => {
      
      
      return axiosInstance<PostUserItem201>(
      {url: `/user/item`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: postUserItemBody
    },
      );
    }
  


export const getPostUserItemMutationOptions = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postUserItem>>, TError,{data: PostUserItemBody}, TContext>, }
): UseMutationOptions<Awaited<ReturnType<typeof postUserItem>>, TError,{data: PostUserItemBody}, TContext> => {
const {mutation: mutationOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof postUserItem>>, {data: PostUserItemBody}> = (props) => {
          const {data} = props ?? {};

          return  postUserItem(data,)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type PostUserItemMutationResult = NonNullable<Awaited<ReturnType<typeof postUserItem>>>
    export type PostUserItemMutationBody = PostUserItemBody
    export type PostUserItemMutationError = unknown

    export const usePostUserItem = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postUserItem>>, TError,{data: PostUserItemBody}, TContext>, }
): UseMutationResult<
        Awaited<ReturnType<typeof postUserItem>>,
        TError,
        {data: PostUserItemBody},
        TContext
      > => {

      const mutationOptions = getPostUserItemMutationOptions(options);

      return useMutation(mutationOptions);
    }
    /**
 * Get user items
 */
export const getUserItems = (
    params: GetUserItemsParams,
 signal?: AbortSignal
) => {
      
      
      return axiosInstance<GetUserItems200Item[]>(
      {url: `/user/items`, method: 'GET',
        params, signal
    },
      );
    }
  

export const getGetUserItemsQueryKey = (params: GetUserItemsParams,) => {
    return [`/user/items`, ...(params ? [params]: [])] as const;
    }

    
export const getGetUserItemsQueryOptions = <TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(params: GetUserItemsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetUserItemsQueryKey(params);

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getUserItems>>> = ({ signal }) => getUserItems(params, signal);

      

      

   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData> & { queryKey: QueryKey }
}

export type GetUserItemsQueryResult = NonNullable<Awaited<ReturnType<typeof getUserItems>>>
export type GetUserItemsQueryError = unknown


export function useGetUserItems<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getUserItems>>,
          TError,
          TData
        > , 'initialData'
      >, }

  ):  DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetUserItems<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getUserItems>>,
          TError,
          TData
        > , 'initialData'
      >, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetUserItems<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }

export function useGetUserItems<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey } {

  const queryOptions = getGetUserItemsQueryOptions(params,options)

  const query = useQuery(queryOptions) as  UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



export const getGetUserItemsSuspenseQueryOptions = <TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(params: GetUserItemsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetUserItemsQueryKey(params);

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getUserItems>>> = ({ signal }) => getUserItems(params, signal);

      

      

   return  { queryKey, queryFn, ...queryOptions} as UseSuspenseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData> & { queryKey: QueryKey }
}

export type GetUserItemsSuspenseQueryResult = NonNullable<Awaited<ReturnType<typeof getUserItems>>>
export type GetUserItemsSuspenseQueryError = unknown


export function useGetUserItemsSuspense<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options: { query:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetUserItemsSuspense<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetUserItemsSuspense<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey }

export function useGetUserItemsSuspense<TData = Awaited<ReturnType<typeof getUserItems>>, TError = unknown>(
 params: GetUserItemsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getUserItems>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey } {

  const queryOptions = getGetUserItemsSuspenseQueryOptions(params,options)

  const query = useSuspenseQuery(queryOptions) as  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



/**
 * Delete user item
 */
export const deleteUserItemId = (
    id: string,
 ) => {
      
      
      return axiosInstance<void>(
      {url: `/user/item/${id}`, method: 'DELETE'
    },
      );
    }
  


export const getDeleteUserItemIdMutationOptions = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteUserItemId>>, TError,{id: string}, TContext>, }
): UseMutationOptions<Awaited<ReturnType<typeof deleteUserItemId>>, TError,{id: string}, TContext> => {
const {mutation: mutationOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteUserItemId>>, {id: string}> = (props) => {
          const {id} = props ?? {};

          return  deleteUserItemId(id,)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type DeleteUserItemIdMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUserItemId>>>
    
    export type DeleteUserItemIdMutationError = unknown

    export const useDeleteUserItemId = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteUserItemId>>, TError,{id: string}, TContext>, }
): UseMutationResult<
        Awaited<ReturnType<typeof deleteUserItemId>>,
        TError,
        {id: string},
        TContext
      > => {

      const mutationOptions = getDeleteUserItemIdMutationOptions(options);

      return useMutation(mutationOptions);
    }
    