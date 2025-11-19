import {useRef} from 'react';

interface WithResolvers<T> {
  /**
   * @description 执行结果
   * @param reason 
   * @returns 
   */
  resolve: (reason?: T) => void;
  /**
   * @description 执行异常
   * @param reason 
   * @returns 
  */
  reject: (reason?: T) => void;
  /**
   * 
   */
  promise: Promise<T>;
}


const withResolvers = <S>(): WithResolvers<S> => {

  let resolve, reject;
  const promise = new Promise<S>((...args) => {
    [resolve, reject] = args;
  });

  return {
    promise,
    resolve,
    reject,
  };
};

/**
 * @function useWithResolvers
 * @description 等待成功异步
 */
export default function useWithResolvers<S>() {
  const promise = useRef(withResolvers<S>());
  return {
    promise: promise.current.promise,
    resolve: (value: S) => {
      promise.current?.resolve?.(value);
      promise.current = withResolvers<S>();
    },
    reject: promise?.current.reject,
  };
}
