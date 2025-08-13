import { useState, useTransition } from 'react';

type TransitionFn<T> = (...args: never[]) => Promise<T>;

type UseTransitionState<T> = [
  T,
  (fn: TransitionFn<T>) => void,
  {
    pending: boolean;
  },
];

/**
 * @function useTransitionState
 * @description 高阶 useTransition
 * @param initialValue 初始值
 * @returns {UseTransitionState<T>}
 */
export default function useTransitionState<T>(initialValue?: T): UseTransitionState<T> {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();

  const onStart = (fn: TransitionFn<T>) => {
    startTransition(async () => {
      const result = await fn();
      startTransition(() => {
        setValue(result);
      })
    });
  }


  return [
    value,
    onStart,
    {
      pending,
    }
  ]
}
