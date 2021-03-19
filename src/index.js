import { compose, chain, unless, map, isNil, lens, set, view } from 'ramda';
import { isFuture, resolve, reject,both } from 'fluture'


const toFuture = unless(isFuture, resolve);

const getter = (l) => (data) => (compose(
    chain((value) => isNil(value) ? reject(data) : resolve(value)),
    chain((value) => toFuture(value)),
    map(view(l)),
    toFuture
)(data))

const setter = (l) => (value, target) => (compose(
    map(([v, t]) => set(l, v, t)),
    both(toFuture(value))
)(toFuture(target)))


const wrap = (l) => lens(
    getter(l),
    setter(l)
);

const flens = compose(wrap, lens);

export {wrap, flens}

