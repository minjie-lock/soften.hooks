import { useRef, useEffect } from 'react';
enum Around {
  before,
  after,
}
/**
 * @function useFrequencyEffect
 * @description 数据变化频率，主要作用于数据改变后的操作可控制频率
 * @param effect 函数
 * @param frequency 频率次数
 * @param deps 依赖项
 */
export default function useFrequencyEffect(
  effect: React.EffectCallback,
  frequency = 1,
  deps?: React.DependencyList | undefined,
  around: keyof typeof Around = 'after',
) {
  const handleFrequency = useRef(0);
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      switch (around) {
        case 'after':
          if (handleFrequency?.current < frequency) {
            handleFrequency.current++;
            return effect();
          }
          break;
        case 'before':
          if (handleFrequency?.current < frequency) {
            handleFrequency.current++;
          }
          if (handleFrequency?.current === frequency) {
            return effect();
          }
      };
    } else {
      isMounted.current = true;
    }
  }, deps);
}
