interface IHookedElementsComponent {
  /**
   * Always triggered once per node => definition, like a `constructor`.
   * Ideal to setup anything as a one off operation.
   * `this.element` will point at the node handled by this instance.
   * If not provided it will default to:
   * `function init() { render(this); }`
   * The `render(component)` is exported, to enable a custom `init()`.
   */
  init?(): void;

  /**
   * Triggered once the node is live.
   */
  connected?(): void;

  /**
   * Triggered once the node is lost/removed.
   * If `useEffect` was used, and returned a callback.
   * this will always trigger *after* that callback.
   */
  disconnected?(): void;

  /**
   * Triggered when an attribute in the `observedAttributes` list changes or,
   * if `observedAttributes` is not defined, for any attribute changes. 
   */
  attributeChanged?(
    attributeName: string,
    newValue: string | null,
    oldValue: string | null
  ): void;

  /**
   * Optionally you can specify one or more attribute to observe.
   * If empty, or not provided, but `attributeChanged()` method exists,
   * all attributes changes are notified.
   */
  observedAttributes?: Array<string>;

  /**
   * A method to define rendering logic, automatically
   * augmented for hooks such as `useState` and others.
   * The `element` is bound and passed along each time.
   * It's the exact same `element` retrieved via `this.element`.
   */
  render(element: Element): any

  /**
   * Any event can be defined as method.
   * Example: `onClick` or `onCustomEvent`.
   */
  onEventName?(event: Event): void;

  /**
   * Ane event could optionally have `Options` used as third argument,
   * when the event is added via `addEventListener`: `false` by default.
   */
  onEventNameOptions?: boolean | object;

  /**
   * Any property, method, or accessor, reflected via prototypal inheritance.
   */
  [k: string]: any;
}

declare const hookedElements: {
  /**
   * Defines a hooked component via a selector and a literal,
   * with a `render()` method, or a function, used as `render()`.
   * The function will receive the `element` as bound argument.
   * 
   * @example
   * define(selector, element => {} || {
   *   init() { this.element; },
   *   connected() {},
   *   disconnected() {},
   *   attributeChanged(name, newValue, oldValue) {},
   *   observedAttributes: [],
   *   onEventName(event) {},
   *   onEventNameOptions: false
   * });
   */
  define(
    selector: string,
    component: Function | IHookedElementsComponent
  ): void;

  /**
   * Retrieves a hooked element definition.
   */
  get(selector: string): void | IHookedElementsComponent;

  /**
   * Force/upgrade a specific node, if it matches any defined selector.
   */
  upgrade(element: Element): void;

  /**
   * Resolves once a specific selector gets defined.
   */
  whenDefined(selector: string): Promise<void>;

  /**
   * Similar to React `useState` with an extra `options` parameter,
   * to define if the change should be triggered `async`,
   * which is `false` by default, or `always`, also false by default,
   * meaning changes with same value won't trigger a `render()`.
   * @see https://reactjs.org/docs/hooks-reference.html#usestate
   */
  useState(
    initialValue: any,
    options?: {async?: boolean, always?: boolean}
  ): [any, Function];

  /**
   * Similar to React `useEffect`, and if the effect returned a callback,
   * it will be triggered eventually *before* `disconnected()` method, if any.
   * @see https://reactjs.org/docs/hooks-reference.html#useeffect
   */
  useEffect(didUpdate: Function): void;

  /**
   * Similar to React `useLayoutEffect`.
   * @see https://reactjs.org/docs/hooks-reference.html#uselayouteffect
   */
  useLayoutEffect(didUpdate: Function): void;

  /**
   * Similar to React `useContext`, accepts a `Context` object.
   * @see https://reactjs.org/docs/hooks-reference.html#usecontext
   */
  useContext(Context: object): any;

  /**
   * Similar to `React.createContext`. Returns a `Context` object.
   * @see https://reactjs.org/docs/hooks-reference.html#usecontext
   */
  createContext(object: object): object;

  /**
   * Similar to React `useReducer`, returns the current `state`
   * paired with a `dispatch` method.
   * @see https://reactjs.org/docs/hooks-reference.html#usereducer
   */
  useReducer(
    reducer: Function,
    initialState: any,
    init?: Function
  ): [any, Function];

  /**
   * Similar to React `useCallback`, returns a `memoized` callback.
   * @see https://reactjs.org/docs/hooks-reference.html#usecallback
   */
  useCallback(
    fn: Function,
    deps: any[]
  ): Function;

  /**
   * Similar to React `useMemo`, returns a `memoized` value.
   * @see https://reactjs.org/docs/hooks-reference.html#usememo
   */
  useMemo(
    fn: Function,
    deps: any[]
  ): any;

  /**
   * Similar to React `useRef`, returns a `{current: value}` object.
   * @see https://reactjs.org/docs/hooks-reference.html#useref
   */
  useRef(
    initialValue?: any
  ): {current: any};
};

export = hookedElements;
