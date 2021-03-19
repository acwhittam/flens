const R = require('ramda');
const F = require('fluture');
const { wrap, flens } = require('..');
const test = require('tape');

const object = {
    prop: 'a',
    prop2: {
        prop3: "b"
    },
}
const single = wrap(R.lensProp('prop'));
const composed = R.compose(wrap(R.lensProp('prop2')), wrap(R.lensProp('prop3')));
const delayedLens = flens(({prop})=>F.after(1000)(prop), R.assoc('prop'));
test('R.view', function (t) {
    t.plan(4);

    F.fork(t.fail)((x) => {
        t.equals('a', x, "single lens view")
    })((R.view(single)(object)));

    F.fork(t.fail)((x) => {
        t.equals('a', x, "single lens view - delayed object")
    })((R.view(single)(F.after(1000)(object))));

    F.fork(t.fail)((x) => {
        t.equals('b', x, "composed lens view")
    })((R.view(composed)(object)));

    F.fork(t.fail)((x) => {
        t.equals('a', x, "delayed lens view")
    })((R.view(delayedLens)(object)));

    
    
});
test('R.set', function (t) {
    t.plan(3);

    F.fork(t.fail)((x) => {
        t.deepEqual({ prop: 'z', prop2: { prop3: "b" } }, x, "single lens set")
    })((R.set(single, 'z')(object)));

    F.fork(t.fail)((x) => {
        t.deepEqual({ prop: 'z', prop2: { prop3: "b" } }, x, "single lens set - delayed object")
    })((R.set(single, 'z')(F.after(1000)(object))));

    F.fork(t.fail)((x) => {
        t.deepEqual({ prop: 'a', prop2: { prop3: "c" } }, x, "composed lens set")
    })((R.set(composed, 'c')(object)));


});

test('R.over', function (t) {
    t.plan(4);

    F.fork(t.fail)((x) => {
        t.deepEqual({ prop: 'A', prop2: { prop3: "b" } }, x, "single lens over")
    })((R.over(single, R.map(R.toUpper))(object)));

    F.fork(t.fail)((x) => {
        t.deepEqual({ prop: 'A', prop2: { prop3: "b" } }, x, "single lens over - delayed object")
    })((R.over(single,  R.map(R.toUpper))(F.after(1000)(object))));

    F.fork(t.fail)((x) => {
        t.deepEqual({ prop: 'a', prop2: { prop3: "B" } }, x, "composed lens over")
    })((R.over(composed,  R.map(R.toUpper))(object)));
    F.fork(t.fail)((x) => {
        t.deepEqual({ prop: 'a', prop2: { prop3: "B" } }, x, "delayed over")
    })((R.over(composed,  R.chain((v)=>F.after(1000)(R.toUpper(v))))(object)));
});
