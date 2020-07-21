'use strict';
const {augmentor, dropEffect, hasEffect} = require('augmentor');
const {define: $define, defineAsync: $async} = require('wicked-elements');

// default init with auto-augmented and invoked render
function init() { render(this); }

const define = (selector, definition) => $define(
  selector,
  typeof definition === 'function' ?
    {init, render: definition} :
    ((definition.init || (definition.init = init)), definition)
);
exports.define = define;

const defineAsync = (selector, callback) => {
  $async(selector, callback, define);
};
exports.defineAsync = defineAsync;

const render = wicked => {
  const {disconnected, element, render} = wicked;
  const hook = augmentor(render.bind(wicked, element));
  wicked.disconnected = () => {
    if (hasEffect(hook))
      dropEffect(hook);
    if (disconnected)
      disconnected.call(wicked);
  };
  return (wicked.render = hook)();
};
exports.render = render;

(m => {
  exports.useState = m.useState;
  exports.useEffect = m.useEffect;
  exports.useLayoutEffect = m.useLayoutEffect;
  exports.useContext = m.useContext;
  exports.createContext = m.createContext;
  exports.useReducer = m.useReducer;
  exports.useCallback = m.useCallback;
  exports.useMemo = m.useMemo;
  exports.useRef = m.useRef;
})(require('augmentor'));

(m => {
  exports.get = m.get;
  exports.upgrade = m.upgrade;
  exports.whenDefined = m.whenDefined;
})(require('wicked-elements'));
