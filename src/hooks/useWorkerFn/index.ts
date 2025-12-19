import { useMemoizedFn } from "ahooks";
import { useEffect, useRef } from 'react';

/**
 * @function useWorkerFn
 * @description 多线程
 */
export default function useWorkerFn<T, R = any>(scriptPath: URL | string) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // 1. 正确的初始化：在 useEffect 中创建 Worker
    const worker = new Worker(scriptPath, { 
      type: 'module' 
    });
    workerRef.current = worker;

    // 2. 清理函数：组件卸载时销毁 Worker
    return () => {
      worker.terminate();
      workerRef.current = null;
    };

  }, []);

  const workerFn = useMemoizedFn((data: T) => {
    return new Promise<R>((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker not initialized"));
        return;
      }
      const worker = workerRef.current;
      
      worker.onmessage = (e: MessageEvent) => {
        resolve(e.data); 
      };

      worker.onerror = (error) => {
        reject(error);
      };

      // 发送数据
      worker.postMessage({ data });
    });
  });

  return workerFn;
};