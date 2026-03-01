import Axios, { type AxiosRequestConfig } from 'axios'

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
})

let _authToken: string | null = null

export function setAuthToken(token: string | null) {
  _authToken = token
}

export function getAuthToken() {
  return _authToken
}

AXIOS_INSTANCE.interceptors.request.use(config => {
  if (_authToken) {
    config.headers.Authorization = `Bearer ${_authToken}`
  }
  config.headers['x-client'] = 'web'
  return config
})

export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data)

  // @ts-expect-error
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}
