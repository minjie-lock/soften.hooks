import { useControllableValue, useGetState, useMemoizedFn } from "ahooks";
import { useCallback, useRef, useState } from "react";

type Options<S> = {
  value?: S;
  defaultValue?: S;
  onChange?: (value: S) => void;
}

type ReturnOptinos<S> = [
  S,
  (value: React.Dispatch<React.SetStateAction<S>> | S) => void,
  () => S | void,
]

/**
 * @function useGetControllableValue
 * @description 可获取最新值的 useGetControllableValue
 */
export default function useGetControllableValue<S>(
  optinos: Options<S>
): ReturnOptinos<S> {

  const latest = useRef(optinos?.value ?? optinos?.defaultValue);

  const [value, setValue] = useControllableValue(optinos);
  const set = (fn: React.Dispatch<React.SetStateAction<S>>) => {
    setValue((value) => {
      const state = typeof value === 'function' ? fn(value) : value;
      latest.current = state;
      return value;
    });
  }

  const get = useMemoizedFn(() => latest.current);


  return [value, set, get];
}