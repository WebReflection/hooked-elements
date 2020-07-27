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

  var asCustomElement = (function (root, upgrade) {
    var wm = new WeakMap();
    var ao = new WeakMap();
    var filter = [].filter;

    var attributeChanged = function attributeChanged(records, mo) {
      for (var i = 0, length = records.length; i < length; i++) {
        var _records$i = records[i],
            target = _records$i.target,
            attributeName = _records$i.attributeName,
            oldValue = _records$i.oldValue;
        var newValue = target.getAttribute(attributeName);
        ao.get(mo).call(target, attributeName, oldValue, newValue);
      }
    };

    var elements = function elements(target) {
      return 'querySelectorAll' in target;
    };

    var mainLoop = function mainLoop(records) {
      for (var i = 0, length = records.length; i < length; i++) {
        var _records$i2 = records[i],
            addedNodes = _records$i2.addedNodes,
            removedNodes = _records$i2.removedNodes;
        parse(filter.call(addedNodes, elements), 'c', new Set());
        parse(filter.call(removedNodes, elements), 'd', new Set());
      }
    };

    var parse = function parse(nodes, key, parsed) {
      for (var i = 0, length = nodes.length; i < length; i++) {
        var target = nodes[i];

        if (!parsed.has(target)) {
          parsed.add(target);
          if (wm.has(target)) wm.get(target)[key].forEach(call, target);else if (key === 'c') upgrade(target);
          parse(target.querySelectorAll('*'), key, parsed);
        }
      }
    };

    var set = function set(target) {
      var sets = {
        c: new Set(),
        d: new Set()
      };
      wm.set(target, sets);
      return sets;
    };

    var sdo = new MutationObserver(mainLoop);
    sdo.observe(root, {
      childList: true,
      subtree: true
    });
    return function (target, _ref) {
      var connectedCallback = _ref.connectedCallback,
          disconnectedCallback = _ref.disconnectedCallback,
          observedAttributes = _ref.observedAttributes,
          attributeChangedCallback = _ref.attributeChangedCallback;
      mainLoop(sdo.takeRecords());

      var _ref2 = wm.get(target) || set(target),
          c = _ref2.c,
          d = _ref2.d;

      if (observedAttributes) {
        var mo = new MutationObserver(attributeChanged);
        mo.observe(target, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: observedAttributes.map(function (attributeName) {
            if (target.hasAttribute(attributeName)) attributeChangedCallback.call(target, attributeName, null, target.getAttribute(attributeName));
            return attributeName;
          })
        });
        ao.set(mo, attributeChangedCallback);
      }

      if (disconnectedCallback) d.add(disconnectedCallback);

      if (connectedCallback) {
        c.add(connectedCallback);
        if (!(target.ownerDocument.compareDocumentPosition(target) & target.DOCUMENT_POSITION_DISCONNECTED)) connectedCallback.call(target);
      }

      return target;
    };
  });

  function call(back) {
    back.call(this);
  }

  var Lie = typeof Promise === 'function' ? Promise : function (fn) {
    var queue = [],
        resolved = 0;
    fn(function () {
      resolved = 1;
      queue.splice(0).forEach(then);
    });
    return {
      then: then
    };

    function then(fn) {
      return resolved ? setTimeout(fn) : queue.push(fn), this;
    }
  };
  var utils = (function (root, query, config, defined, setup) {
    // exports
    var get = function get(selector) {
      var i = query.indexOf(selector);
      return i < 0 ? void 0 : config[i].o;
    };

    var upgrade = function upgrade(node) {
      upgradeNode(node, new Set());
    };

    var whenDefined = function whenDefined(selector) {
      if (!(selector in defined)) {
        var _,
            $ = new Lie(function ($) {
          _ = $;
        });

        defined[selector] = {
          _: _,
          $: $
        };
      }

      return defined[selector].$;
    }; // util


    var setupList = function setupList(nodes, parsed) {
      for (var i = 0, length = nodes.length; i < length; i++) {
        if (!parsed.has(nodes[i])) {
          parsed.add(nodes[i]);
          upgradeNode(nodes[i], parsed);
        }
      }
    };

    var upgradeAll = function upgradeAll(node, parsed) {
      if (query.length) setupList(node.querySelectorAll(query), parsed);
    };

    var upgradeNode = function upgradeNode(node, parsed) {
      for (var i = 0, length = query.length; i < length; i++) {
        if ((node.matches || node.webkitMatchesSelector || node.msMatchesSelector).call(node, query[i])) setup(node, config[i]);
      }

      if (parsed) upgradeAll(node, parsed);
    };

    return {
      get: get,
      upgrade: upgrade,
      whenDefined: whenDefined,
      $: setupList,
      _: asCustomElement(root, upgradeNode)
    };
  });

  var create = Object.create,
      keys = Object.keys;
  var config = [];
  var query = [];
  var defined = {};
  var lazy = new Set();
  var wicked = new WeakMap();
  var callbacks = new WeakMap();

  var _utils = utils(document, query, config, defined, function (value, _ref) {
    var m = _ref.m,
        l = _ref.l,
        o = _ref.o;

    if (!m.has(value)) {
      var handler = create(o, {
        element: {
          enumerable: true,
          value: value
        }
      });
      m.set(value, 0);
      if (!wicked.has(value)) wicked.set(value, []);
      wicked.get(value).push(handler);

      for (var i = 0, length = l.length; i < length; i++) {
        value.addEventListener(l[i].t, handler, l[i].o);
      }

      if (handler.init) handler.init();
      asCustomElement$1(value, o);
    }
  }),
      get = _utils.get,
      upgrade = _utils.upgrade,
      whenDefined = _utils.whenDefined,
      setupList = _utils.$,
      asCustomElement$1 = _utils._;

  var delegate = function delegate(key, method, notAC) {
    return function (name) {
      for (var h = wicked.get(this), i = 0, length = h.length; i < length; i++) {
        if (method === h[i][key] && (notAC || -1 < (h[i].observedAttributes || []).indexOf(name))) method.apply(h[i], arguments);
      }
    };
  };

  var define = function define(selector, definition) {
    if (get(selector)) throw new Error('duplicated: ' + selector);
    var listeners = [];
    var retype = create(null);

    for (var k = keys(definition), i = 0, length = k.length; i < length; i++) {
      var key = k[i];

      if (/^(?:connected|disconnected|attributeChanged)$/.test(key)) {
        if (!callbacks.has(definition[key])) callbacks.set(definition[key], delegate(key, definition[key], key[0] !== 'a'));
        definition[key + 'Callback'] = callbacks.get(definition[key]);
      } else if (/^on/.test(key) && !/Options$/.test(key)) {
        var options = definition[key + 'Options'] || false;
        var lower = key.toLowerCase();
        var type = lower.slice(2);
        listeners.push({
          t: type,
          o: options
        });
        retype[type] = key;

        if (lower !== key) {
          type = key.slice(2, 3).toLowerCase() + key.slice(3);
          retype[type] = key;
          listeners.push({
            t: type,
            o: options
          });
        }
      }
    }

    if (listeners.length) {
      definition.handleEvent = function (event) {
        this[retype[event.type]](event);
      };
    }

    query.push(selector);
    config.push({
      m: new WeakMap(),
      l: listeners,
      o: definition
    });
    setupList(document.querySelectorAll(selector), new Set());
    whenDefined(selector);
    if (!lazy.has(selector)) defined[selector]._();
  };
  var defineAsync = function defineAsync(selector, callback, _) {
    lazy.add(selector);
    define(selector, {
      init: function init() {
        if (lazy.has(selector)) {
          lazy["delete"](selector);
          callback().then(function (_ref2) {
            var definition = _ref2["default"];
            var i = query.indexOf(selector);
            query.splice(i, 1);
            config.splice(i, 1);

            (_ || define)(selector, definition);
          });
        }
      }
    });
  };

  function init() {
    render(this);
  }

  var define$1 = function define$1(selector, definition) {
    define(selector, typeof definition === 'function' ? {
      init: init,
      render: definition
    } : (definition.init || (definition.init = init), definition));
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
