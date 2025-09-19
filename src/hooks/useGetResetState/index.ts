import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';

import useFrequencyEffect from '../useFrequencyEffect';
type GetStateAction<S> = () => S;
type ResetStateAction = () => void;

type GetInitStateAction<S> = () => S;

type State<S> = [
  S,
  Dispatch<SetStateAction<S>>,
  GetStateAction<S>,
  ResetStateAction,
];
/**
 * @function useGetResetState
 * @description 一次满足 useGetState 和 useResetState
 * @param initialState 初始值
 * @returns {State}
 */
export default function useGetResetState<S>(initialState: S): State<S> {
  
  const [state, setState] = useState(initialState);
  const initial = useRef(initialState);
  const data = useRef<S>(initialState);

  const getState = () => data.current;

  const restState = useCallback(() => {
    setState(initialState);
  }, []);
  
  useFrequencyEffect(
    () => {
      data.current = state;
    },
    1,
    [state],
  );

  return [
    state,
    setState,
    getState,
    restState,
  ];
}
