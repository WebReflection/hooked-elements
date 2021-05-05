var hookedElements = (function (exports) {
  'use strict';

  var Lie = typeof Promise === 'function' ? Promise : function (fn) {
    var queue = [],
        resolved = 0,
        value;
    fn(function ($) {
      value = $;
      resolved = 1;
      queue.splice(0).forEach(then);
    });
    return {
      then: then
    };

    function then(fn) {
      return resolved ? setTimeout(fn, 0, value) : queue.push(fn), this;
    }
  };

  var info = null,
      schedule = new Set();

  var invoke = function invoke(effect) {
    var $ = effect.$,
        r = effect.r,
        h = effect.h;

    if (isFunction(r)) {
      fx.get(h)["delete"](effect);
      r();
    }

    if (isFunction(effect.r = $())) fx.get(h).add(effect);
  };

  var runSchedule = function runSchedule() {
    var previous = schedule;
    schedule = new Set();
    previous.forEach(function (_ref) {
      var h = _ref.h,
          c = _ref.c,
          a = _ref.a,
          e = _ref.e;
      // avoid running schedules when the hook is
      // re-executed before such schedule happens
      if (e) h.apply(c, a);
    });
  };

  var fx = new WeakMap();
  var effects = [];
  var layoutEffects = [];
  function different(value, i) {
    return value !== this[i];
  }
  var dropEffect = function dropEffect(hook) {
    var effects = fx.get(hook);
    if (effects) wait.then(function () {
      effects.forEach(function (effect) {
        effect.r();
        effect.r = null;
      });
      effects.clear();
    });
  };
  var getInfo = function getInfo() {
    return info;
  };
  var hasEffect = function hasEffect(hook) {
    return fx.has(hook);
  };
  var isFunction = function isFunction(f) {
    return typeof f === 'function';
  };
  var hooked = function hooked(callback) {
    var current = {
      h: hook,
      c: null,
      a: null,
      e: 0,
      i: 0,
      s: []
    };
    return hook;

    function hook() {
      var prev = info;
      info = current;
      current.e = current.i = 0;

      try {
        return callback.apply(current.c = this, current.a = arguments);
      } finally {
        info = prev;
        if (effects.length) wait.then(effects.forEach.bind(effects.splice(0), invoke));
        if (layoutEffects.length) layoutEffects.splice(0).forEach(invoke);
      }
    }
  };
  var reschedule = function reschedule(info) {
    if (!schedule.has(info)) {
      info.e = 1;
      schedule.add(info);
      wait.then(runSchedule);
    }
  };
  var wait = new Lie(function ($) {
    return $();
  });

  var createContext = function createContext(value) {
    return {
      _: new Set(),
      provide: provide,
      value: value
    };
  };
  var useContext = function useContext(_ref) {
    var _ = _ref._,
        value = _ref.value;

    _.add(getInfo());

    return value;
  };

  function provide(newValue) {
    var _ = this._,
        value = this.value;

    if (value !== newValue) {
      this._ = new Set();
      this.value = newValue;

      _.forEach(function (_ref2) {
        var h = _ref2.h,
            c = _ref2.c,
            a = _ref2.a;
        h.apply(c, a);
      });
    }
  }

  var useCallback = function useCallback(fn, guards) {
    return useMemo(function () {
      return fn;
    }, guards);
  };
  var useMemo = function useMemo(memo, guards) {
    var info = getInfo();
    var i = info.i,
        s = info.s;
    if (i === s.length || !guards || guards.some(different, s[i]._)) s[i] = {
      $: memo(),
      _: guards
    };
    return s[info.i++].$;
  };

  var createEffect = function createEffect(stack) {
    return function (callback, guards) {
      var info = getInfo();
      var i = info.i,
          s = info.s,
          h = info.h;
      var call = i === s.length;
      info.i++;

      if (call) {
        if (!fx.has(h)) fx.set(h, new Set());
        s[i] = {
          $: callback,
          _: guards,
          r: null,
          h: h
        };
      }

      if (call || !guards || guards.some(different, s[i]._)) stack.push(s[i]);
      s[i].$ = callback;
      s[i]._ = guards;
    };
  };

  var useEffect = createEffect(effects);
  var useLayoutEffect = createEffect(layoutEffects);

  var getValue = function getValue(value, f) {
    return isFunction(f) ? f(value) : f;
  };

  var useReducer = function useReducer(reducer, value, init) {
    var info = getInfo();
    var i = info.i,
        s = info.s;
    if (i === s.length) s.push({
      $: isFunction(init) ? init(value) : getValue(void 0, value),
      set: function set(value) {
        s[i].$ = reducer(s[i].$, value);
        reschedule(info);
      }
    });
    var _s$info$i = s[info.i++],
        $ = _s$info$i.$,
        set = _s$info$i.set;
    return [$, set];
  };
  var useState = function useState(value) {
    return useReducer(getValue, value);
  };

  var useRef = function useRef(current) {
    var info = getInfo();
    var i = info.i,
        s = info.s;
    if (i === s.length) s.push({
      current: current
    });
    return s[info.i++];
  };

  var TRUE = true,
      FALSE = false;
  var QSA$1 = 'querySelectorAll';

  function add(node) {
    this.observe(node, {
      subtree: TRUE,
      childList: TRUE
    });
  }
  /**
   * Start observing a generic document or root element.
   * @param {Function} callback triggered per each dis/connected node
   * @param {Element?} root by default, the global document to observe
   * @param {Function?} MO by default, the global MutationObserver
   * @returns {MutationObserver}
   */


  var notify = function notify(callback, root, MO) {
    var loop = function loop(nodes, added, removed, connected, pass) {
      for (var i = 0, length = nodes.length; i < length; i++) {
        var node = nodes[i];

        if (pass || QSA$1 in node) {
          if (connected) {
            if (!added.has(node)) {
              added.add(node);
              removed["delete"](node);
              callback(node, connected);
            }
          } else if (!removed.has(node)) {
            removed.add(node);
            added["delete"](node);
            callback(node, connected);
          }

          if (!pass) loop(node[QSA$1]('*'), added, removed, connected, TRUE);
        }
      }
    };

    var observer = new (MO || MutationObserver)(function (records) {
      for (var added = new Set(), removed = new Set(), i = 0, length = records.length; i < length; i++) {
        var _records$i = records[i],
            addedNodes = _records$i.addedNodes,
            removedNodes = _records$i.removedNodes;
        loop(removedNodes, added, removed, FALSE, FALSE);
        loop(addedNodes, added, removed, TRUE, FALSE);
      }
    });
    observer.add = add;
    observer.add(root || document);
    return observer;
  };

  var QSA = 'querySelectorAll';
  var _self = self,
      document$1 = _self.document,
      Element = _self.Element,
      MutationObserver$1 = _self.MutationObserver,
      Set$1 = _self.Set,
      WeakMap$1 = _self.WeakMap;

  var elements = function elements(element) {
    return QSA in element;
  };

  var filter = [].filter;
  var QSAO = (function (options) {
    var live = new WeakMap$1();

    var drop = function drop(elements) {
      for (var i = 0, length = elements.length; i < length; i++) {
        live["delete"](elements[i]);
      }
    };

    var flush = function flush() {
      var records = observer.takeRecords();

      for (var i = 0, length = records.length; i < length; i++) {
        parse(filter.call(records[i].removedNodes, elements), false);
        parse(filter.call(records[i].addedNodes, elements), true);
      }
    };

    var matches = function matches(element) {
      return element.matches || element.webkitMatchesSelector || element.msMatchesSelector;
    };

    var notifier = function notifier(element, connected) {
      var selectors;

      if (connected) {
        for (var q, m = matches(element), i = 0, length = query.length; i < length; i++) {
          if (m.call(element, q = query[i])) {
            if (!live.has(element)) live.set(element, new Set$1());
            selectors = live.get(element);

            if (!selectors.has(q)) {
              selectors.add(q);
              options.handle(element, connected, q);
            }
          }
        }
      } else if (live.has(element)) {
        selectors = live.get(element);
        live["delete"](element);
        selectors.forEach(function (q) {
          options.handle(element, connected, q);
        });
      }
    };

    var parse = function parse(elements) {
      var connected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      for (var i = 0, length = elements.length; i < length; i++) {
        notifier(elements[i], connected);
      }
    };

    var query = options.query;
    var root = options.root || document$1;
    var observer = notify(notifier, root, MutationObserver$1);
    var attachShadow = Element.prototype.attachShadow;
    if (attachShadow) Element.prototype.attachShadow = function (init) {
      var shadowRoot = attachShadow.call(this, init);
      observer.add(shadowRoot);
      return shadowRoot;
    };
    if (query.length) parse(root[QSA](query));
    return {
      drop: drop,
      flush: flush,
      observer: observer,
      parse: parse
    };
  });

  var create = Object.create,
      keys = Object.keys;
  var attributes = new WeakMap();
  var lazy = new Set();
  var query = [];
  var config = {};
  var defined = {};

  var attributeChangedCallback = function attributeChangedCallback(records, o) {
    for (var h = attributes.get(o), i = 0, length = records.length; i < length; i++) {
      var _records$i = records[i],
          target = _records$i.target,
          attributeName = _records$i.attributeName,
          oldValue = _records$i.oldValue;
      var newValue = target.getAttribute(attributeName);
      h.attributeChanged(attributeName, oldValue, newValue);
    }
  };

  var set = function set(value, m, l, o) {
    var handler = create(o, {
      element: {
        enumerable: true,
        value: value
      }
    });

    for (var i = 0, length = l.length; i < length; i++) {
      value.addEventListener(l[i].t, handler, l[i].o);
    }

    m.set(value, handler);
    if (handler.init) handler.init();
    var observedAttributes = o.observedAttributes;

    if (observedAttributes) {
      var mo = new MutationObserver(attributeChangedCallback);
      mo.observe(value, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: observedAttributes.map(function (attributeName) {
          if (value.hasAttribute(attributeName)) handler.attributeChanged(attributeName, null, value.getAttribute(attributeName));
          return attributeName;
        })
      });
      attributes.set(mo, handler);
    }

    return handler;
  };

  var _QSAO = QSAO({
    query: query,
    handle: function handle(element, connected, selector) {
      var _config$selector = config[selector],
          m = _config$selector.m,
          l = _config$selector.l,
          o = _config$selector.o;
      var handler = m.get(element) || set(element, m, l, o);
      var method = connected ? 'connected' : 'disconnected';
      if (method in handler) handler[method]();
    }
  }),
      drop = _QSAO.drop,
      flush = _QSAO.flush,
      parse = _QSAO.parse;

  var get = function get(selector) {
    return (config[selector] || attributes).o;
  };
  var define$1 = function define(selector, definition) {
    if (-1 < query.indexOf(selector)) throw new Error('duplicated: ' + selector);
    flush();
    var listeners = [];
    var retype = create(null);

    for (var k = keys(definition), i = 0, length = k.length; i < length; i++) {
      var key = k[i];

      if (/^on/.test(key) && !/Options$/.test(key)) {
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
    config[selector] = {
      m: new WeakMap(),
      l: listeners,
      o: definition
    };
    parse(document.querySelectorAll(selector));
    whenDefined(selector);
    if (!lazy.has(selector)) defined[selector]._();
  };
  var defineAsync$1 = function defineAsync(selector, callback, _) {
    lazy.add(selector);
    define$1(selector, {
      init: function init() {
        if (lazy.has(selector)) {
          lazy["delete"](selector);
          callback().then(function (_ref) {
            var definition = _ref["default"];
            query.splice(query.indexOf(selector), 1);
            drop(document.querySelectorAll(selector));

            (_ || define$1)(selector, definition);
          });
        }
      }
    });
  };
  var upgrade = function upgrade(element) {
    if (query.length) {
      flush();
      parse([element]);
    }
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
  };

  function init() {
    render(this);
  }

  var define = function define(selector, definition) {
    define$1(selector, typeof definition === 'function' ? {
      init: init,
      render: definition
    } : (definition.init || (definition.init = init), definition));
  };
  var defineAsync = function defineAsync(selector, callback) {
    defineAsync$1(selector, callback, define);
  };
  var render = function render(wicked) {
    var disconnected = wicked.disconnected,
        element = wicked.element,
        render = wicked.render;
    var hook = hooked(render.bind(wicked, element));

    wicked.disconnected = function () {
      if (hasEffect(hook)) dropEffect(hook);
      if (disconnected) disconnected.call(wicked);
    };

    return (wicked.render = hook)();
  };

  exports.createContext = createContext;
  exports.define = define;
  exports.defineAsync = defineAsync;
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
