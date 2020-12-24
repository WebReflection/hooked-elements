import {hooked, dropEffect, hasEffect} from 'uhooks';
import {define as $define, defineAsync as $async} from 'wicked-elements';

// default init with auto-augmented and invoked render
function init() { render(this); }

export const define = (selector, definition) => {
  $define(
    selector,
    typeof definition === 'function' ?
      {init, render: definition} :
      ((definition.init || (definition.init = init)), definition)
  );
};

export const defineAsync = (selector, callback) => {
  $async(selector, callback, define);
};

export const render = wicked => {
  const {disconnected, element, render} = wicked;
  const hook = hooked(render.bind(wicked, element));
  wicked.disconnected = () => {
    if (hasEffect(hook))
      dropEffect(hook);
    if (disconnected)
      disconnected.call(wicked);
  };
  return (wicked.render = hook)();
};

export {
  useState,
  useEffect, useLayoutEffect,
  useContext, createContext,
  useReducer,
  useCallback,
  useMemo,
  useRef
} from 'uhooks';

export {
  get,
  upgrade,
  whenDefined
} from 'wicked-elements';
