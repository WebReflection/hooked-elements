import {augmentor, dropEffect, hasEffect} from 'augmentor';
import {define as $define} from 'wicked-elements';

// default init with auto-augmented and invoked render
function init() { render(this); }

export const define = (selector, definition) => $define(
  selector,
  typeof definition === 'function' ?
    {init, render: definition} :
    ((definition.init || (definition.init = init)), definition)
);

export const render = wicked => {
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

export {
  useState,
  useEffect, useLayoutEffect,
  useContext, createContext,
  useReducer,
  useCallback,
  useMemo,
  useRef
} from 'augmentor';

export {
  get,
  upgrade,
  whenDefined
} from 'wicked-elements';
