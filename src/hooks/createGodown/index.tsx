import { useSyncExternalStore } from 'react';

type SetFn<S> = (state: S) => ({}) | S;

type GetFn<S> = () => S;

type OnSetFn<S> = <R extends SetFn<S>>(callback: R) => void;

type IdentifierFn<S> = (
  set: OnSetFn<S>,
  get: GetFn<S>
) => S;

type Listeners = (() => void)[];

type GetGodownFn<S, R> = (godown: S) => R;

type Fn<S, R, F = GetGodownFn<S, R>> = F extends GetGodownFn<S, R> ? ReturnType<F> : S;

type UserGodownFn<S> =
  <R, F extends GetGodownFn<S, R> = GetGodownFn<S, R>>(GodownFn?: F) => Fn<S, R, F>;


/**
 * @function createGodown 
 * @description 全局状态管理
 * @param identifier 
 * @returns {UserGodownFn<R>}
 */
export default function createGodown
  <V, S extends IdentifierFn<V> = IdentifierFn<V>>(identifier: S):
  UserGodownFn<ReturnType<S>> {

  const map = new Map();

  type R = ReturnType<S>;

  let listeners: Listeners = [];

  const set: OnSetFn<R> = (callback) => {
    const store = callback(map.get('godown'))
    map.set('godown', {
      ...(store ?? {}),
      ...map.get('godown')
    })
    for (const fn of listeners) {
      fn();
    }
  }

  const get: GetFn<R> = () => map.get('godown')

  if (!map.has('godown')) {
    map.set('godown', identifier(set, get));
  }
  const subscribe = (listener: { (): void; (): void; }) => {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }

  const useGodown = (GodownFn: GetGodownFn<R, V>) => {
    const godown = useSyncExternalStore<R>(subscribe, get);
    if (typeof GodownFn === 'function') {
      return GodownFn(godown);
    }
    return godown;
  }

  return useGodown as UserGodownFn<R>;
}