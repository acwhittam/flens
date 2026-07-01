import { Lens } from 'ramda';
import { FutureInstance } from 'fluture';

/**
 * A Future-aware lens. When used with `R.view`, `R.set`, or `R.over`, the
 * input object may be a plain value or a Future resolving to one, and the
 * focused value is always wrapped in a Future.
 *
 * @template S - The type of the whole object the lens operates on
 * @template A - The type of the focused value
 * @template L - The rejection type of the Future (defaults to `unknown`)
 */
export type FLens<S, A, L = unknown> = Lens<FutureInstance<L, S> | S, FutureInstance<L, A>>;

/**
 * Wraps an existing Ramda lens so that it becomes Future-aware.
 * The getter resolves through Futures and rejects if the focused value is nil.
 * The setter waits for both the value and target Futures before setting.
 */
export declare function wrap<S, A, L = unknown>(lens: Lens<S, A>): FLens<S, A, L>;

/**
 * Creates a Future-aware lens from a getter and setter function.
 * Either or both functions may return a Future.
 *
 * Equivalent to `compose(wrap, R.lens)`.
 */
export declare function flens<S, A, L = unknown>(
    getter: (s: S) => FutureInstance<L, A> | A,
    setter: (a: A, s: S) => FutureInstance<L, S> | S
): FLens<S, A, L>;

/**
 * Creates a Future-aware lens focused on a property of an object.
 * Equivalent to `wrap(R.lensProp(prop))`.
 */
export declare function flensProp<S, K extends keyof S, L = unknown>(prop: K): FLens<S, S[K], L>;

/**
 * Creates a Future-aware lens focused on a nested path of an object.
 * Equivalent to `wrap(R.lensPath(path))`.
 */
export declare function flensPath<S, A, L = unknown>(path: ReadonlyArray<string | number>): FLens<S, A, L>;

/**
 * Creates a Future-aware lens focused on an index of an array.
 * Equivalent to `wrap(R.lensIndex(index))`.
 */
export declare function flensIndex<A, L = unknown>(index: number): FLens<A[], A, L>;
