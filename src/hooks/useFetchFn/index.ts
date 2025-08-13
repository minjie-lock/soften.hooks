
import { useRequest } from 'ahooks';
import { message as info } from 'antd';

type FetchReturn = ReturnType<typeof useRequest>;

const BASE_CODE = {
  SUCCESS: 200,
  ERROR: 400,
  UNAUTHORIZED: 401,
} as const;

type BaseCode = (typeof BASE_CODE)[keyof typeof BASE_CODE];

export type BaseResponseInfo<Data, CODE = BaseCode> = Promise<{
  code: CODE;
  data: Data;
  message: string;
}>;

export type Fn<S extends unknown, R> = (...args: S[]) => R;

type FetchOptions<CODE, DATA> = {

  /**
   * 代表请求成功的状态码
   * 默认 200
  */
  code?: CODE;

  message?: {
    /**
     * 成功提示语
     */
    success?: string;
    /**
     * 错误提示语
     */
    error?: string;
    /**
     * loading 等待提示语
     */
    loading?: string;
  } | string;

  /**
   * 自定义请求成功且状态码匹配执行
   * @param data 
   * @returns 
   */
  onSuccess?: (data: DATA) => void;
  /**
   * 自定义处理错误
   */
  onError?: (error: BaseError) => void;
};

/**
 * @description 返回值
*/
type R_N = BaseResponseInfo<unknown, BaseCode>;

/**
 * @description 成功码
 */
type C_S = typeof BASE_CODE['SUCCESS'];

/**
 * @function useFetch
 * @param fn 接口函数
 * @param options 消息配置项
 * @returns 
 */
export default function useFetchFn<S extends unknown = unknown,
  R extends R_N = R_N,
  F extends Fn<S, R> = Fn<S, R>,
  C extends C_S = C_S>(
    fn: F,
    options?: FetchOptions<
      C,
      Awaited<ReturnType<F>>['data']
    >,
  ): FetchReturn {

  if (typeof fn !== 'function') throw new Error('fn is not a function');

  const key = 'create' + Math.random();

  const {
    message,
    onSuccess: successFn,
    onError,
    code = 200,
  } = options ?? {};


  const {
    success = '请求成功',
    error = '请求失败',
    loading = '请求中'
  } = typeof message === 'string' ?
      {
        success: message + '成功',
        error: message + '失败',
        loading: message + '中',
      } :
      message ?? {};

  const run = useRequest(
    async (...args) => {
      info.open({
        key,
        content: loading,
        type: 'loading',
        duration: 0,
      });
      try {
        // ing.onChange(true);
        const take = await fn(...args);
        if (take.code == code) {
          successFn?.(take.data);
          await info.open({
            key,
            content: success,
            type: 'success',
          });
        } else {
          onError?.(take);
          await info.open({
            key,
            content: error,
            type: 'error',
          });
        }
        // info.destroy(key);
        // ing.onChange(false)
        return take
      } catch (err) {
        if (typeof onError === 'function') return onError(err as BaseError);
        // if (err instanceof AxiosError) {
        //   if (err?.code === 'ECONNABORTED') {
        //     await info.open({
        //       key,
        //       content: '请求超时',
        //       type: 'error',
        //     });
        //   }
        // } else {
        //   await info.open({
        //     key,
        //     content: error,
        //     type: 'error',
        //   });
        // }
        await info.open({
          key,
          content: error,
          type: 'error',
        });
        return err;
        // info.destroy(key);
        // ing.onChange(false)
      }
    },
    {
      manual: true,
    }
  )
  return run;
}