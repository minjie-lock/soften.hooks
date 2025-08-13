import { useDeferredValue, useState } from 'react';

type DeferredValue<T> = [
  /**
   * @property {T} value
   * @description 状态值
  */
  T,
  /**
   * @property {React.Dispatch<React.SetStateAction<T>>} setValue
   * @description 设置状态值
  */
  React.Dispatch<React.SetStateAction<T>>,
  {
    /**
     * @property {boolean} pending
     * @description 是否正在更新
    */
    pending: boolean;
    /**
     * @property {T} deferred
     * @description 延迟更新状态值
    */
    deferred: T;
  }
];

/**
 * @function useDeferredValueState
 * @description 延迟更新状态
 * @return {DeferredValue<T>}
 */
export default function useDeferredValueState<T>(initialState?: T): DeferredValue<T> {

  const [value, setValue] = useState(initialState);

  const deferred = useDeferredValue(value);

  const pending = value === deferred;

  return [value, setValue, { deferred, pending }];
}