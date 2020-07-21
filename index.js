var hookedElements = (function (exports) {
  'use strict';

  var compat = typeof cancelAnimationFrame === 'function';
  var cAF = compat ? cancelAnimationFrame : clearTimeout;
  var rAF = compat ? requestAnimationFrame : setTimeout;
  function reraf(limit) {
    var force, timer, callback, self, args;
    reset();
    return function reschedule(_callback, _self, _args) {
      callback = _callback;
      self = _self;
      args = _args;
      if (!timer) timer = rAF(invoke);
      if (--force < 0) stop(true);
      return stop;
    };

    function invoke() {
      reset();
      callback.apply(self, args || []);
    }

    function reset() {
      force = limit || Infinity;
      timer = compat ? 0 : null;
    }

    function stop(flush) {
      var didStop = !!timer;

      if (didStop) {
        cAF(timer);
        if (flush) invoke();
      }

      return didStop;
    }
  }

  var umap = (function (_) {
    return {
      // About: get: _.get.bind(_)
      // It looks like WebKit/Safari didn't optimize bind at all,
      // so that using bind slows it down by 60%.
      // Firefox and Chrome are just fine in both cases,
      // so let's use the approach that works fast everywhere 👍
      get: function get(key) {
        return _.get(key);
      },
      set: function set(key, value) {
        return _.set(key, value), value;
      }
    };
  });

  /*! (c) Andrea Giammarchi - ISC */
  var state = null; // main exports

  var augmentor = function augmentor(fn) {
    var stack = [];
    return function hook() {
      var prev = state;
      var after = [];
      state = {
        hook: hook,
        args: arguments,
        stack: stack,
        i: 0,
        length: stack.length,
        after: after
      };

      try {
        return fn.apply(null, arguments);
      } finally {
        state = prev;

        for (var i = 0, length = after.length; i < length; i++) {
          after[i]();
        }
      }
    };
  };

  var updates = umap(new WeakMap());

  var hookdate = function hookdate(hook, ctx, args) {
    hook.apply(ctx, args);
  };

  var defaults = {
    async: false,
    always: false
  };

  var getValue = function getValue(value, f) {
    return typeof f == 'function' ? f(value) : f;
  };

  var useReducer = function useReducer(reducer, value, init, options) {
    var i = state.i++;
    var _state = state,
        hook = _state.hook,
        args = _state.args,
        stack = _state.stack,
        length = _state.length;
    if (i === length) state.length = stack.push({});
    var ref = stack[i];
    ref.args = args;

    if (i === length) {
      var fn = typeof init === 'function';

      var _ref = (fn ? options : init) || options || defaults,
          asy = _ref.async,
          always = _ref.always;

      ref.$ = fn ? init(value) : getValue(void 0, value);
      ref._ = asy ? updates.get(hook) || updates.set(hook, reraf()) : hookdate;

      ref.f = function (value) {
        var $value = reducer(ref.$, value);

        if (always || ref.$ !== $value) {
          ref.$ = $value;

          ref._(hook, null, ref.args);
        }
      };
    }

    return [ref.$, ref.f];
  }; // useState

  var useState = function useState(value, options) {
    return useReducer(getValue, value, void 0, options);
  }; // useContext

  var hooks = new WeakMap();

  var invoke = function invoke(_ref2) {
    var hook = _ref2.hook,
        args = _ref2.args;
    hook.apply(null, args);
  };

  var createContext = function createContext(value) {
    var context = {
      value: value,
      provide: provide
    };
    hooks.set(context, []);
    return context;
  };
  var useContext = function useContext(context) {
    var _state2 = state,
        hook = _state2.hook,
        args = _state2.args;
    var stack = hooks.get(context);
    var info = {
      hook: hook,
      args: args
    };
    if (!stack.some(update, info)) stack.push(info);
    return context.value;
  };

  function provide(value) {
    if (this.value !== value) {
      this.value = value;
      hooks.get(this).forEach(invoke);
    }
  }

  function update(_ref3) {
    var hook = _ref3.hook;
    return hook === this.hook;
  } // dropEffect, hasEffect, useEffect, useLayoutEffect


  var effects = new WeakMap();
  var fx = umap(effects);

  var stop = function stop() {};

  var createEffect = function createEffect(asy) {
    return function (effect, guards) {
      var i = state.i++;
      var _state3 = state,
          hook = _state3.hook,
          after = _state3.after,
          stack = _state3.stack,
          length = _state3.length;

      if (i < length) {
        var info = stack[i];
        var _update = info.update,
            values = info.values,
            _stop = info.stop;

        if (!guards || guards.some(different, values)) {
          info.values = guards;
          if (asy) _stop(asy);
          var clean = info.clean;

          if (clean) {
            info.clean = null;
            clean();
          }

          var _invoke = function _invoke() {
            info.clean = effect();
          };

          if (asy) _update(_invoke);else after.push(_invoke);
        }
      } else {
        var _update2 = asy ? reraf() : stop;

        var _info = {
          clean: null,
          update: _update2,
          values: guards,
          stop: stop
        };
        state.length = stack.push(_info);
        (fx.get(hook) || fx.set(hook, [])).push(_info);

        var _invoke2 = function _invoke2() {
          _info.clean = effect();
        };

        if (asy) _info.stop = _update2(_invoke2);else after.push(_invoke2);
      }
    };
  };

  var dropEffect = function dropEffect(hook) {
    (effects.get(hook) || []).forEach(function (info) {
      var clean = info.clean,
          stop = info.stop;
      stop();

      if (clean) {
        info.clean = null;
        clean();
      }
    });
  };
  var hasEffect = effects.has.bind(effects);
  var useEffect = createEffect(true);
  var useLayoutEffect = createEffect(false); // useMemo, useCallback

  var useMemo = function useMemo(memo, guards) {
    var i = state.i++;
    var _state4 = state,
        stack = _state4.stack,
        length = _state4.length;
    if (i === length) state.length = stack.push({
      $: memo(),
      _: guards
    });else if (!guards || guards.some(different, stack[i]._)) stack[i] = {
      $: memo(),
      _: guards
    };
    return stack[i].$;
  };
  var useCallback = function useCallback(fn, guards) {
    return useMemo(function () {
      return fn;
    }, guards);
  }; // useRef

  var useRef = function useRef(value) {
    var i = state.i++;
    var _state5 = state,
        stack = _state5.stack,
        length = _state5.length;
    if (i === length) state.length = stack.push({
      current: value
    });
    return stack[i];
  };

  function different(value, i) {
    return value !== this[i];
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /*! (c) Andrea Giammarchi - ISC */
  // borrowed from https://github.com/WebReflection/dom4/blob/master/src/dom4.js#L130
  var elementMatches = function (indexOf) {
    return 'matches' in document.documentElement ? function (selector) {
      return this.matches(selector);
    } : function (selector) {
      var el = this;
      return (el.matchesSelector || el.webkitMatchesSelector || el.khtmlMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector || fallback).call(el, selector);
    };

    function fallback(selector) {
      var parentNode = this.parentNode;
      return !!parentNode && -1 < indexOf.call(parentNode.querySelectorAll(selector), this);
    }
  }([].indexOf);

  /*! (c) Andrea Giammarchi - ISC */
  var nodeContains = Node.prototype.contains || function contains(el) {
    return !!(el.compareDocumentPosition(this) & el.DOCUMENT_POSITION_CONTAINS);
  };

  // A Lame Promise fallback for IE
  var LIE = typeof Promise === 'undefined' ? function (fn) {
    var queue = [];
    var resolved = false;
    fn(resolve);
    return {
      then: then,
      "catch": function _catch() {}
    };

    function resolve() {
      resolved = true;
      queue.splice(0).forEach(then);
    }

    function then(fn) {
      resolved ? setTimeout(fn) : queue.push(fn);
      return this;
    }
  } : Promise;

  var create = Object.create,
      keys = Object.keys;
  var wickedElements = new WeakMap();
  var defined = new Map();
  var uid = '_' + Math.random();
  var connected = 'connected';
  var disconnected = 'dis' + connected;
  var lazy = new Set();
  var selectors = [];
  var components = [];
  var empty = [];
  var forEach = empty.forEach;

  var $ = function $(element) {
    return wickedElements.get(element) || empty;
  };

  var attrObserver = new MutationObserver(function (mutations) {
    for (var i = 0, length = mutations.length; i < length; i++) {
      $(mutations[i].target).forEach(onAttributeChanged, mutations[i]);
    }
  });
  new MutationObserver(function (mutations) {
    if (selectors.length) {
      for (var i = 0, length = mutations.length; i < length; i++) {
        var _mutations$i = mutations[i],
            addedNodes = _mutations$i.addedNodes,
            removedNodes = _mutations$i.removedNodes;
        forEach.call(addedNodes, onConnect);
        forEach.call(removedNodes, onDisconnect);
      }
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });

  var onConnect = function onConnect(element) {
    if (element.querySelectorAll) {
      upgradeDance(element, false);
      connectOrDisconnect.call(connected, element);
      forEach.call(element.querySelectorAll(selectors), connectOrDisconnect, connected);
    }
  };

  var onDisconnect = function onDisconnect(element) {
    if (element.querySelectorAll) {
      connectOrDisconnect.call(disconnected, element);
      forEach.call(element.querySelectorAll(selectors), connectOrDisconnect, disconnected);
    }
  };

  var upgradeChildren = function upgradeChildren(child) {
    selectors.forEach(match, child);
  };

  var upgradeDance = function upgradeDance(element, dispatchConnected) {
    if (element.querySelectorAll) {
      selectors.forEach(match, element);
      var children = element.querySelectorAll(selectors);
      forEach.call(children, upgradeChildren);

      if (dispatchConnected && nodeContains.call(element.ownerDocument, element)) {
        connectOrDisconnect.call(connected, element);
        forEach.call(children, connectOrDisconnect, connected);
      }
    }
  };

  var waitDefined = function waitDefined(selector) {
    var resolve;
    var entry = {
      promise: new LIE(function ($) {
        return resolve = $;
      }),
      resolve: resolve
    };
    defined.set(selector, entry);
    return entry;
  };

  var define = function define(selector, definition) {
    if (get(selector)) throw new Error('duplicated ' + selector);
    var listeners = [];
    var retype = create(null);

    for (var k = keys(definition), i = 0, length = k.length; i < length; i++) {
      var listener = k[i];

      if (/^on/.test(listener) && !/Options$/.test(listener)) {
        var options = definition[listener + 'Options'] || false;
        var lower = listener.toLowerCase();
        var type = lower.slice(2);
        listeners.push({
          type: type,
          options: options
        });
        retype[type] = listener;

        if (lower !== listener) {
          type = listener.slice(2, 3).toLowerCase() + listener.slice(3);
          retype[type] = listener;
          listeners.push({
            type: type,
            options: options
          });
        }
      }
    }

    if (listeners.length) {
      definition.handleEvent = function (event) {
        this[retype[event.type]](event);
      };
    }

    if (definition.attributeChanged) {
      var observerDetails = {
        attributes: true,
        attributeOldValue: true
      };
      var observedAttributes = definition.observedAttributes;
      if ((observedAttributes || empty).length) observerDetails.attributeFilter = observedAttributes;
      definition.observerDetails = observerDetails;
    }

    selectors.push(selector);
    components.push({
      listeners: listeners,
      definition: definition,
      wm: new WeakMap()
    });
    upgrade(document.documentElement);
    if (!lazy.has(selector)) (defined.get(selector) || waitDefined(selector)).resolve();
  };
  var defineAsync = function defineAsync(selector, callback, _) {
    var i = selectors.length;
    lazy.add(selector);
    define(selector, {
      init: function init() {
        if (lazy.has(selector)) {
          lazy["delete"](selector);
          callback().then(function (_ref) {
            var definition = _ref["default"];
            selectors.splice(i, 1);
            components.splice(i, 1);

            (_ || define)(selector, definition);
          });
        }
      }
    });
  };
  var get = function get(selector) {
    var i = selectors.indexOf(selector);
    return i < 0 ? void 0 : components[i].definition;
  };
  var upgrade = function upgrade(element) {
    if (selectors.length) upgradeDance(element, true);
  };
  var whenDefined = function whenDefined(selector) {
    return (defined.get(selector) || waitDefined(selector)).promise;
  };

  function connectOrDisconnect(element) {
    $(element).forEach(onConnectedOrDisconnected, this);
  }

  function init(handler, listeners, wm) {
    for (var i = 0, length = listeners.length; i < length; i++) {
      var _listeners$i = listeners[i],
          type = _listeners$i.type,
          options = _listeners$i.options;
      this.addEventListener(type, handler, options);
    }

    var observerDetails = handler.observerDetails;
    if (observerDetails) attrObserver.observe(this, observerDetails);
    wm.set(this, true);
    wickedElements.set(this, $(this).concat(handler));
    if (handler.init) handler.init();
  }

  function match(selector, i) {
    if (elementMatches.call(this, selector)) {
      var _components$i = components[i],
          definition = _components$i.definition,
          listeners = _components$i.listeners,
          wm = _components$i.wm;
      if (!wm.has(this)) init.call(this, create(definition, _defineProperty({
        element: {
          enumerable: true,
          value: this
        }
      }, uid, {
        writable: true,
        value: ''
      })), listeners, wm);
    }
  }

  function onAttributeChanged(handler) {
    var observerDetails = handler.observerDetails;

    if (observerDetails) {
      var attributeName = this.attributeName,
          oldValue = this.oldValue,
          target = this.target;
      var attributeFilter = observerDetails.attributeFilter;
      if (!attributeFilter || -1 < attributeFilter.indexOf(attributeName)) handler.attributeChanged(attributeName, oldValue, target.getAttribute(attributeName));
    }
  }

  function onConnectedOrDisconnected(handler) {
    var method = handler[this];

    if (method && handler[uid] != this) {
      handler[uid] = this;
      method.call(handler);
    }
  }

  function init$1() {
    render(this);
  }

  var define$1 = function define$1(selector, definition) {
    return define(selector, typeof definition === 'function' ? {
      init: init$1,
      render: definition
    } : (definition.init || (definition.init = init$1), definition));
  };
  var defineAsync$1 = function defineAsync$1(selector, callback) {
    defineAsync(selector, callback, define$1);
  };
  var render = function render(wicked) {
    var disconnected = wicked.disconnected,
        element = wicked.element,
        render = wicked.render;
    var hook = augmentor(render.bind(wicked, element));

    wicked.disconnected = function () {
      if (hasEffect(hook)) dropEffect(hook);
      if (disconnected) disconnected.call(wicked);
    };

    return (wicked.render = hook)();
  };

  exports.createContext = createContext;
  exports.define = define$1;
  exports.defineAsync = defineAsync$1;
  exports.get = get;
  exports.render = render;
  exports.upgrade = upgrade;
  exports.useCallback = useCallback;
  exports.useContext = useContext;
  exports.useEffect = useEffect;
  exports.useLayoutEffect = useLayoutEffect;
  exports.useMemo = useMemo;
  exports.useReducer = useReducer;
  exports.useRef = useRef;
  exports.useState = useState;
  exports.whenDefined = whenDefined;

  return exports;

}({}));
