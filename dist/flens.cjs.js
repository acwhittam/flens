'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ramda = require('ramda');
var fluture = require('fluture');

const toFuture = ramda.unless(fluture.isFuture, fluture.resolve);

const getter = (l) => (data) => (ramda.compose(
    ramda.chain((value) => ramda.isNil(value) ? fluture.reject(data) : fluture.resolve(value)),
    ramda.chain((value) => toFuture(value)),
    ramda.map(ramda.view(l)),
    toFuture
)(data));

const setter = (l) => (value, target) => (ramda.compose(
    ramda.map(([v, t]) => ramda.set(l, v, t)),
    fluture.both(toFuture(value))
)(toFuture(target)));


const wrap = (l) => ramda.lens(
    getter(l),
    setter(l)
);

const flens = ramda.compose(wrap, ramda.lens);

exports.flens = flens;
exports.wrap = wrap;
