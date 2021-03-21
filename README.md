# flens
Futures + Lens

Combining the power of [Futures](https://github.com/fluture-js/Fluture) with [Ramda](https://ramdajs.com/) lens.


## examples
```javascript
const R = require('ramda');
const F = require('fluture');
const {flensProp} = require('flens');

const getFoo = R.view(flensProp('foo'));

F.fork(console.error)(console.log)(getFoo(F.resolve({foo:'bar'})))
```

```javascript
const R = require('ramda');
const F = require('fluture');
const sanctuary = require('sanctuary');
const { env: flutureEnv } = require('fluture-sanctuary-types');
const S = sanctuary.create({ checkTypes: true, env: sanctuary.env.concat(flutureEnv) })

const { flens } = require('flens');

const users = {
    jfoobar: {
        name: "John Foobar",
        friends: [
            { user_id: 'hbaz' },
            { user_id: 'lqux' }
        ]
    },
    hbaz: {
        name: "Harry Baz",
        friends: [
            { user_id: 'jfoobar' }
        ]
    },
    lqux: {
        name: "Lisa Qux",
        friends: [
            { user_id: 'jfoobar' }
        ]
    }
}


const userLookUp = flens(
    ({ user_id = false }) => (F.after(1000)(R.prop(user_id, users))),
    R.mergeRight
);

const friendsLookup = flens(
    ({ friends = [] }) => (R.traverse(S.of(F.Future), R.over(userLookUp, R.identity), friends)),
    R.assoc('friends')
);

const pipeline = R.compose(
    R.over(friendsLookup, R.identity),
    R.over(userLookUp, R.identity)
);

F.fork(console.error)(console.log)(pipeline({ user_id: 'jfoobar' }));
```
