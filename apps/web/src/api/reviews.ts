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
  GetReviews200Item,
  GetReviewsParams,
  PostReview201,
  PostReview404,
  PostReviewBody
} from './endpoints.schemas'
import { axiosInstance } from '../services/axios-instance';




/**
 * Create a review
 */
export const postReview = (
    postReviewBody: PostReviewBody,
 ) => {
      
      
      return axiosInstance<PostReview201>(
      {url: `/review`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: postReviewBody
    },
      );
    }
  


export const getPostReviewMutationOptions = <TError = PostReview404,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postReview>>, TError,{data: PostReviewBody}, TContext>, }
): UseMutationOptions<Awaited<ReturnType<typeof postReview>>, TError,{data: PostReviewBody}, TContext> => {
const {mutation: mutationOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof postReview>>, {data: PostReviewBody}> = (props) => {
          const {data} = props ?? {};

          return  postReview(data,)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type PostReviewMutationResult = NonNullable<Awaited<ReturnType<typeof postReview>>>
    export type PostReviewMutationBody = PostReviewBody
    export type PostReviewMutationError = PostReview404

    export const usePostReview = <TError = PostReview404,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof postReview>>, TError,{data: PostReviewBody}, TContext>, }
): UseMutationResult<
        Awaited<ReturnType<typeof postReview>>,
        TError,
        {data: PostReviewBody},
        TContext
      > => {

      const mutationOptions = getPostReviewMutationOptions(options);

      return useMutation(mutationOptions);
    }
    /**
 * Get reviews
 */
export const getReviews = (
    params: GetReviewsParams,
 signal?: AbortSignal
) => {
      
      
      return axiosInstance<GetReviews200Item[]>(
      {url: `/reviews`, method: 'GET',
        params, signal
    },
      );
    }
  

export const getGetReviewsQueryKey = (params: GetReviewsParams,) => {
    return [`/reviews`, ...(params ? [params]: [])] as const;
    }

    
export const getGetReviewsQueryOptions = <TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(params: GetReviewsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetReviewsQueryKey(params);

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getReviews>>> = ({ signal }) => getReviews(params, signal);

      

      

   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData> & { queryKey: QueryKey }
}

export type GetReviewsQueryResult = NonNullable<Awaited<ReturnType<typeof getReviews>>>
export type GetReviewsQueryError = unknown


export function useGetReviews<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getReviews>>,
          TError,
          TData
        > , 'initialData'
      >, }

  ):  DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetReviews<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getReviews>>,
          TError,
          TData
        > , 'initialData'
      >, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetReviews<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }

export function useGetReviews<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey } {

  const queryOptions = getGetReviewsQueryOptions(params,options)

  const query = useQuery(queryOptions) as  UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



export const getGetReviewsSuspenseQueryOptions = <TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(params: GetReviewsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }
) => {

const {query: queryOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetReviewsQueryKey(params);

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getReviews>>> = ({ signal }) => getReviews(params, signal);

      

      

   return  { queryKey, queryFn, ...queryOptions} as UseSuspenseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData> & { queryKey: QueryKey }
}

export type GetReviewsSuspenseQueryResult = NonNullable<Awaited<ReturnType<typeof getReviews>>>
export type GetReviewsSuspenseQueryError = unknown


export function useGetReviewsSuspense<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options: { query:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetReviewsSuspense<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useGetReviewsSuspense<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey }

export function useGetReviewsSuspense<TData = Awaited<ReturnType<typeof getReviews>>, TError = unknown>(
 params: GetReviewsParams, options?: { query?:Partial<UseSuspenseQueryOptions<Awaited<ReturnType<typeof getReviews>>, TError, TData>>, }

  ):  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey } {

  const queryOptions = getGetReviewsSuspenseQueryOptions(params,options)

  const query = useSuspenseQuery(queryOptions) as  UseSuspenseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



