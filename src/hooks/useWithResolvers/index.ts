import {useRef} from 'react';



const withResolvers = <S>() => {

  let resolve, reject;
  const promise = new Promise((...args) => {
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
