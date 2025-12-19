
import { useBoolean } from "ahooks";
import { useEffect, useState } from "react";

interface Options {
  /**
   * @description 一个布尔值，指示应用程序希望接收尽可能精确的位置结果。如果为 true，且设备能够提供更高精度的位置，则会启用高精度模式；这可能导致响应时间变慢或功耗增加
   */
  enableHighAccuracy?: boolean;
  /**
   * @description 一个正的 long 值，表示设备允许获取位置的最长时间（以毫秒为单位）。默认值为 Infinity，意味着 getCurrentPosition() 会一直等待直到位置可用才返回
   */
  timeout?: number;
  /**
   * @description 个正的 long 值，表示可接受的缓存位置的最大存在时间（以毫秒为单位）。如果设置为 0，则设备不能使用缓存位置，必须尝试检索当前的真实位置
   */
  maximumAge?: number;
  /**
   * @description 错误回调
   */
  onError?: (error?: unknown) => void;
};

type SuccessFn = (position: GeolocationPosition) => void;

interface Geolocation {
  location: {
    lat: number;
    lng: number;
  };
  loading: boolean;
};

/**
 * @function useGeolocation
 * @description 设备的位置
 * @param successFn 
 * @param options 
 * @returns {Geolocation}
 */
export default function useGeolocation(
  successFn?: SuccessFn,
  options?: Options
): Geolocation {

  const {
    onError,
    maximumAge = 0,
    timeout = 5000,
    enableHighAccuracy = true
  } = options ?? {};

  const [location, setLocation] = useState(null);
  const [loading, { setFalse, setTrue }] = useBoolean(false);

  useEffect(() => {
    setTrue();
    if (!navigator.geolocation) {
      setFalse();
      return onError?.('当前设备不支持');
    };
    navigator?.geolocation?.
      getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        successFn?.(position);
        setFalse();
        setLocation({ lat, lng });
      }, (error) => {
        setFalse();
        onError?.(error);
      }, {
        maximumAge,
        timeout,
        enableHighAccuracy,
      });
  }, []);

  return {
    location,
    loading,
  }
}