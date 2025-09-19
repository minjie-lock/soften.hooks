import { useOptimistic, useState } from 'react';


type OptimisticFn<S, A> = (state: S, action: A) => S;

/**
 * @function useOptimisticState
 * @description 乐观更新状态
 * @param initialState 初始真实状态
 * @param fn 乐观更新逻辑
 * @returns
 */
export default function useOptimisticState<S, A>(
  initialState: S,
  fn: OptimisticFn<S, A>
): [
  optimisticValue: S,
  actions: {
    setOptimisticValue: (action: A) => void; // 触发乐观更新
    setRealValue: React.Dispatch<React.SetStateAction<S>>; // 设置真实状态
    realValue: S; // 当前真实状态
  }
] {
  const [value, setValue] = useState<S>(initialState);
  const [optimistic, setOptimistic] = useOptimistic<S, A>(value, fn);

  return [
    optimistic,
    {
      setOptimisticValue: setOptimistic,
      setRealValue: setValue,
      realValue: value,
    },
  ];
}
