import { compose, chain, unless, map, isNil, lens, set, view, lensProp, lensPath, lensIndex } from 'ramda';
import { isFuture, resolve, reject, both } from 'fluture'


const toFuture = unless(isFuture, resolve);

const getter = (l) => (data) => (compose(
    chain((value) => isNil(value) ? reject(data) : resolve(value)),
    chain((value) => toFuture(value)),
    map(view(l)),
    toFuture
)(data))

const setter = (l) => (value, target) => (compose(
    chain(([v, t]) => toFuture(set(l, v, t))),
    both(toFuture(value))
)(toFuture(target)))


const wrap = (l) => lens(
    getter(l),
    setter(l)
);

const flens = compose(wrap, lens);

const flensProp = (prop) => wrap(lensProp(prop));
const flensPath = (path) => wrap(lensPath(path));
const flensIndex = (index) => wrap(lensIndex(index));

export { wrap, flens, flensProp, flensIndex, flensPath }

