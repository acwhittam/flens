(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.flens = {}));
})(this, (function (exports) { 'use strict';

  function _isPlaceholder(a) {
    return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
  }

  /**
   * Optimized internal one-arity curry function.
   *
   * @private
   * @category Function
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curry1(fn) {
    return function f1(a) {
      if (arguments.length === 0 || _isPlaceholder(a)) {
        return f1;
      } else {
        return fn.apply(this, arguments);
      }
    };
  }

  /**
   * Optimized internal two-arity curry function.
   *
   * @private
   * @category Function
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curry2(fn) {
    return function f2(a, b) {
      switch (arguments.length) {
        case 0:
          return f2;

        case 1:
          return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
            return fn(a, _b);
          });

        default:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
            return fn(_a, b);
          }) : _isPlaceholder(b) ? _curry1(function (_b) {
            return fn(a, _b);
          }) : fn(a, b);
      }
    };
  }

  /**
   * Private `concat` function to merge two array-like objects.
   *
   * @private
   * @param {Array|Arguments} [set1=[]] An array-like object.
   * @param {Array|Arguments} [set2=[]] An array-like object.
   * @return {Array} A new, merged array.
   * @example
   *
   *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
   */
  function _concat(set1, set2) {
    set1 = set1 || [];
    set2 = set2 || [];
    var idx;
    var len1 = set1.length;
    var len2 = set2.length;
    var result = [];
    idx = 0;

    while (idx < len1) {
      result[result.length] = set1[idx];
      idx += 1;
    }

    idx = 0;

    while (idx < len2) {
      result[result.length] = set2[idx];
      idx += 1;
    }

    return result;
  }

  function _arity(n, fn) {
    /* eslint-disable no-unused-vars */
    switch (n) {
      case 0:
        return function () {
          return fn.apply(this, arguments);
        };

      case 1:
        return function (a0) {
          return fn.apply(this, arguments);
        };

      case 2:
        return function (a0, a1) {
          return fn.apply(this, arguments);
        };

      case 3:
        return function (a0, a1, a2) {
          return fn.apply(this, arguments);
        };

      case 4:
        return function (a0, a1, a2, a3) {
          return fn.apply(this, arguments);
        };

      case 5:
        return function (a0, a1, a2, a3, a4) {
          return fn.apply(this, arguments);
        };

      case 6:
        return function (a0, a1, a2, a3, a4, a5) {
          return fn.apply(this, arguments);
        };

      case 7:
        return function (a0, a1, a2, a3, a4, a5, a6) {
          return fn.apply(this, arguments);
        };

      case 8:
        return function (a0, a1, a2, a3, a4, a5, a6, a7) {
          return fn.apply(this, arguments);
        };

      case 9:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
          return fn.apply(this, arguments);
        };

      case 10:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return fn.apply(this, arguments);
        };

      default:
        throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
    }
  }

  /**
   * Internal curryN function.
   *
   * @private
   * @category Function
   * @param {Number} length The arity of the curried function.
   * @param {Array} received An array of arguments received thus far.
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curryN(length, received, fn) {
    return function () {
      var combined = [];
      var argsIdx = 0;
      var left = length;
      var combinedIdx = 0;

      while (combinedIdx < received.length || argsIdx < arguments.length) {
        var result;

        if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
          result = received[combinedIdx];
        } else {
          result = arguments[argsIdx];
          argsIdx += 1;
        }

        combined[combinedIdx] = result;

        if (!_isPlaceholder(result)) {
          left -= 1;
        }

        combinedIdx += 1;
      }

      return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
    };
  }

  /**
   * Returns a curried equivalent of the provided function, with the specified
   * arity. The curried function has two unusual capabilities. First, its
   * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
   * following are equivalent:
   *
   *   - `g(1)(2)(3)`
   *   - `g(1)(2, 3)`
   *   - `g(1, 2)(3)`
   *   - `g(1, 2, 3)`
   *
   * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
   * "gaps", allowing partial application of any combination of arguments,
   * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
   * the following are equivalent:
   *
   *   - `g(1, 2, 3)`
   *   - `g(_, 2, 3)(1)`
   *   - `g(_, _, 3)(1)(2)`
   *   - `g(_, _, 3)(1, 2)`
   *   - `g(_, 2)(1)(3)`
   *   - `g(_, 2)(1, 3)`
   *   - `g(_, 2)(_, 3)(1)`
   *
   * @func
   * @memberOf R
   * @since v0.5.0
   * @category Function
   * @sig Number -> (* -> a) -> (* -> a)
   * @param {Number} length The arity for the returned function.
   * @param {Function} fn The function to curry.
   * @return {Function} A new, curried function.
   * @see R.curry
   * @example
   *
   *      const sumArgs = (...args) => R.sum(args);
   *
   *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
   *      const f = curriedAddFourNumbers(1, 2);
   *      const g = f(3);
   *      g(4); //=> 10
   */

  var curryN =
  /*#__PURE__*/
  _curry2(function curryN(length, fn) {
    if (length === 1) {
      return _curry1(fn);
    }

    return _arity(length, _curryN(length, [], fn));
  });

  /**
   * Optimized internal three-arity curry function.
   *
   * @private
   * @category Function
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curry3(fn) {
    return function f3(a, b, c) {
      switch (arguments.length) {
        case 0:
          return f3;

        case 1:
          return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          });

        case 2:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          }) : _curry1(function (_c) {
            return fn(a, b, _c);
          });

        default:
          return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
            return fn(_a, _b, c);
          }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          }) : _isPlaceholder(a) ? _curry1(function (_a) {
            return fn(_a, b, c);
          }) : _isPlaceholder(b) ? _curry1(function (_b) {
            return fn(a, _b, c);
          }) : _isPlaceholder(c) ? _curry1(function (_c) {
            return fn(a, b, _c);
          }) : fn(a, b, c);
      }
    };
  }

  /**
   * Applies a function to the value at the given index of an array, returning a
   * new copy of the array with the element at the given index replaced with the
   * result of the function application.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category List
   * @sig Number -> (a -> a) -> [a] -> [a]
   * @param {Number} idx The index.
   * @param {Function} fn The function to apply.
   * @param {Array|Arguments} list An array-like object whose value
   *        at the supplied index will be replaced.
   * @return {Array} A copy of the supplied array-like object with
   *         the element at index `idx` replaced with the value
   *         returned by applying `fn` to the existing element.
   * @see R.update
   * @example
   *
   *      R.adjust(1, R.toUpper, ['a', 'b', 'c', 'd']);      //=> ['a', 'B', 'c', 'd']
   *      R.adjust(-1, R.toUpper, ['a', 'b', 'c', 'd']);     //=> ['a', 'b', 'c', 'D']
   * @symb R.adjust(-1, f, [a, b]) = [a, f(b)]
   * @symb R.adjust(0, f, [a, b]) = [f(a), b]
   */

  var adjust =
  /*#__PURE__*/
  _curry3(function adjust(idx, fn, list) {
    var len = list.length;

    if (idx >= len || idx < -len) {
      return list;
    }

    var _idx = (len + idx) % len;

    var _list = _concat(list);

    _list[_idx] = fn(list[_idx]);
    return _list;
  });

  /**
   * Tests whether or not an object is an array.
   *
   * @private
   * @param {*} val The object to test.
   * @return {Boolean} `true` if `val` is an array, `false` otherwise.
   * @example
   *
   *      _isArray([]); //=> true
   *      _isArray(null); //=> false
   *      _isArray({}); //=> false
   */
  var _isArray = Array.isArray || function _isArray(val) {
    return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
  };

  function _isTransformer(obj) {
    return obj != null && typeof obj['@@transducer/step'] === 'function';
  }

  /**
   * Returns a function that dispatches with different strategies based on the
   * object in list position (last argument). If it is an array, executes [fn].
   * Otherwise, if it has a function with one of the given method names, it will
   * execute that function (functor case). Otherwise, if it is a transformer,
   * uses transducer created by [transducerCreator] to return a new transformer
   * (transducer case).
   * Otherwise, it will default to executing [fn].
   *
   * @private
   * @param {Array} methodNames properties to check for a custom implementation
   * @param {Function} transducerCreator transducer factory if object is transformer
   * @param {Function} fn default ramda implementation
   * @return {Function} A function that dispatches on object in list position
   */

  function _dispatchable(methodNames, transducerCreator, fn) {
    return function () {
      if (arguments.length === 0) {
        return fn();
      }

      var obj = arguments[arguments.length - 1];

      if (!_isArray(obj)) {
        var idx = 0;

        while (idx < methodNames.length) {
          if (typeof obj[methodNames[idx]] === 'function') {
            return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
          }

          idx += 1;
        }

        if (_isTransformer(obj)) {
          var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
          return transducer(obj);
        }
      }

      return fn.apply(this, arguments);
    };
  }

  var _xfBase = {
    init: function () {
      return this.xf['@@transducer/init']();
    },
    result: function (result) {
      return this.xf['@@transducer/result'](result);
    }
  };

  function _map(fn, functor) {
    var idx = 0;
    var len = functor.length;
    var result = Array(len);

    while (idx < len) {
      result[idx] = fn(functor[idx]);
      idx += 1;
    }

    return result;
  }

  function _isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
  }

  /**
   * Tests whether or not an object is similar to an array.
   *
   * @private
   * @category Type
   * @category List
   * @sig * -> Boolean
   * @param {*} x The object to test.
   * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
   * @example
   *
   *      _isArrayLike([]); //=> true
   *      _isArrayLike(true); //=> false
   *      _isArrayLike({}); //=> false
   *      _isArrayLike({length: 10}); //=> false
   *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
   *      _isArrayLike({nodeType: 1, length: 1}) // => false
   */

  var _isArrayLike =
  /*#__PURE__*/
  _curry1(function isArrayLike(x) {
    if (_isArray(x)) {
      return true;
    }

    if (!x) {
      return false;
    }

    if (typeof x !== 'object') {
      return false;
    }

    if (_isString(x)) {
      return false;
    }

    if (x.length === 0) {
      return true;
    }

    if (x.length > 0) {
      return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
    }

    return false;
  });

  var XWrap =
  /*#__PURE__*/
  function () {
    function XWrap(fn) {
      this.f = fn;
    }

    XWrap.prototype['@@transducer/init'] = function () {
      throw new Error('init not implemented on XWrap');
    };

    XWrap.prototype['@@transducer/result'] = function (acc) {
      return acc;
    };

    XWrap.prototype['@@transducer/step'] = function (acc, x) {
      return this.f(acc, x);
    };

    return XWrap;
  }();

  function _xwrap(fn) {
    return new XWrap(fn);
  }

  /**
   * Creates a function that is bound to a context.
   * Note: `R.bind` does not provide the additional argument-binding capabilities of
   * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
   *
   * @func
   * @memberOf R
   * @since v0.6.0
   * @category Function
   * @category Object
   * @sig (* -> *) -> {*} -> (* -> *)
   * @param {Function} fn The function to bind to context
   * @param {Object} thisObj The context to bind `fn` to
   * @return {Function} A function that will execute in the context of `thisObj`.
   * @see R.partial
   * @example
   *
   *      const log = R.bind(console.log, console);
   *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
   *      // logs {a: 2}
   * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
   */

  var bind =
  /*#__PURE__*/
  _curry2(function bind(fn, thisObj) {
    return _arity(fn.length, function () {
      return fn.apply(thisObj, arguments);
    });
  });

  function _arrayReduce(xf, acc, list) {
    var idx = 0;
    var len = list.length;

    while (idx < len) {
      acc = xf['@@transducer/step'](acc, list[idx]);

      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }

      idx += 1;
    }

    return xf['@@transducer/result'](acc);
  }

  function _iterableReduce(xf, acc, iter) {
    var step = iter.next();

    while (!step.done) {
      acc = xf['@@transducer/step'](acc, step.value);

      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }

      step = iter.next();
    }

    return xf['@@transducer/result'](acc);
  }

  function _methodReduce(xf, acc, obj, methodName) {
    return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
  }

  var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
  function _reduce(fn, acc, list) {
    if (typeof fn === 'function') {
      fn = _xwrap(fn);
    }

    if (_isArrayLike(list)) {
      return _arrayReduce(fn, acc, list);
    }

    if (typeof list['fantasy-land/reduce'] === 'function') {
      return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
    }

    if (list[symIterator] != null) {
      return _iterableReduce(fn, acc, list[symIterator]());
    }

    if (typeof list.next === 'function') {
      return _iterableReduce(fn, acc, list);
    }

    if (typeof list.reduce === 'function') {
      return _methodReduce(fn, acc, list, 'reduce');
    }

    throw new TypeError('reduce: list must be array or iterable');
  }

  var XMap =
  /*#__PURE__*/
  function () {
    function XMap(f, xf) {
      this.xf = xf;
      this.f = f;
    }

    XMap.prototype['@@transducer/init'] = _xfBase.init;
    XMap.prototype['@@transducer/result'] = _xfBase.result;

    XMap.prototype['@@transducer/step'] = function (result, input) {
      return this.xf['@@transducer/step'](result, this.f(input));
    };

    return XMap;
  }();

  var _xmap =
  /*#__PURE__*/
  _curry2(function _xmap(f, xf) {
    return new XMap(f, xf);
  });

  function _has(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  var toString = Object.prototype.toString;

  var _isArguments =
  /*#__PURE__*/
  function () {
    return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
      return toString.call(x) === '[object Arguments]';
    } : function _isArguments(x) {
      return _has('callee', x);
    };
  }();

  var hasEnumBug = !
  /*#__PURE__*/
  {
    toString: null
  }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

  var hasArgsEnumBug =
  /*#__PURE__*/
  function () {

    return arguments.propertyIsEnumerable('length');
  }();

  var contains = function contains(list, item) {
    var idx = 0;

    while (idx < list.length) {
      if (list[idx] === item) {
        return true;
      }

      idx += 1;
    }

    return false;
  };
  /**
   * Returns a list containing the names of all the enumerable own properties of
   * the supplied object.
   * Note that the order of the output array is not guaranteed to be consistent
   * across different JS platforms.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig {k: v} -> [k]
   * @param {Object} obj The object to extract properties from
   * @return {Array} An array of the object's own properties.
   * @see R.keysIn, R.values, R.toPairs
   * @example
   *
   *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
   */


  var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
  /*#__PURE__*/
  _curry1(function keys(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  }) :
  /*#__PURE__*/
  _curry1(function keys(obj) {
    if (Object(obj) !== obj) {
      return [];
    }

    var prop, nIdx;
    var ks = [];

    var checkArgsLength = hasArgsEnumBug && _isArguments(obj);

    for (prop in obj) {
      if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
        ks[ks.length] = prop;
      }
    }

    if (hasEnumBug) {
      nIdx = nonEnumerableProps.length - 1;

      while (nIdx >= 0) {
        prop = nonEnumerableProps[nIdx];

        if (_has(prop, obj) && !contains(ks, prop)) {
          ks[ks.length] = prop;
        }

        nIdx -= 1;
      }
    }

    return ks;
  });

  /**
   * Takes a function and
   * a [functor](https://github.com/fantasyland/fantasy-land#functor),
   * applies the function to each of the functor's values, and returns
   * a functor of the same shape.
   *
   * Ramda provides suitable `map` implementations for `Array` and `Object`,
   * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
   *
   * Dispatches to the `map` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * Also treats functions as functors and will compose them together.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Functor f => (a -> b) -> f a -> f b
   * @param {Function} fn The function to be called on every element of the input `list`.
   * @param {Array} list The list to be iterated over.
   * @return {Array} The new list.
   * @see R.transduce, R.addIndex, R.pluck, R.project
   * @example
   *
   *      const double = x => x * 2;
   *
   *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
   *
   *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
   * @symb R.map(f, [a, b]) = [f(a), f(b)]
   * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
   * @symb R.map(f, functor_o) = functor_o.map(f)
   */

  var map =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['fantasy-land/map', 'map'], _xmap, function map(fn, functor) {
    switch (Object.prototype.toString.call(functor)) {
      case '[object Function]':
        return curryN(functor.length, function () {
          return fn.call(this, functor.apply(this, arguments));
        });

      case '[object Object]':
        return _reduce(function (acc, key) {
          acc[key] = fn(functor[key]);
          return acc;
        }, {}, keys(functor));

      default:
        return _map(fn, functor);
    }
  }));

  /**
   * Determine if the passed argument is an integer.
   *
   * @private
   * @param {*} n
   * @category Type
   * @return {Boolean}
   */
  var _isInteger = Number.isInteger || function _isInteger(n) {
    return n << 0 === n;
  };

  /**
   * Returns the nth element of the given list or string. If n is negative the
   * element at index length + n is returned.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Number -> [a] -> a | Undefined
   * @sig Number -> String -> String
   * @param {Number} offset
   * @param {*} list
   * @return {*}
   * @example
   *
   *      const list = ['foo', 'bar', 'baz', 'quux'];
   *      R.nth(1, list); //=> 'bar'
   *      R.nth(-1, list); //=> 'quux'
   *      R.nth(-99, list); //=> undefined
   *
   *      R.nth(2, 'abc'); //=> 'c'
   *      R.nth(3, 'abc'); //=> ''
   * @symb R.nth(-1, [a, b, c]) = c
   * @symb R.nth(0, [a, b, c]) = a
   * @symb R.nth(1, [a, b, c]) = b
   */

  var nth =
  /*#__PURE__*/
  _curry2(function nth(offset, list) {
    var idx = offset < 0 ? list.length + offset : offset;
    return _isString(list) ? list.charAt(idx) : list[idx];
  });

  /**
   * Returns a function that when supplied an object returns the indicated
   * property of that object, if it exists.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig Idx -> {s: a} -> a | Undefined
   * @param {String|Number} p The property name or array index
   * @param {Object} obj The object to query
   * @return {*} The value at `obj.p`.
   * @see R.path, R.props, R.pluck, R.project, R.nth
   * @example
   *
   *      R.prop('x', {x: 100}); //=> 100
   *      R.prop('x', {}); //=> undefined
   *      R.prop(0, [100]); //=> 100
   *      R.compose(R.inc, R.prop('x'))({ x: 3 }) //=> 4
   */

  var prop =
  /*#__PURE__*/
  _curry2(function prop(p, obj) {
    if (obj == null) {
      return;
    }

    return _isInteger(p) ? nth(p, obj) : obj[p];
  });

  /**
   * Returns a single item by iterating through the list, successively calling
   * the iterator function and passing it an accumulator value and the current
   * value from the array, and then passing the result to the next call.
   *
   * The iterator function receives two values: *(acc, value)*. It may use
   * [`R.reduced`](#reduced) to shortcut the iteration.
   *
   * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
   * is *(value, acc)*.
   *
   * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
   * arrays), unlike the native `Array.prototype.reduce` method. For more details
   * on this behavior, see:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
   *
   * Dispatches to the `reduce` method of the third argument, if present. When
   * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
   * shortcuting, as this is not implemented by `reduce`.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig ((a, b) -> a) -> a -> [b] -> a
   * @param {Function} fn The iterator function. Receives two values, the accumulator and the
   *        current element from the array.
   * @param {*} acc The accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.reduced, R.addIndex, R.reduceRight
   * @example
   *
   *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
   *      //          -               -10
   *      //         / \              / \
   *      //        -   4           -6   4
   *      //       / \              / \
   *      //      -   3   ==>     -3   3
   *      //     / \              / \
   *      //    -   2           -1   2
   *      //   / \              / \
   *      //  0   1            0   1
   *
   * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
   */

  var reduce =
  /*#__PURE__*/
  _curry3(_reduce);

  /**
   * Returns a function that always returns the given value. Note that for
   * non-primitives the value returned is a reference to the original value.
   *
   * This function is known as `const`, `constant`, or `K` (for K combinator) in
   * other languages and libraries.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig a -> (* -> a)
   * @param {*} val The value to wrap in a function
   * @return {Function} A Function :: * -> val.
   * @example
   *
   *      const t = R.always('Tee');
   *      t(); //=> 'Tee'
   */

  var always =
  /*#__PURE__*/
  _curry1(function always(val) {
    return function () {
      return val;
    };
  });

  /**
   * Makes a shallow clone of an object, setting or overriding the specified
   * property with the given value. Note that this copies and flattens prototype
   * properties onto the new object as well. All non-primitive properties are
   * copied by reference.
   *
   * @private
   * @param {String|Number} prop The property name to set
   * @param {*} val The new value
   * @param {Object|Array} obj The object to clone
   * @return {Object|Array} A new object equivalent to the original except for the changed property.
   */

  function _assoc(prop, val, obj) {
    if (_isInteger(prop) && _isArray(obj)) {
      var arr = [].concat(obj);
      arr[prop] = val;
      return arr;
    }

    var result = {};

    for (var p in obj) {
      result[p] = obj[p];
    }

    result[prop] = val;
    return result;
  }

  /**
   * Checks if the input value is `null` or `undefined`.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Type
   * @sig * -> Boolean
   * @param {*} x The value to test.
   * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
   * @example
   *
   *      R.isNil(null); //=> true
   *      R.isNil(undefined); //=> true
   *      R.isNil(0); //=> false
   *      R.isNil([]); //=> false
   */

  var isNil$1 =
  /*#__PURE__*/
  _curry1(function isNil(x) {
    return x == null;
  });

  /**
   * Makes a shallow clone of an object, setting or overriding the nodes required
   * to create the given path, and placing the specific value at the tail end of
   * that path. Note that this copies and flattens prototype properties onto the
   * new object as well. All non-primitive properties are copied by reference.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig [Idx] -> a -> {a} -> {a}
   * @param {Array} path the path to set
   * @param {*} val The new value
   * @param {Object} obj The object to clone
   * @return {Object} A new object equivalent to the original except along the specified path.
   * @see R.dissocPath
   * @example
   *
   *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
   *
   *      // Any missing or non-object keys in path will be overridden
   *      R.assocPath(['a', 'b', 'c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
   */

  var assocPath =
  /*#__PURE__*/
  _curry3(function assocPath(path, val, obj) {
    if (path.length === 0) {
      return val;
    }

    var idx = path[0];

    if (path.length > 1) {
      var nextObj = !isNil$1(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
      val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj);
    }

    return _assoc(idx, val, obj);
  });

  /**
   * Makes a shallow clone of an object, setting or overriding the specified
   * property with the given value. Note that this copies and flattens prototype
   * properties onto the new object as well. All non-primitive properties are
   * copied by reference.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Object
   * @typedefn Idx = String | Int
   * @sig Idx -> a -> {k: v} -> {k: v}
   * @param {String|Number} prop The property name to set
   * @param {*} val The new value
   * @param {Object} obj The object to clone
   * @return {Object} A new object equivalent to the original except for the changed property.
   * @see R.dissoc, R.pick
   * @example
   *
   *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
   */

  var assoc =
  /*#__PURE__*/
  _curry3(function assoc(prop, val, obj) {
    return assocPath([prop], val, obj);
  });

  /**
   * `_makeFlat` is a helper function that returns a one-level or fully recursive
   * function based on the flag passed in.
   *
   * @private
   */

  function _makeFlat(recursive) {
    return function flatt(list) {
      var value, jlen, j;
      var result = [];
      var idx = 0;
      var ilen = list.length;

      while (idx < ilen) {
        if (_isArrayLike(list[idx])) {
          value = recursive ? flatt(list[idx]) : list[idx];
          j = 0;
          jlen = value.length;

          while (j < jlen) {
            result[result.length] = value[j];
            j += 1;
          }
        } else {
          result[result.length] = list[idx];
        }

        idx += 1;
      }

      return result;
    };
  }

  function _forceReduced(x) {
    return {
      '@@transducer/value': x,
      '@@transducer/reduced': true
    };
  }

  var preservingReduced = function (xf) {
    return {
      '@@transducer/init': _xfBase.init,
      '@@transducer/result': function (result) {
        return xf['@@transducer/result'](result);
      },
      '@@transducer/step': function (result, input) {
        var ret = xf['@@transducer/step'](result, input);
        return ret['@@transducer/reduced'] ? _forceReduced(ret) : ret;
      }
    };
  };

  var _flatCat = function _xcat(xf) {
    var rxf = preservingReduced(xf);
    return {
      '@@transducer/init': _xfBase.init,
      '@@transducer/result': function (result) {
        return rxf['@@transducer/result'](result);
      },
      '@@transducer/step': function (result, input) {
        return !_isArrayLike(input) ? _reduce(rxf, result, [input]) : _reduce(rxf, result, input);
      }
    };
  };

  var _xchain =
  /*#__PURE__*/
  _curry2(function _xchain(f, xf) {
    return map(f, _flatCat(xf));
  });

  /**
   * `chain` maps a function over a list and concatenates the results. `chain`
   * is also known as `flatMap` in some libraries.
   *
   * Dispatches to the `chain` method of the second argument, if present,
   * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
   *
   * If second argument is a function, `chain(f, g)(x)` is equivalent to `f(g(x), x)`.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category List
   * @sig Chain m => (a -> m b) -> m a -> m b
   * @param {Function} fn The function to map with
   * @param {Array} list The list to map over
   * @return {Array} The result of flat-mapping `list` with `fn`
   * @example
   *
   *      const duplicate = n => [n, n];
   *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
   *
   *      R.chain(R.append, R.head)([1, 2, 3]); //=> [1, 2, 3, 1]
   */

  var chain =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['fantasy-land/chain', 'chain'], _xchain, function chain(fn, monad) {
    if (typeof monad === 'function') {
      return function (x) {
        return fn(monad(x))(x);
      };
    }

    return _makeFlat(false)(map(fn, monad));
  }));

  function _pipe(f, g) {
    return function () {
      return g.call(this, f.apply(this, arguments));
    };
  }

  /**
   * This checks whether a function has a [methodname] function. If it isn't an
   * array it will execute that function otherwise it will default to the ramda
   * implementation.
   *
   * @private
   * @param {Function} fn ramda implementation
   * @param {String} methodname property to check for a custom implementation
   * @return {Object} Whatever the return value of the method is.
   */

  function _checkForMethod(methodname, fn) {
    return function () {
      var length = arguments.length;

      if (length === 0) {
        return fn();
      }

      var obj = arguments[length - 1];
      return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
    };
  }

  /**
   * Returns the elements of the given list or string (or object with a `slice`
   * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
   *
   * Dispatches to the `slice` method of the third argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.1.4
   * @category List
   * @sig Number -> Number -> [a] -> [a]
   * @sig Number -> Number -> String -> String
   * @param {Number} fromIndex The start index (inclusive).
   * @param {Number} toIndex The end index (exclusive).
   * @param {*} list
   * @return {*}
   * @example
   *
   *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
   *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
   *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
   *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
   *      R.slice(0, 3, 'ramda');                     //=> 'ram'
   */

  var slice =
  /*#__PURE__*/
  _curry3(
  /*#__PURE__*/
  _checkForMethod('slice', function slice(fromIndex, toIndex, list) {
    return Array.prototype.slice.call(list, fromIndex, toIndex);
  }));

  /**
   * Returns all but the first element of the given list or string (or object
   * with a `tail` method).
   *
   * Dispatches to the `slice` method of the first argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [a]
   * @sig String -> String
   * @param {*} list
   * @return {*}
   * @see R.head, R.init, R.last
   * @example
   *
   *      R.tail([1, 2, 3]);  //=> [2, 3]
   *      R.tail([1, 2]);     //=> [2]
   *      R.tail([1]);        //=> []
   *      R.tail([]);         //=> []
   *
   *      R.tail('abc');  //=> 'bc'
   *      R.tail('ab');   //=> 'b'
   *      R.tail('a');    //=> ''
   *      R.tail('');     //=> ''
   */

  var tail =
  /*#__PURE__*/
  _curry1(
  /*#__PURE__*/
  _checkForMethod('tail',
  /*#__PURE__*/
  slice(1, Infinity)));

  /**
   * Performs left-to-right function composition. The first argument may have
   * any arity; the remaining arguments must be unary.
   *
   * In some libraries this function is named `sequence`.
   *
   * **Note:** The result of pipe is not automatically curried.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
   * @param {...Function} functions
   * @return {Function}
   * @see R.compose
   * @example
   *
   *      const f = R.pipe(Math.pow, R.negate, R.inc);
   *
   *      f(3, 4); // -(3^4) + 1
   * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
   * @symb R.pipe(f, g, h)(a)(b) = h(g(f(a)))(b)
   */

  function pipe() {
    if (arguments.length === 0) {
      throw new Error('pipe requires at least one argument');
    }

    return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
  }

  /**
   * Returns a new list or string with the elements or characters in reverse
   * order.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [a]
   * @sig String -> String
   * @param {Array|String} list
   * @return {Array|String}
   * @example
   *
   *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
   *      R.reverse([1, 2]);     //=> [2, 1]
   *      R.reverse([1]);        //=> [1]
   *      R.reverse([]);         //=> []
   *
   *      R.reverse('abc');      //=> 'cba'
   *      R.reverse('ab');       //=> 'ba'
   *      R.reverse('a');        //=> 'a'
   *      R.reverse('');         //=> ''
   */

  var reverse$1 =
  /*#__PURE__*/
  _curry1(function reverse(list) {
    return _isString(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();
  });

  /**
   * Performs right-to-left function composition. The last argument may have
   * any arity; the remaining arguments must be unary.
   *
   * **Note:** The result of compose is not automatically curried.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
   * @param {...Function} ...functions The functions to compose
   * @return {Function}
   * @see R.pipe
   * @example
   *
   *      const classyGreeting = (firstName, lastName) => "The name's " + lastName + ", " + firstName + " " + lastName
   *      const yellGreeting = R.compose(R.toUpper, classyGreeting);
   *      yellGreeting('James', 'Bond'); //=> "THE NAME'S BOND, JAMES BOND"
   *
   *      R.compose(Math.abs, R.add(1), R.multiply(2))(-4) //=> 7
   *
   * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))
   * @symb R.compose(f, g, h)(a)(b) = f(g(h(a)))(b)
   */

  function compose() {
    if (arguments.length === 0) {
      throw new Error('compose requires at least one argument');
    }

    return pipe.apply(this, reverse$1(arguments));
  }

  /**
   * Returns a lens for the given getter and setter functions. The getter "gets"
   * the value of the focus; the setter "sets" the value of the focus. The setter
   * should not mutate the data structure.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
   * @param {Function} getter
   * @param {Function} setter
   * @return {Lens}
   * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
   * @example
   *
   *      const xLens = R.lens(R.prop('x'), R.assoc('x'));
   *
   *      R.view(xLens, {x: 1, y: 2});            //=> 1
   *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
   *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
   */

  var lens =
  /*#__PURE__*/
  _curry2(function lens(getter, setter) {
    return function (toFunctorFn) {
      return function (target) {
        return map(function (focus) {
          return setter(focus, target);
        }, toFunctorFn(getter(target)));
      };
    };
  });

  /**
   * Returns a new copy of the array with the element at the provided index
   * replaced with the given value.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category List
   * @sig Number -> a -> [a] -> [a]
   * @param {Number} idx The index to update.
   * @param {*} x The value to exist at the given index of the returned array.
   * @param {Array|Arguments} list The source array-like object to be updated.
   * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.
   * @see R.adjust
   * @example
   *
   *      R.update(1, '_', ['a', 'b', 'c']);      //=> ['a', '_', 'c']
   *      R.update(-1, '_', ['a', 'b', 'c']);     //=> ['a', 'b', '_']
   * @symb R.update(-1, a, [b, c]) = [b, a]
   * @symb R.update(0, a, [b, c]) = [a, c]
   * @symb R.update(1, a, [b, c]) = [b, a]
   */

  var update =
  /*#__PURE__*/
  _curry3(function update(idx, x, list) {
    return adjust(idx, always(x), list);
  });

  /**
   * Returns a lens whose focus is the specified index.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Number -> Lens s a
   * @param {Number} n
   * @return {Lens}
   * @see R.view, R.set, R.over, R.nth
   * @example
   *
   *      const headLens = R.lensIndex(0);
   *
   *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'
   *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']
   *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']
   */

  var lensIndex =
  /*#__PURE__*/
  _curry1(function lensIndex(n) {
    return lens(nth(n), update(n));
  });

  /**
   * Retrieves the values at given paths of an object.
   *
   * @func
   * @memberOf R
   * @since v0.27.1
   * @category Object
   * @typedefn Idx = [String | Int | Symbol]
   * @sig [Idx] -> {a} -> [a | Undefined]
   * @param {Array} pathsArray The array of paths to be fetched.
   * @param {Object} obj The object to retrieve the nested properties from.
   * @return {Array} A list consisting of values at paths specified by "pathsArray".
   * @see R.path
   * @example
   *
   *      R.paths([['a', 'b'], ['p', 0, 'q']], {a: {b: 2}, p: [{q: 3}]}); //=> [2, 3]
   *      R.paths([['a', 'b'], ['p', 'r']], {a: {b: 2}, p: [{q: 3}]}); //=> [2, undefined]
   */

  var paths =
  /*#__PURE__*/
  _curry2(function paths(pathsArray, obj) {
    return pathsArray.map(function (paths) {
      var val = obj;
      var idx = 0;
      var p;

      while (idx < paths.length) {
        if (val == null) {
          return;
        }

        p = paths[idx];
        val = _isInteger(p) ? nth(p, val) : val[p];
        idx += 1;
      }

      return val;
    });
  });

  /**
   * Retrieve the value at a given path.
   *
   * @func
   * @memberOf R
   * @since v0.2.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig [Idx] -> {a} -> a | Undefined
   * @param {Array} path The path to use.
   * @param {Object} obj The object to retrieve the nested property from.
   * @return {*} The data at `path`.
   * @see R.prop, R.nth
   * @example
   *
   *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
   *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
   *      R.path(['a', 'b', 0], {a: {b: [1, 2, 3]}}); //=> 1
   *      R.path(['a', 'b', -2], {a: {b: [1, 2, 3]}}); //=> 2
   */

  var path =
  /*#__PURE__*/
  _curry2(function path(pathAr, obj) {
    return paths([pathAr], obj)[0];
  });

  /**
   * Returns a lens whose focus is the specified path.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig [Idx] -> Lens s a
   * @param {Array} path The path to use.
   * @return {Lens}
   * @see R.view, R.set, R.over
   * @example
   *
   *      const xHeadYLens = R.lensPath(['x', 0, 'y']);
   *
   *      R.view(xHeadYLens, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
   *      //=> 2
   *      R.set(xHeadYLens, 1, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
   *      //=> {x: [{y: 1, z: 3}, {y: 4, z: 5}]}
   *      R.over(xHeadYLens, R.negate, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
   *      //=> {x: [{y: -2, z: 3}, {y: 4, z: 5}]}
   */

  var lensPath =
  /*#__PURE__*/
  _curry1(function lensPath(p) {
    return lens(path(p), assocPath(p));
  });

  /**
   * Returns a lens whose focus is the specified property.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig String -> Lens s a
   * @param {String} k
   * @return {Lens}
   * @see R.view, R.set, R.over
   * @example
   *
   *      const xLens = R.lensProp('x');
   *
   *      R.view(xLens, {x: 1, y: 2});            //=> 1
   *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
   *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
   */

  var lensProp =
  /*#__PURE__*/
  _curry1(function lensProp(k) {
    return lens(prop(k), assoc(k));
  });

  // transforms the held value with the provided function.

  var Identity = function (x) {
    return {
      value: x,
      map: function (f) {
        return Identity(f(x));
      }
    };
  };
  /**
   * Returns the result of "setting" the portion of the given data structure
   * focused by the given lens to the result of applying the given function to
   * the focused value.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Lens s a -> (a -> a) -> s -> s
   * @param {Lens} lens
   * @param {*} v
   * @param {*} x
   * @return {*}
   * @see R.view, R.set, R.lens, R.lensIndex, R.lensProp, R.lensPath
   * @example
   *
   *      const headLens = R.lensIndex(0);
   *
   *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
   */


  var over =
  /*#__PURE__*/
  _curry3(function over(lens, f, x) {
    // The value returned by the getter function is first transformed with `f`,
    // then set as the value of an `Identity`. This is then mapped over with the
    // setter function of the lens.
    return lens(function (y) {
      return Identity(f(y));
    })(x).value;
  });

  /**
   * Returns the result of "setting" the portion of the given data structure
   * focused by the given lens to the given value.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Lens s a -> a -> s -> s
   * @param {Lens} lens
   * @param {*} v
   * @param {*} x
   * @return {*}
   * @see R.view, R.over, R.lens, R.lensIndex, R.lensProp, R.lensPath
   * @example
   *
   *      const xLens = R.lensProp('x');
   *
   *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
   *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
   */

  var set =
  /*#__PURE__*/
  _curry3(function set(lens, v, x) {
    return over(lens, always(v), x);
  });

  /**
   * Tests the final argument by passing it to the given predicate function. If
   * the predicate is not satisfied, the function will return the result of
   * calling the `whenFalseFn` function with the same argument. If the predicate
   * is satisfied, the argument is returned as is.
   *
   * @func
   * @memberOf R
   * @since v0.18.0
   * @category Logic
   * @sig (a -> Boolean) -> (a -> b) -> a -> a | b
   * @param {Function} pred        A predicate function
   * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
   *                               to a falsy value.
   * @param {*}        x           An object to test with the `pred` function and
   *                               pass to `whenFalseFn` if necessary.
   * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
   * @see R.ifElse, R.when, R.cond
   * @example
   *
   *      let safeInc = R.unless(R.isNil, R.inc);
   *      safeInc(null); //=> null
   *      safeInc(1); //=> 2
   */

  var unless =
  /*#__PURE__*/
  _curry3(function unless(pred, whenFalseFn, x) {
    return pred(x) ? x : whenFalseFn(x);
  });

  var Const = function (x) {
    return {
      value: x,
      'fantasy-land/map': function () {
        return this;
      }
    };
  };
  /**
   * Returns a "view" of the given data structure, determined by the given lens.
   * The lens's focus determines which portion of the data structure is visible.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Lens s a -> s -> a
   * @param {Lens} lens
   * @param {*} x
   * @return {*}
   * @see R.set, R.over, R.lens, R.lensIndex, R.lensProp, R.lensPath
   * @example
   *
   *      const xLens = R.lensProp('x');
   *
   *      R.view(xLens, {x: 1, y: 2});  //=> 1
   *      R.view(xLens, {x: 4, y: 2});  //=> 4
   */


  var view =
  /*#__PURE__*/
  _curry2(function view(lens, x) {
    // Using `Const` effectively ignores the setter function of the `lens`,
    // leaving the value returned by the getter function unmodified.
    return lens(Const)(x).value;
  });

  var sanctuaryTypeIdentifiersExports = {};
  var sanctuaryTypeIdentifiers = {
    get exports(){ return sanctuaryTypeIdentifiersExports; },
    set exports(v){ sanctuaryTypeIdentifiersExports = v; },
  };

  /*
          @@@@@@@            @@@@@@@         @@
        @@       @@        @@       @@      @@@
      @@   @@@ @@  @@    @@   @@@ @@  @@   @@@@@@ @@   @@@  @@ @@@      @@@@
     @@  @@   @@@   @@  @@  @@   @@@   @@   @@@   @@   @@@  @@@   @@  @@@   @@
     @@  @@   @@@   @@  @@  @@   @@@   @@   @@@   @@   @@@  @@@   @@  @@@@@@@@
     @@  @@   @@@  @@   @@  @@   @@@  @@    @@@   @@   @@@  @@@   @@  @@@
      @@   @@@ @@@@@     @@   @@@ @@@@@      @@@    @@@ @@  @@@@@@      @@@@@
        @@                 @@                           @@  @@
          @@@@@@@            @@@@@@@               @@@@@    @@
                                                            */

  (function (module) {
  	//. # sanctuary-type-identifiers
  	//.
  	//. A type is a set of values. Boolean, for example, is the type comprising
  	//. `true` and `false`. A value may be a member of multiple types (`42` is a
  	//. member of Number, PositiveNumber, Integer, and many other types).
  	//.
  	//. In certain situations it is useful to divide JavaScript values into
  	//. non-overlapping types. The language provides two constructs for this
  	//. purpose: the [`typeof`][1] operator and [`Object.prototype.toString`][2].
  	//. Each has pros and cons, but neither supports user-defined types.
  	//.
  	//. sanctuary-type-identifiers comprises:
  	//.
  	//.   - an npm and browser -compatible package for deriving the
  	//.     _type identifier_ of a JavaScript value; and
  	//.   - a specification which authors may follow to specify type
  	//.     identifiers for their types.
  	//.
  	//. ### Specification
  	//.
  	//. For a type to be compatible with the algorithm:
  	//.
  	//.   - every member of the type MUST have a `@@type` property
  	//.     (the _type identifier_); and
  	//.
  	//.   - the type identifier MUST be a string primitive and SHOULD have
  	//.     format `'<namespace>/<name>[@<version>]'`, where:
  	//.
  	//.       - `<namespace>` MUST consist of one or more characters, and
  	//.         SHOULD equal the name of the npm package which defines the
  	//.         type (including [scope][3] where appropriate);
  	//.
  	//.       - `<name>` MUST consist of one or more characters, and SHOULD
  	//.         be the unique name of the type; and
  	//.
  	//.       - `<version>` MUST consist of one or more digits, and SHOULD
  	//.         represent the version of the type.
  	//.
  	//. If the type identifier does not conform to the format specified above,
  	//. it is assumed that the entire string represents the _name_ of the type;
  	//. _namespace_ will be `null` and _version_ will be `0`.
  	//.
  	//. If the _version_ is not given, it is assumed to be `0`.

  	(function(f) {

  	  /* istanbul ignore else */
  	  {
  	    module.exports = f ();
  	  }

  	} (function() {

  	  //  $$type :: String
  	  var $$type = '@@type';

  	  //  pattern :: RegExp
  	  var pattern = new RegExp (
  	    '^'
  	  + '([\\s\\S]+)'   //  <namespace>
  	  + '/'             //  SOLIDUS (U+002F)
  	  + '([\\s\\S]+?)'  //  <name>
  	  + '(?:'           //  optional non-capturing group {
  	  +   '@'           //    COMMERCIAL AT (U+0040)
  	  +   '([0-9]+)'    //    <version>
  	  + ')?'            //  }
  	  + '$'
  	  );

  	  //. ### Usage
  	  //.
  	  //. ```javascript
  	  //. const type = require ('sanctuary-type-identifiers');
  	  //. ```
  	  //.
  	  //. ```javascript
  	  //. > const Identity$prototype = {
  	  //. .   '@@type': 'my-package/Identity@1',
  	  //. .   '@@show': function() {
  	  //. .     return 'Identity (' + show (this.value) + ')';
  	  //. .   }
  	  //. . }
  	  //.
  	  //. > const Identity = value =>
  	  //. .   Object.assign (Object.create (Identity$prototype), {value})
  	  //.
  	  //. > type (Identity (0))
  	  //. 'my-package/Identity@1'
  	  //.
  	  //. > type.parse (type (Identity (0)))
  	  //. {namespace: 'my-package', name: 'Identity', version: 1}
  	  //. ```
  	  //.
  	  //. ### API
  	  //.
  	  //# type :: Any -> String
  	  //.
  	  //. Takes any value and returns a string which identifies its type. If the
  	  //. value conforms to the [specification][4], the custom type identifier is
  	  //. returned.
  	  //.
  	  //. ```javascript
  	  //. > type (null)
  	  //. 'Null'
  	  //.
  	  //. > type (true)
  	  //. 'Boolean'
  	  //.
  	  //. > type (Identity (0))
  	  //. 'my-package/Identity@1'
  	  //. ```
  	  function type(x) {
  	    return x != null &&
  	           x.constructor != null &&
  	           x.constructor.prototype !== x &&
  	           typeof x[$$type] === 'string' ?
  	      x[$$type] :
  	      (Object.prototype.toString.call (x)).slice ('[object '.length,
  	                                                  -']'.length);
  	  }

  	  //# type.parse :: String -> { namespace :: Nullable String, name :: String, version :: Number }
  	  //.
  	  //. Takes any string and parses it according to the [specification][4],
  	  //. returning an object with `namespace`, `name`, and `version` fields.
  	  //.
  	  //. ```javascript
  	  //. > type.parse ('my-package/List@2')
  	  //. {namespace: 'my-package', name: 'List', version: 2}
  	  //.
  	  //. > type.parse ('nonsense!')
  	  //. {namespace: null, name: 'nonsense!', version: 0}
  	  //.
  	  //. > type.parse (type (Identity (0)))
  	  //. {namespace: 'my-package', name: 'Identity', version: 1}
  	  //. ```
  	  type.parse = function parse(s) {
  	    var namespace = null;
  	    var name = s;
  	    var version = 0;
  	    var groups = pattern.exec (s);
  	    if (groups != null) {
  	      namespace = groups[1];
  	      name = groups[2];
  	      if (groups[3] != null) version = Number (groups[3]);
  	    }
  	    return {namespace: namespace, name: name, version: version};
  	  };

  	  return type;

  	}));

  	//. [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
  	//. [2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
  	//. [3]: https://docs.npmjs.com/misc/scope
  	//. [4]: #specification
  } (sanctuaryTypeIdentifiers));

  var type = sanctuaryTypeIdentifiersExports;

  var FL = {
    alt: 'fantasy-land/alt',
    ap: 'fantasy-land/ap',
    bimap: 'fantasy-land/bimap',
    chain: 'fantasy-land/chain',
    chainRec: 'fantasy-land/chainRec',
    map: 'fantasy-land/map',
    of: 'fantasy-land/of',
    zero: 'fantasy-land/zero'
  };

  var ordinal = ['first', 'second', 'third', 'fourth', 'fifth'];

  var namespace = 'fluture';
  var name = 'Future';
  var version = 5;

  var $$type$1 = namespace + '/' + name + '@' + version;

  function List(head, tail){
    this.head = head;
    this.tail = tail;
  }

  List.prototype.toJSON = function(){
    return toArray(this);
  };

  var nil = new List(null, null);
  nil.tail = nil;

  function isNil(list){
    return list.tail === list;
  }

  // cons :: (a, List a) -> List a
  //      -- O(1) append operation
  function cons(head, tail){
    return new List(head, tail);
  }

  // reverse :: List a -> List a
  //         -- O(n) list reversal
  function reverse(xs){
    var ys = nil, tail = xs;
    while(!isNil(tail)){
      ys = cons(tail.head, ys);
      tail = tail.tail;
    }
    return ys;
  }

  // cat :: (List a, List a) -> List a
  //     -- O(n) list concatenation
  function cat(xs, ys){
    var zs = ys, tail = reverse(xs);
    while(!isNil(tail)){
      zs = cons(tail.head, zs);
      tail = tail.tail;
    }
    return zs;
  }

  // toArray :: List a -> Array a
  //         -- O(n) list to Array
  function toArray(xs){
    var tail = xs, arr = [];
    while(!isNil(tail)){
      arr.push(tail.head);
      tail = tail.tail;
    }
    return arr;
  }

  /* c8 ignore next */
  var captureStackTrace = Error.captureStackTrace || captureStackTraceFallback;
  var _debug = debugHandleNone;

  function debugHandleNone(x){
    return x;
  }

  function debug(x, fn, a, b, c){
    return _debug(x);
  }

  function captureContext(previous, tag, fn){
    return debug(previous);
  }

  function captureApplicationContext(context, n, f){
    return debug(context);
  }

  function captureStackTraceFallback(x){
    var e = new Error;
    if(typeof e.stack === 'string'){
      x.stack = x.name + '\n' + e.stack.split('\n').slice(1).join('\n');
    /* c8 ignore next 3 */
    }else {
      x.stack = x.name;
    }
  }

  var sanctuaryShowExports = {};
  var sanctuaryShow = {
    get exports(){ return sanctuaryShowExports; },
    set exports(v){ sanctuaryShowExports = v; },
  };

  (function (module) {
  	//. # sanctuary-show
  	//.
  	//. Haskell has a `show` function which can be applied to a compatible value to
  	//. produce a descriptive string representation of that value. The idea is that
  	//. the string representation should, if possible, be an expression which would
  	//. produce the original value if evaluated.
  	//.
  	//. This library provides a similar [`show`](#show) function.
  	//.
  	//. In general, this property should hold: `eval (show (x)) = x`. In some cases
  	//. parens are necessary to ensure correct interpretation (`{}`, for example,
  	//. is an empty block rather than an empty object in some contexts). Thus the
  	//. property is more accurately stated `eval ('(' + show (x) + ')') = x`.
  	//.
  	//. One can make values of a custom type compatible with [`show`](#show) by
  	//. defining a `@@show` method. For example:
  	//.
  	//. ```javascript
  	//. //# Maybe#@@show :: Maybe a ~> () -> String
  	//. //.
  	//. //. ```javascript
  	//. //. > show (Nothing)
  	//. //. 'Nothing'
  	//. //.
  	//. //. > show (Just (['foo', 'bar', 'baz']))
  	//. //. 'Just (["foo", "bar", "baz"])'
  	//. //. ```
  	//. Maybe.prototype['@@show'] = function() {
  	//.   return this.isNothing ? 'Nothing' : 'Just (' + show (this.value) + ')';
  	//. };
  	//. ```

  	(function(f) {

  	  /* istanbul ignore else */
  	  {
  	    module.exports = f ();
  	  }

  	} (function() {

  	  //  $$show :: String
  	  var $$show = '@@show';

  	  //  seen :: Array Any
  	  var seen = [];

  	  //  entry :: Object -> String -> String
  	  function entry(o) {
  	    return function(k) {
  	      return show (k) + ': ' + show (o[k]);
  	    };
  	  }

  	  //  sortedKeys :: Object -> Array String
  	  function sortedKeys(o) {
  	    return (Object.keys (o)).sort ();
  	  }

  	  //# show :: Showable a => a -> String
  	  //.
  	  //. Returns a useful string representation of the given value.
  	  //.
  	  //. Dispatches to the value's `@@show` method if present.
  	  //.
  	  //. Where practical, `show (eval ('(' + show (x) + ')')) = show (x)`.
  	  //.
  	  //. ```javascript
  	  //. > show (null)
  	  //. 'null'
  	  //.
  	  //. > show (undefined)
  	  //. 'undefined'
  	  //.
  	  //. > show (true)
  	  //. 'true'
  	  //.
  	  //. > show (new Boolean (false))
  	  //. 'new Boolean (false)'
  	  //.
  	  //. > show (-0)
  	  //. '-0'
  	  //.
  	  //. > show (NaN)
  	  //. 'NaN'
  	  //.
  	  //. > show (new Number (Infinity))
  	  //. 'new Number (Infinity)'
  	  //.
  	  //. > show ('foo\n"bar"\nbaz\n')
  	  //. '"foo\\n\\"bar\\"\\nbaz\\n"'
  	  //.
  	  //. > show (new String (''))
  	  //. 'new String ("")'
  	  //.
  	  //. > show (['foo', 'bar', 'baz'])
  	  //. '["foo", "bar", "baz"]'
  	  //.
  	  //. > show ([[[[[0]]]]])
  	  //. '[[[[[0]]]]]'
  	  //.
  	  //. > show ({x: [1, 2], y: [3, 4], z: [5, 6]})
  	  //. '{"x": [1, 2], "y": [3, 4], "z": [5, 6]}'
  	  //. ```
  	  function show(x) {
  	    if (seen.indexOf (x) >= 0) return '<Circular>';

  	    switch (Object.prototype.toString.call (x)) {

  	      case '[object Boolean]':
  	        return typeof x === 'object' ?
  	          'new Boolean (' + show (x.valueOf ()) + ')' :
  	          x.toString ();

  	      case '[object Number]':
  	        return typeof x === 'object' ?
  	          'new Number (' + show (x.valueOf ()) + ')' :
  	          1 / x === -Infinity ? '-0' : x.toString (10);

  	      case '[object String]':
  	        return typeof x === 'object' ?
  	          'new String (' + show (x.valueOf ()) + ')' :
  	          JSON.stringify (x);

  	      case '[object Date]':
  	        return 'new Date (' +
  	               show (isNaN (x.valueOf ()) ? NaN : x.toISOString ()) +
  	               ')';

  	      case '[object Error]':
  	        return 'new ' + x.name + ' (' + show (x.message) + ')';

  	      case '[object Arguments]':
  	        return 'function () { return arguments; } (' +
  	               (Array.prototype.map.call (x, show)).join (', ') +
  	               ')';

  	      case '[object Array]':
  	        seen.push (x);
  	        try {
  	          return '[' + ((x.map (show)).concat (
  	            sortedKeys (x)
  	            .filter (function(k) { return !(/^\d+$/.test (k)); })
  	            .map (entry (x))
  	          )).join (', ') + ']';
  	        } finally {
  	          seen.pop ();
  	        }

  	      case '[object Object]':
  	        seen.push (x);
  	        try {
  	          return (
  	            $$show in x &&
  	            (x.constructor == null || x.constructor.prototype !== x) ?
  	              x[$$show] () :
  	              '{' + ((sortedKeys (x)).map (entry (x))).join (', ') + '}'
  	          );
  	        } finally {
  	          seen.pop ();
  	        }

  	      case '[object Set]':
  	        seen.push (x);
  	        try {
  	          return 'new Set (' + show (Array.from (x.values ())) + ')';
  	        } finally {
  	          seen.pop ();
  	        }

  	      case '[object Map]':
  	        seen.push (x);
  	        try {
  	          return 'new Map (' + show (Array.from (x.entries ())) + ')';
  	        } finally {
  	          seen.pop ();
  	        }

  	      default:
  	        return String (x);

  	    }
  	  }

  	  return show;

  	}));
  } (sanctuaryShow));

  var show = sanctuaryShowExports;

  /* c8 ignore next */
  var setImmediate = typeof setImmediate === 'undefined' ? setImmediateFallback : setImmediate;

  function noop(){}
  function moop(){ return this }
  function call(f, x){ return f(x) }

  function setImmediateFallback(f, x){
    return setTimeout(f, 0, x);
  }

  function raise(x){
    setImmediate(function rethrowErrorDelayedToEscapePromiseCatch(){
      throw x;
    });
  }

  function showArg$1(x){
    return show(x) + ' :: ' + type.parse(type(x)).name;
  }

  function error(message){
    return new Error(message);
  }

  function typeError(message){
    return new TypeError(message);
  }

  function invalidArgument(it, at, expected, actual){
    return typeError(
      it + '() expects its ' + ordinal[at] + ' argument to ' + expected + '.' +
      '\n  Actual: ' + showArg$1(actual)
    );
  }

  function invalidArgumentOf(expected){
    return function(it, at, actual){
      return invalidArgument(it, at, expected, actual);
    };
  }

  function invalidArity(f, args){
    return new TypeError(
      f.name + '() expects to be called with a single argument per invocation\n' +
      '  Saw: ' + args.length + ' arguments' +
      Array.prototype.slice.call(args).map(function(arg, i){
        return '\n  ' + (
          ordinal[i] ?
          ordinal[i].charAt(0).toUpperCase() + ordinal[i].slice(1) :
          'Argument ' + String(i + 1)
        ) + ': ' + showArg$1(arg);
      }).join('')
    );
  }

  function invalidNamespace(m, x){
    return (
      'The Future was not created by ' + namespace + '. '
    + 'Make sure you transform other Futures to ' + namespace + ' Futures. '
    + 'Got ' + (x ? ('a Future from ' + x) : 'an unscoped Future') + '.'
    + '\n  See: https://github.com/fluture-js/Fluture#casting-futures'
    );
  }

  function invalidVersion(m, x){
    return (
      'The Future was created by ' + (x < version ? 'an older' : 'a newer')
    + ' version of ' + namespace + '. '
    + 'This means that one of the sources which creates Futures is outdated. '
    + 'Update this source, or transform its created Futures to be compatible.'
    + '\n  See: https://github.com/fluture-js/Fluture#casting-futures'
    );
  }

  function invalidFuture(desc, m, s){
    var id = type.parse(type(m));
    var info = id.name === name ? '\n' + (
      id.namespace !== namespace ? invalidNamespace(m, id.namespace)
    : id.version !== version ? invalidVersion(m, id.version)
    : 'Nothing seems wrong. Contact the Fluture maintainers.') : '';
    return typeError(
      desc + ' to be a valid Future.' + info + '\n' +
      '  Actual: ' + show(m) + ' :: ' + id.name + (s || '')
    );
  }

  function invalidFutureArgument(it, at, m, s){
    return invalidFuture(it + '() expects its ' + ordinal[at] + ' argument', m, s);
  }

  function ensureError(value, fn){
    var message;
    try{
      if(value instanceof Error) return value;
      message = 'A Non-Error was thrown from a Future: ' + show(value);
    }catch (_){
      message = 'Something was thrown from a Future, but it could not be converted to String';
    }
    var e = error(message);
    captureStackTrace(e, fn);
    return e;
  }

  function assignUnenumerable(o, prop, value){
    Object.defineProperty(o, prop, {value: value, writable: true, configurable: true});
  }

  function wrapException(caught, callingFuture){
    var origin = ensureError(caught, wrapException);
    var context = cat(origin.context || nil, callingFuture.context);
    var e = error(origin.message);
    assignUnenumerable(e, 'future', origin.future || callingFuture);
    assignUnenumerable(e, 'reason', origin.reason || origin);
    assignUnenumerable(e, 'stack', e.reason.stack);
    return withExtraContext(e, context);
  }

  function withExtraContext(e, context){
    assignUnenumerable(e, 'context', context);
    assignUnenumerable(e, 'stack', e.stack + contextToStackTrace(context));
    return e;
  }

  function contextToStackTrace(context){
    var stack = '', tail = context;
    while(tail !== nil){
      stack = stack + '\n' + tail.head.stack;
      tail = tail.tail;
    }
    return stack;
  }

  function isFunction(f){
    return typeof f === 'function';
  }

  function isThenable(m){
    return m instanceof Promise || m != null && isFunction(m.then);
  }

  function isBoolean(f){
    return typeof f === 'boolean';
  }

  function isObject(o){
    return o !== null && typeof o === 'object';
  }

  function isIterator(i){
    return isObject(i) && isFunction(i.next);
  }

  function Next(x){
    return {done: false, value: x};
  }

  function Done(x){
    return {done: true, value: x};
  }

  function isIteration(x){
    return isObject(x) && isBoolean(x.done);
  }

  /*eslint no-cond-assign:0, no-constant-condition:0 */

  function alwaysTrue(){
    return true;
  }

  function getArgs(it){
    var args = new Array(it.arity);
    for(var i = 1; i <= it.arity; i++){
      args[i - 1] = it['$' + String(i)];
    }
    return args;
  }

  function showArg(arg){
    return ' (' + show(arg) + ')';
  }

  var any = {pred: alwaysTrue, error: invalidArgumentOf('be anything')};
  var func = {pred: isFunction, error: invalidArgumentOf('be a Function')};
  var future = {pred: isFuture, error: invalidFutureArgument};

  function application(n, f, type, args, prev){
    if(args.length < 2 && type.pred(args[0])) return captureApplicationContext(prev);
    var e = args.length > 1 ? invalidArity(f, args) : type.error(f.name, n - 1, args[0]);
    captureStackTrace(e, f);
    throw withExtraContext(e, prev);
  }

  function application1(f, type, args){
    return application(1, f, type, args, nil);
  }

  function Future(computation){
    var context = application1(Future, func, arguments);
    return new Computation(context, computation);
  }

  function isFuture(x){
    return x instanceof Future || type(x) === $$type$1;
  }

  // Compliance with sanctuary-type-identifiers versions 1 and 2.
  // To prevent sanctuary-type-identifiers version 3 from identifying 'Future'
  // as being of the type denoted by $$type, we ensure that
  // Future.constructor.prototype is equal to Future.
  Future['@@type'] = $$type$1;
  Future.constructor = {prototype: Future};

  Future[FL.of] = resolve;
  Future[FL.chainRec] = chainRec;

  Future.prototype['@@type'] = $$type$1;

  Future.prototype['@@show'] = function Future$show(){
    return this.toString();
  };

  Future.prototype.pipe = function Future$pipe(f){
    if(!isFunction(f)) throw invalidArgument('Future#pipe', 0, 'be a Function', f);
    return f(this);
  };

  Future.prototype[FL.ap] = function Future$FL$ap(other){
    var context = captureContext(nil);
    return other._transform(new ApTransformation(context, this));
  };

  Future.prototype[FL.map] = function Future$FL$map(mapper){
    var context = captureContext(nil);
    return this._transform(new MapTransformation(context, mapper));
  };

  Future.prototype[FL.bimap] = function Future$FL$bimap(lmapper, rmapper){
    var context = captureContext(nil);
    return this._transform(new BimapTransformation(context, lmapper, rmapper));
  };

  Future.prototype[FL.chain] = function Future$FL$chain(mapper){
    var context = captureContext(nil);
    return this._transform(new ChainTransformation(context, mapper));
  };

  Future.prototype[FL.alt] = function Future$FL$alt(other){
    var context = captureContext(nil);
    return this._transform(new AltTransformation(context, other));
  };

  Future.prototype.extractLeft = function Future$extractLeft(){
    return [];
  };

  Future.prototype.extractRight = function Future$extractRight(){
    return [];
  };

  Future.prototype._transform = function Future$transform(transformation){
    return new Transformer(transformation.context, this, cons(transformation, nil));
  };

  Future.prototype.isTransformer = false;
  Future.prototype.context = nil;
  Future.prototype.arity = 0;
  Future.prototype.name = 'future';

  Future.prototype.toString = function Future$toString(){
    return this.name + getArgs(this).map(showArg).join('');
  };

  Future.prototype.toJSON = function Future$toJSON(){
    return {$: $$type$1, kind: 'interpreter', type: this.name, args: getArgs(this)};
  };

  function createInterpreter(arity, name, interpret){
    var Interpreter = function(context, $1, $2, $3){
      this.context = context;
      this.$1 = $1;
      this.$2 = $2;
      this.$3 = $3;
    };

    Interpreter.prototype = Object.create(Future.prototype);
    Interpreter.prototype.arity = arity;
    Interpreter.prototype.name = name;
    Interpreter.prototype._interpret = interpret;

    return Interpreter;
  }

  var Computation =
  createInterpreter(1, 'Future', function Computation$interpret(rec, rej, res){
    var computation = this.$1, open = false, cancel = noop, cont = function(){ open = true; };
    try{
      cancel = computation(function Computation$rej(x){
        cont = function Computation$rej$cont(){
          open = false;
          rej(x);
        };
        if(open){
          cont();
        }
      }, function Computation$res(x){
        cont = function Computation$res$cont(){
          open = false;
          res(x);
        };
        if(open){
          cont();
        }
      });
    }catch(e){
      rec(wrapException(e, this));
      return noop;
    }
    if(!(isFunction(cancel) && cancel.length === 0)){
      rec(wrapException(typeError(
        'The computation was expected to return a nullary cancellation function\n' +
        '  Actual: ' + show(cancel)
      ), this));
      return noop;
    }
    cont();
    return function Computation$cancel(){
      if(open){
        open = false;
        cancel && cancel();
      }
    };
  });

  var Never = createInterpreter(0, 'never', function Never$interpret(){
    return noop;
  });

  Never.prototype._isNever = true;

  var never = new Never(nil);

  var Crash = createInterpreter(1, 'crash', function Crash$interpret(rec){
    rec(this.$1);
    return noop;
  });

  function crash(x){
    return new Crash(application1(crash, any, arguments), x);
  }

  var Reject = createInterpreter(1, 'reject', function Reject$interpret(rec, rej){
    rej(this.$1);
    return noop;
  });

  Reject.prototype.extractLeft = function Reject$extractLeft(){
    return [this.$1];
  };

  function reject(x){
    return new Reject(application1(reject, any, arguments), x);
  }

  var Resolve = createInterpreter(1, 'resolve', function Resolve$interpret(rec, rej, res){
    res(this.$1);
    return noop;
  });

  Resolve.prototype.extractRight = function Resolve$extractRight(){
    return [this.$1];
  };

  function resolve(x){
    return new Resolve(application1(resolve, any, arguments), x);
  }

  //Note: This function is not curried because it's only used to satisfy the
  //      Fantasy Land ChainRec specification.
  function chainRec(step, init){
    return resolve(Next(init))._transform(new ChainTransformation(nil, function chainRec$recur(o){
      return o.done ?
             resolve(o.value) :
             step(Next, Done, o.value)._transform(new ChainTransformation(nil, chainRec$recur));
    }));
  }

  var Transformer =
  createInterpreter(2, 'transform', function Transformer$interpret(rec, rej, res){

    //These are the cold, and hot, transformation stacks. The cold actions are those that
    //have yet to run parallel computations, and hot are those that have.
    var cold = nil, hot = nil;

    //These combined variables define our current state.
    // future         = the future we are currently forking
    // transformation = the transformation to be informed when the future settles
    // cancel         = the cancel function of the current future
    // settled        = a boolean indicating whether a new tick should start
    // async          = a boolean indicating whether we are awaiting a result asynchronously
    var future, transformation, cancel = noop, settled, async = true, it;

    //Takes a transformation from the top of the hot stack and returns it.
    function nextHot(){
      var x = hot.head;
      hot = hot.tail;
      return x;
    }

    //Takes a transformation from the top of the cold stack and returns it.
    function nextCold(){
      var x = cold.head;
      cold = cold.tail;
      return x;
    }

    //This function is called with a future to use in the next tick.
    //Here we "flatten" the actions of another Sequence into our own actions,
    //this is the magic that allows for infinitely stack safe recursion because
    //actions like ChainAction will return a new Sequence.
    //If we settled asynchronously, we call drain() directly to run the next tick.
    function settle(m){
      settled = true;
      future = m;
      if(future.isTransformer){
        var tail = future.$2;
        while(!isNil(tail)){
          cold = cons(tail.head, cold);
          tail = tail.tail;
        }
        future = future.$1;
      }
      if(async) drain();
    }

    //This function serves as a rejection handler for our current future.
    //It will tell the current transformation that the future rejected, and it will
    //settle the current tick with the transformation's answer to that.
    function rejected(x){
      settle(transformation.rejected(x));
    }

    //This function serves as a resolution handler for our current future.
    //It will tell the current transformation that the future resolved, and it will
    //settle the current tick with the transformation's answer to that.
    function resolved(x){
      settle(transformation.resolved(x));
    }

    //This function is passed into actions when they are "warmed up".
    //If the transformation decides that it has its result, without the need to await
    //anything else, then it can call this function to force "early termination".
    //When early termination occurs, all actions which were stacked prior to the
    //terminator will be skipped. If they were already hot, they will also be
    //sent a cancel signal so they can cancel their own concurrent computations,
    //as their results are no longer needed.
    function early(m, terminator){
      cancel();
      cold = nil;
      if(async && transformation !== terminator){
        transformation.cancel();
        while((it = nextHot()) && it !== terminator) it.cancel();
      }
      settle(m);
    }

    //This will cancel the current Future, the current transformation, and all stacked hot actions.
    function Sequence$cancel(){
      cancel();
      transformation && transformation.cancel();
      while(it = nextHot()) it.cancel();
    }

    //This function is called when an exception is caught.
    function exception(e){
      Sequence$cancel();
      settled = true;
      cold = hot = nil;
      var error = wrapException(e, future);
      future = never;
      rec(error);
    }

    //This function serves to kickstart concurrent computations.
    //Takes all actions from the cold stack in reverse order, and calls run() on
    //each of them, passing them the "early" function. If any of them settles (by
    //calling early()), we abort. After warming up all actions in the cold queue,
    //we warm up the current transformation as well.
    function warmupActions(){
      cold = reverse(cold);
      while(cold !== nil){
        it = cold.head.run(early);
        if(settled) return;
        hot = cons(it, hot);
        cold = cold.tail;
      }
      transformation = transformation.run(early);
    }

    //This function represents our main execution loop. By "tick", we've been
    //referring to the execution of one iteration in the while-loop below.
    function drain(){
      async = false;
      while(true){
        settled = false;
        if(transformation = nextCold()){
          cancel = future._interpret(exception, rejected, resolved);
          if(!settled) warmupActions();
        }else if(transformation = nextHot()){
          cancel = future._interpret(exception, rejected, resolved);
        }else break;
        if(settled) continue;
        async = true;
        return;
      }
      cancel = future._interpret(exception, rej, res);
    }

    //Start the execution loop.
    settle(this);

    //Return the cancellation function.
    return Sequence$cancel;

  });

  Transformer.prototype.isTransformer = true;

  Transformer.prototype._transform = function Transformer$_transform(transformation){
    return new Transformer(transformation.context, this.$1, cons(transformation, this.$2));
  };

  Transformer.prototype.toString = function Transformer$toString(){
    return toArray(reverse(this.$2)).reduce(function(str, action){
      return action.name + getArgs(action).map(showArg).join('') + ' (' + str + ')';
    }, this.$1.toString());
  };

  function BaseTransformation$rejected(x){
    this.cancel();
    return new Reject(this.context, x);
  }

  function BaseTransformation$resolved(x){
    this.cancel();
    return new Resolve(this.context, x);
  }

  function BaseTransformation$toJSON(){
    return {$: $$type$1, kind: 'transformation', type: this.name, args: getArgs(this)};
  }

  var BaseTransformation = {
    rejected: BaseTransformation$rejected,
    resolved: BaseTransformation$resolved,
    run: moop,
    cancel: noop,
    context: nil,
    arity: 0,
    name: 'transform',
    toJSON: BaseTransformation$toJSON
  };

  function wrapHandler(handler){
    return function transformationHandler(x){
      var m;
      try{
        m = handler.call(this, x);
      }catch(e){
        return new Crash(this.context, e);
      }
      if(isFuture(m)){
        return m;
      }
      return new Crash(this.context, invalidFuture(
        this.name + ' expects the return value from the function it\'s given', m,
        '\n  When called with: ' + show(x)
      ));
    };
  }

  function createTransformation(arity, name, prototype){
    var Transformation = function(context, $1, $2){
      this.context = context;
      this.$1 = $1;
      this.$2 = $2;
    };

    Transformation.prototype = Object.create(BaseTransformation);
    Transformation.prototype.arity = arity;
    Transformation.prototype.name = name;

    if(typeof prototype.rejected === 'function'){
      Transformation.prototype.rejected = wrapHandler(prototype.rejected);
    }

    if(typeof prototype.resolved === 'function'){
      Transformation.prototype.resolved = wrapHandler(prototype.resolved);
    }

    if(typeof prototype.run === 'function'){
      Transformation.prototype.run = prototype.run;
    }

    return Transformation;
  }

  var ApTransformation = createTransformation(1, 'ap', {
    resolved: function ApTransformation$resolved(f){
      if(isFunction(f)) return this.$1._transform(new MapTransformation(this.context, f));
      throw typeError(
        'ap expects the second Future to resolve to a Function\n' +
        '  Actual: ' + show(f)
      );
    }
  });

  var AltTransformation = createTransformation(1, 'alt', {
    rejected: function AltTransformation$rejected(){ return this.$1 }
  });

  var MapTransformation = createTransformation(1, 'map', {
    resolved: function MapTransformation$resolved(x){
      return new Resolve(this.context, call(this.$1, x));
    }
  });

  var BimapTransformation = createTransformation(2, 'bimap', {
    rejected: function BimapTransformation$rejected(x){
      return new Reject(this.context, call(this.$1, x));
    },
    resolved: function BimapTransformation$resolved(x){
      return new Resolve(this.context, call(this.$2, x));
    }
  });

  var ChainTransformation = createTransformation(1, 'chain', {
    resolved: function ChainTransformation$resolved(x){ return call(this.$1, x) }
  });

  var After = createInterpreter(2, 'after', function After$interpret(rec, rej, res){
    var id = setTimeout(res, this.$1, this.$2);
    return function After$cancel(){ clearTimeout(id); };
  });

  After.prototype.extractRight = function After$extractRight(){
    return [this.$2];
  };

  var AndTransformation = createTransformation(1, 'and', {
    resolved: function AndTransformation$resolved(){ return this.$1 }
  });

  function invalidPromise(p, f, a){
    return typeError(
      'encaseP() expects the function it\'s given to return a Promise/Thenable'
      + '\n  Actual: ' + show(p) + '\n  From calling: ' + show(f)
      + '\n  With: ' + show(a)
    );
  }

  createInterpreter(2, 'encaseP', function EncaseP$interpret(rec, rej, res){
    var open = true, fn = this.$1, arg = this.$2, p;
    try{
      p = fn(arg);
    }catch(e){
      rec(wrapException(e, this));
      return noop;
    }
    if(!isThenable(p)){
      rec(wrapException(invalidPromise(p, fn, arg), this));
      return noop;
    }
    p.then(function EncaseP$res(x){
      if(open){
        open = false;
        res(x);
      }
    }, function EncaseP$rej(x){
      if(open){
        open = false;
        rej(x);
      }
    });
    return function EncaseP$cancel(){ open = false; };
  });

  createInterpreter(2, 'encase', function Encase$interpret(rec, rej, res){
    var fn = this.$1, r;
    try{ r = fn(this.$2); }catch(e){ rej(e); return noop }
    res(r);
    return noop;
  });

  createTransformation(2, 'bichain', {
    rejected: function BichainTransformation$rejected(x){ return call(this.$1, x) },
    resolved: function BichainTransformation$resolved(x){ return call(this.$2, x) }
  });

  function Eager(future){
    var _this = this;
    _this.rec = noop;
    _this.rej = noop;
    _this.res = noop;
    _this.crashed = false;
    _this.rejected = false;
    _this.resolved = false;
    _this.value = null;
    _this.cancel = future._interpret(function Eager$crash(x){
      _this.value = x;
      _this.crashed = true;
      _this.cancel = noop;
      _this.rec(x);
    }, function Eager$reject(x){
      _this.value = x;
      _this.rejected = true;
      _this.cancel = noop;
      _this.rej(x);
    }, function Eager$resolve(x){
      _this.value = x;
      _this.resolved = true;
      _this.cancel = noop;
      _this.res(x);
    });
  }

  Eager.prototype = Object.create(Future.prototype);

  Eager.prototype._interpret = function Eager$interpret(rec, rej, res){
    if(this.crashed) rec(this.value);
    else if(this.rejected) rej(this.value);
    else if(this.resolved) res(this.value);
    else {
      this.rec = rec;
      this.rej = rej;
      this.res = res;
    }
    return this.cancel;
  };

  function earlyCrash(early, x){
    early(crash(x));
  }

  function earlyReject(early, x){
    early(reject(x));
  }

  function earlyResolve(early, x){
    early(resolve(x));
  }

  function createParallelTransformation(name, rec, rej, res, prototype){
    var ParallelTransformation = createTransformation(1, name, Object.assign({
      run: function Parallel$run(early){
        var eager = new Eager(this.$1);
        var transformation = new ParallelTransformation(this.context, eager);
        function Parallel$early(m){ early(m, transformation); }
        transformation.cancel = eager._interpret(
          function Parallel$rec(x){ rec(Parallel$early, x); },
          function Parallel$rej(x){ rej(Parallel$early, x); },
          function Parallel$res(x){ res(Parallel$early, x); }
        );
        return transformation;
      }
    }, prototype));
    return ParallelTransformation;
  }

  var PairTransformation = createTransformation(1, 'pair', {
    resolved: function PairTransformation$resolved(x){
      return new Resolve(this.context, [x, this.$1]);
    }
  });

  var BothTransformation =
  createParallelTransformation('both', earlyCrash, earlyReject, noop, {
    resolved: function BothTransformation$resolved(x){
      return this.$1._transform(new PairTransformation(this.context, x));
    }
  });

  function both(left){
    var context1 = application1(both, future, arguments);
    return function both(right){
      var context2 = application(2, both, future, arguments, context1);
      return right._transform(new BothTransformation(context2, left));
    };
  }

  var Cold = 0;
  var Pending = 1;
  var Crashed = 2;
  var Rejected = 3;
  var Resolved = 4;

  function Queued(rec, rej, res){
    this[Crashed] = rec;
    this[Rejected] = rej;
    this[Resolved] = res;
  }

  var Cache = createInterpreter(1, 'cache', function Cache$interpret(rec, rej, res){
    var cancel = noop;

    switch(this._state){
      /* c8 ignore next 4 */
      case Pending: cancel = this._addToQueue(rec, rej, res); break;
      case Crashed: rec(this._value); break;
      case Rejected: rej(this._value); break;
      case Resolved: res(this._value); break;
      default:
        this._queue = [];
        cancel = this._addToQueue(rec, rej, res);
        this.run();
    }

    return cancel;
  });

  Cache.prototype._cancel = noop;
  Cache.prototype._queue = null;
  Cache.prototype._queued = 0;
  Cache.prototype._value = undefined;
  Cache.prototype._state = Cold;

  Cache.prototype.extractLeft = function Cache$extractLeft(){
    return this._state === Rejected ? [this._value] : [];
  };

  Cache.prototype.extractRight = function Cache$extractRight(){
    return this._state === Resolved ? [this._value] : [];
  };

  Cache.prototype._addToQueue = function Cache$addToQueue(rec, rej, res){
    var _this = this;
    if(_this._state > Pending) return noop;
    var i = _this._queue.push(new Queued(rec, rej, res)) - 1;
    _this._queued = _this._queued + 1;

    return function Cache$removeFromQueue(){
      if(_this._state > Pending) return;
      _this._queue[i] = undefined;
      _this._queued = _this._queued - 1;
      if(_this._queued === 0) _this.reset();
    };
  };

  Cache.prototype._drainQueue = function Cache$drainQueue(){
    if(this._state <= Pending) return;
    if(this._queued === 0) return;
    var queue = this._queue;
    var length = queue.length;
    var state = this._state;
    var value = this._value;

    for(var i = 0; i < length; i++){
      queue[i] && queue[i][state](value);
      queue[i] = undefined;
    }

    this._queue = undefined;
    this._queued = 0;
  };

  Cache.prototype.crash = function Cache$crash(error){
    if(this._state > Pending) return;
    this._value = error;
    this._state = Crashed;
    this._drainQueue();
  };

  Cache.prototype.reject = function Cache$reject(reason){
    if(this._state > Pending) return;
    this._value = reason;
    this._state = Rejected;
    this._drainQueue();
  };

  Cache.prototype.resolve = function Cache$resolve(value){
    if(this._state > Pending) return;
    this._value = value;
    this._state = Resolved;
    this._drainQueue();
  };

  Cache.prototype.run = function Cache$run(){
    var _this = this;
    if(_this._state > Cold) return;
    _this._state = Pending;
    _this._cancel = _this.$1._interpret(
      function Cache$fork$rec(x){ _this.crash(x); },
      function Cache$fork$rej(x){ _this.reject(x); },
      function Cache$fork$res(x){ _this.resolve(x); }
    );
  };

  Cache.prototype.reset = function Cache$reset(){
    if(this._state === Cold) return;
    if(this._state === Pending) this._cancel();
    this._cancel = noop;
    this._queue = [];
    this._queued = 0;
    this._value = undefined;
    this._state = Cold;
  };

  createTransformation(1, 'chainRej', {
    rejected: function ChainRejTransformation$rejected(x){ return call(this.$1, x) }
  });

  createTransformation(2, 'coalesce', {
    rejected: function CoalesceTransformation$rejected(x){
      return new Resolve(this.context, call(this.$1, x));
    },
    resolved: function CoalesceTransformation$resolved(x){
      return new Resolve(this.context, call(this.$2, x));
    }
  });

  var Undetermined = 0;
  var Synchronous = 1;
  var Asynchronous = 2;

  /*eslint consistent-return: 0 */

  function invalidIteration(o){
    return typeError(
      'The iterator did not return a valid iteration from iterator.next()\n' +
      '  Actual: ' + show(o)
    );
  }

  function invalidState(x){
    return invalidFuture(
      'go() expects the value produced by the iterator', x,
      '\n  Tip: If you\'re using a generator, make sure you always yield a Future'
    );
  }

  createInterpreter(1, 'go', function Go$interpret(rec, rej, res){

    var _this = this, timing = Undetermined, cancel = noop, state, value, iterator;

    function crash(e){
      rec(wrapException(e, _this));
    }

    try{
      iterator = _this.$1();
    }catch(e){
      crash(e);
      return noop;
    }

    if(!isIterator(iterator)){
      crash(invalidArgument('go', 0, 'return an iterator, maybe you forgot the "*"', iterator));
      return noop;
    }

    function resolved(x){
      value = x;
      if(timing === Asynchronous) return drain();
      timing = Synchronous;
    }

    function drain(){
      //eslint-disable-next-line no-constant-condition
      while(true){
        try{
          state = iterator.next(value);
        }catch(e){
          return crash(e);
        }
        if(!isIteration(state)) return crash(invalidIteration(state));
        if(state.done) break;
        if(!isFuture(state.value)){
          return crash(invalidState(state.value));
        }
        timing = Undetermined;
        cancel = state.value._interpret(crash, rej, resolved);
        if(timing === Undetermined) return timing = Asynchronous;
      }
      res(state.value);
    }

    drain();

    return function Go$cancel(){ cancel(); };

  });

  function invalidDisposal(m, f, x){
    return invalidFuture(
      'hook() expects the return value from the first function it\'s given', m,
      '\n  From calling: ' + show(f) + '\n  With: ' + show(x)
    );
  }

  function invalidConsumption(m, f, x){
    return invalidFuture(
      'hook() expects the return value from the second function it\'s given', m,
      '\n  From calling: ' + show(f) + '\n  With: ' + show(x)
    );
  }

  createInterpreter(3, 'hook', function Hook$interpret(rec, rej, res){

    var _this = this, _acquire = this.$1, _dispose = this.$2, _consume = this.$3;
    var cancel, cancelConsume = noop, resource, value, cont = noop;

    function Hook$done(){
      cont(value);
    }

    function Hook$rec(x){
      rec(wrapException(x, _this));
    }

    function Hook$dispose(){
      var disposal;
      try{
        disposal = _dispose(resource);
      }catch(e){
        return Hook$rec(e);
      }
      if(!isFuture(disposal)){
        return Hook$rec(invalidDisposal(disposal, _dispose, resource));
      }
      cancel = Hook$cancelDisposal;
      disposal._interpret(Hook$rec, Hook$disposalRejected, Hook$done);
    }

    function Hook$cancelConsumption(){
      cancelConsume();
      Hook$dispose();
      Hook$cancelDisposal();
    }

    function Hook$cancelDisposal(){
      cont = noop;
    }

    function Hook$disposalRejected(x){
      Hook$rec(new Error('The disposal Future rejected with ' + show(x)));
    }

    function Hook$consumptionException(x){
      cont = Hook$rec;
      value = x;
      Hook$dispose();
    }

    function Hook$consumptionRejected(x){
      cont = rej;
      value = x;
      Hook$dispose();
    }

    function Hook$consumptionResolved(x){
      cont = res;
      value = x;
      Hook$dispose();
    }

    function Hook$consume(x){
      resource = x;
      var consumption;
      try{
        consumption = _consume(resource);
      }catch(e){
        return Hook$consumptionException(e);
      }
      if(!isFuture(consumption)){
        return Hook$consumptionException(invalidConsumption(consumption, _consume, resource));
      }
      cancel = Hook$cancelConsumption;
      cancelConsume = consumption._interpret(
        Hook$consumptionException,
        Hook$consumptionRejected,
        Hook$consumptionResolved
      );
    }

    var cancelAcquire = _acquire._interpret(Hook$rec, rej, Hook$consume);
    cancel = cancel || cancelAcquire;

    return function Hook$fork$cancel(){
      rec = raise;
      cancel();
    };

  });

  createTransformation(1, 'lastly', {
    rejected: function LastlyAction$rejected(x){
      return this.$1._transform(new AndTransformation(this.context, new Reject(this.context, x)));
    },
    resolved: function LastlyAction$resolved(x){
      return this.$1._transform(new AndTransformation(this.context, new Resolve(this.context, x)));
    }
  });

  createTransformation(1, 'mapRej', {
    rejected: function MapRejTransformation$rejected(x){
      return new Reject(this.context, call(this.$1, x));
    }
  });

  createInterpreter(1, 'node', function Node$interpret(rec, rej, res){
    function Node$done(err, val){
      cont = err ? function EncaseN3$rej(){
        open = false;
        rej(err);
      } : function EncaseN3$res(){
        open = false;
        res(val);
      };
      if(open){
        cont();
      }
    }
    var open = false, cont = function(){ open = true; };
    try{
      call(this.$1, Node$done);
    }catch(e){
      rec(wrapException(e, this));
      open = false;
      return noop;
    }
    cont();
    return function Node$cancel(){ open = false; };
  });

  var ParallelApTransformation =
  createParallelTransformation('pap', earlyCrash, earlyReject, noop, {
    resolved: function ParallelApTransformation$resolved(f){
      if(isFunction(f)) return this.$1._transform(new MapTransformation(this.context, f));
      throw typeError(
        'pap expects the second Future to resolve to a Function\n' +
        '  Actual: ' + show(f)
      );
    }
  });

  createInterpreter(2, 'parallel', function Parallel$interpret(rec, rej, res){

    var _this = this, futures = this.$2, length = futures.length;
    var max = Math.min(this.$1, length), cancels = new Array(length), out = new Array(length);
    var cursor = 0, running = 0, blocked = false, cont = noop;

    function Parallel$cancel(){
      rec = noop;
      rej = noop;
      res = noop;
      cursor = length;
      for(var n = 0; n < length; n++) cancels[n] && cancels[n]();
    }

    function Parallel$run(idx){
      running++;
      cancels[idx] = futures[idx]._interpret(function Parallel$rec(e){
        cont = rec;
        cancels[idx] = noop;
        Parallel$cancel();
        cont(wrapException(e, _this));
      }, function Parallel$rej(reason){
        cont = rej;
        cancels[idx] = noop;
        Parallel$cancel();
        cont(reason);
      }, function Parallel$res(value){
        cancels[idx] = noop;
        out[idx] = value;
        running--;
        if(cursor === length && running === 0) res(out);
        else if(blocked) Parallel$drain();
      });
    }

    function Parallel$drain(){
      blocked = false;
      while(cursor < length && running < max) Parallel$run(cursor++);
      blocked = true;
    }

    Parallel$drain();

    return Parallel$cancel;

  });

  resolve([]);

  var RaceTransformation =
  createParallelTransformation('race', earlyCrash, earlyReject, earlyResolve, {});

  function ConcurrentFuture (sequential){
    this.sequential = sequential;
  }

  ConcurrentFuture.prototype = Object.create(Par.prototype);

  function Par (sequential){
    if(!isFuture(sequential)) throw invalidFutureArgument(Par.name, 0, sequential);
    return new ConcurrentFuture(sequential);
  }

  var $$type = namespace + '/ConcurrentFuture@' + version;
  var zeroInstance = new ConcurrentFuture(never);

  // Compliance with sanctuary-type-identifiers versions 1 and 2.
  // To prevent sanctuary-type-identifiers version 3 from identifying
  // 'Par' as being of the type denoted by $$type, we ensure that
  // Par.constructor.prototype is equal to Par.
  Par['@@type'] = $$type;
  Par.constructor = {prototype: Par};

  Par[FL.of] = function Par$of(x){
    return new ConcurrentFuture(resolve(x));
  };

  Par[FL.zero] = function Par$zero(){
    return zeroInstance;
  };

  Par.prototype['@@type'] = $$type;

  Par.prototype['@@show'] = function Par$show(){
    return this.toString();
  };

  Par.prototype.toString = function Par$toString(){
    return 'Par (' + this.sequential.toString() + ')';
  };

  Par.prototype[FL.map] = function Par$FL$map(f){
    var context = captureContext(
      nil);
    return new ConcurrentFuture(this.sequential._transform(new MapTransformation(context, f)));
  };

  Par.prototype[FL.ap] = function Par$FL$ap(other){
    var context = captureContext(
      nil);
    return new ConcurrentFuture(other.sequential._transform(
      new ParallelApTransformation(context, this.sequential)
    ));
  };

  Par.prototype[FL.alt] = function Par$FL$alt(other){
    var context = captureContext(
      nil);
    return new ConcurrentFuture(other.sequential._transform(
      new RaceTransformation(context, this.sequential)
    ));
  };

  var RejectAfter =
  createInterpreter(2, 'rejectAfter', function RejectAfter$interpret(rec, rej){
    var id = setTimeout(rej, this.$1, this.$2);
    return function RejectAfter$cancel(){ clearTimeout(id); };
  });

  RejectAfter.prototype.extractLeft = function RejectAfter$extractLeft(){
    return [this.$2];
  };

  createTransformation(0, 'swap', {
    resolved: function SwapTransformation$resolved(x){
      return new Reject(this.context, x);
    },
    rejected: function SwapTransformation$rejected(x){
      return new Resolve(this.context, x);
    }
  });

  const toFuture = unless(isFuture, resolve);

  const getter = (l) => (data) => (compose(
      chain((value) => isNil$1(value) ? reject(data) : resolve(value)),
      chain((value) => toFuture(value)),
      map(view(l)),
      toFuture
  )(data));

  const setter = (l) => (value, target) => (compose(
      chain(([v, t]) => toFuture(set(l, v, t))),
      both(toFuture(value))
  )(toFuture(target)));


  const wrap = (l) => lens(
      getter(l),
      setter(l)
  );

  const flens = compose(wrap, lens);

  const flensProp = (prop) => wrap(lensProp(prop));
  const flensPath = (path) => wrap(lensPath(path));
  const flensIndex = (index) => wrap(lensIndex(index));

  exports.flens = flens;
  exports.flensIndex = flensIndex;
  exports.flensPath = flensPath;
  exports.flensProp = flensProp;
  exports.wrap = wrap;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
