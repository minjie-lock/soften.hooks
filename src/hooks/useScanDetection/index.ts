import { useEventListener, useMemoizedFn } from 'ahooks';
import { useRef } from 'react';

/** 
 * @description 扫码成功回调
*/
type ScanFn = (code: string) => void;

interface UseScanOptions {
  /** 
   * * @description 最小字符长度，低于此长度不视为条码 (默认为 3)
   */
  minLength?: number;
  /**
   * @description 字符输入间隔阈值(ms)，超过此时间视为人为输入 (默认为 50ms)
   * @note 扫码枪输入通常极快，字符间隔一般在 10-30ms 之间
   */
  timeThreshold?: number;
  /** * @description 是否阻止扫码结束时的 Enter 默认行为 (默认为 true)
   */
  preventDefault?: boolean;
  /** * @description 当焦点在输入框时是否停止监听 (默认为 true，防止干扰正常打字)
   */
  stopOnFocusedInput?: boolean;
  /**
   * @description 指定表单/默认全局
   */
  target?: HTMLElement,
}

/**
 * @function useScanDetection
 * @description 监听扫码枪输入
 */
export default function useScanDetection(
  fn: ScanFn,
  options: UseScanOptions = {}
) {

  const {
    minLength = 3,
    timeThreshold = 50,
    preventDefault = true,
    stopOnFocusedInput = true,
    target = window,
  } = options;

  const buffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);
  const onScanRef = useRef(fn);
  onScanRef.current = fn;

  const onKeyDown = useMemoizedFn((event: KeyboardEvent) => {
    // 1. 焦点检测：如果在输入框内，且配置为停止监听，则直接返回
    if (stopOnFocusedInput) {
      const target = event.target as HTMLElement;
      // 检查是否是输入框、文本域或富文本编辑区
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
    }

    const currTime = Date.now();
    const timeDiff = currTime - lastKeyTime.current;
    lastKeyTime.current = currTime;

    // 2. 处理结束符 (Enter)
    if (event.key === 'Enter') {
      // 如果缓冲区内容符合最小长度要求，触发回调
      if (buffer.current.length >= minLength) {
        onScanRef.current(buffer.current);

        if (preventDefault) {
          event.preventDefault();
        }
      }
      // 无论是否成功，Enter 之后都清空缓冲区
      buffer.current = '';
      return;
    }

    // 3. 时间阈值检测 (核心逻辑)
    // 如果字符间隔时间太长，视为“人为输入”或“新的扫码序列开始”，清空之前的脏数据
    if (timeDiff > timeThreshold) {
      buffer.current = '';
    }

    // 4. 收集字符
    // 排除 Shift, Control, Alt 等功能键，只收集长度为 1 的打印字符
    if (event.key.length === 1) {
      buffer.current += event.key;
    }
  })

  useEventListener('keydown', onKeyDown,
    {
      target,
    }
  );
}