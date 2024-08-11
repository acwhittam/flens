"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    flens: function() {
        return flens;
    },
    flensIndex: function() {
        return flensIndex;
    },
    flensPath: function() {
        return flensPath;
    },
    flensProp: function() {
        return flensProp;
    },
    wrap: function() {
        return wrap;
    }
});
var _ramda = require("ramda");
var _fluture = require("fluture");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var toFuture = (0, _ramda.unless)(_fluture.isFuture, _fluture.resolve);
var getter = function(l) {
    return function(data) {
        return (0, _ramda.compose)((0, _ramda.chain)(function(value) {
            return (0, _ramda.isNil)(value) ? (0, _fluture.reject)(data) : (0, _fluture.resolve)(value);
        }), (0, _ramda.chain)(function(value) {
            return toFuture(value);
        }), (0, _ramda.map)((0, _ramda.view)(l)), toFuture)(data);
    };
};
var setter = function(l) {
    return function(value, target) {
        return (0, _ramda.compose)((0, _ramda.chain)(function(param) {
            var _param = _sliced_to_array(param, 2), v = _param[0], t = _param[1];
            return toFuture((0, _ramda.set)(l, v, t));
        }), (0, _fluture.both)(toFuture(value)))(toFuture(target));
    };
};
var wrap = function(l) {
    return (0, _ramda.lens)(getter(l), setter(l));
};
var flens = (0, _ramda.compose)(wrap, _ramda.lens);
var flensProp = function(prop) {
    return wrap((0, _ramda.lensProp)(prop));
};
var flensPath = function(path) {
    return wrap((0, _ramda.lensPath)(path));
};
var flensIndex = function(index) {
    return wrap((0, _ramda.lensIndex)(index));
};

