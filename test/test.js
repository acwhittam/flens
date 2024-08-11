import * as R from 'ramda';
import * as F from 'fluture';
import { wrap, flens } from '../src/index.js';
import { describe } from 'riteway/esm/riteway.js';

const object = {
    prop: 'a',
    prop2: {
        prop3: "b"
    },
};
const single = wrap(R.lensProp('prop'));
const composed = R.compose(wrap(R.lensProp('prop2')), wrap(R.lensProp('prop3')));
const delayedLens = flens(({ prop }) => F.after(1000)(prop), R.assoc('prop'));
const delayedSetLens = flens(({ prop }) => F.after(1000)(prop), (value, obj) => F.after(1000)(R.assoc('prop', value, obj)));

describe('R.view', async assert => {
    const runTest = (description, lens, expected) => {
        return new Promise((resolve) => {
            F.fork(() => assert({
                given: description,
                should: 'fail',
                actual: 'error',
                expected: 'success'
            }))(x => {
                assert({
                    given: description,
                    should: 'return correct value',
                    actual: x,
                    expected
                });
                resolve();
            })(R.view(lens)(object));
        });
    };

    await runTest("single lens view", single, 'a');
    await runTest("single lens view - delayed object", single, 'a');
    await runTest("composed lens view", composed, 'b');
    await runTest("delayed lens view", delayedLens, 'a');
});

describe('R.set', async assert => {
    const runTest = (description, lens, value, expected) => {
        return new Promise((resolve) => {
            F.fork(() => assert({
                given: description,
                should: 'fail',
                actual: 'error',
                expected: 'success'
            }))(x => {
                assert({
                    given: description,
                    should: 'return correct object',
                    actual: x,
                    expected
                });
                resolve();
            })(R.set(lens, value)(object));
        });
    };

    await runTest("single lens set", single, 'z', { prop: 'z', prop2: { prop3: "b" } });
    await runTest("single lens set - delayed object", single, 'z', { prop: 'z', prop2: { prop3: "b" } });
    await runTest("composed lens set", composed, 'c', { prop: 'a', prop2: { prop3: "c" } });
    await runTest("single lens set -- delayed setter fn", delayedSetLens, 'c', { prop: 'c', prop2: { prop3: "b" } });
});

describe('R.over', async assert => {
    const runTest = (description, lens, fn, expected) => {
        return new Promise((resolve) => {
            F.fork(() => assert({
                given: description,
                should: 'fail',
                actual: 'error',
                expected: 'success'
            }))(x => {
                assert({
                    given: description,
                    should: 'return correct object',
                    actual: x,
                    expected
                });
                resolve();
            })(R.over(lens, fn)(object));
        });
    };

    await runTest("single lens over", single, R.map(R.toUpper), { prop: 'A', prop2: { prop3: "b" } });
    await runTest("single lens over - delayed object", single, R.map(R.toUpper), { prop: 'A', prop2: { prop3: "b" } });
    await runTest("composed lens over", composed, R.map(R.toUpper), { prop: 'a', prop2: { prop3: "B" } });
    await runTest("delayed over", composed, R.chain((v) => F.after(1000)(R.toUpper(v))), { prop: 'a', prop2: { prop3: "B" } });
});