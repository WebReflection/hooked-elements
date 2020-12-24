# hookedElements 🪝

<sup>**Social Media Photo by [chuttersnap](https://unsplash.com/@chuttersnap) on [Unsplash](https://unsplash.com/)**</sup>

### 📣 Community Announcement

Please ask questions in the [dedicated forum](https://webreflection.boards.net/) to help the community around this project grow ♥

---

This module integrates [µhooks](https://github.com/WebReflection/uhooks#readme) in [wickedElements](https://github.com/WebReflection/wicked-elements#readme) for a *~2K* all-inclusive package and zero polyfills needed whatsoever.

The compatibility is the same as _wickedElements_, meaning IE11+ and other Desktop/Mobile browsers.

**[Live Demo](https://codepen.io/WebReflection/pen/JjdGjOM)**

```js
// define via callback to receives the element right away
import {define, useState} from 'hooked-elements';

define('button.counter', element => {
  const [count, update] = useState(0);
  element.onclick = () => update(count + 1);
  element.textContent = `${count} clicks`;
});
```

The callback is used as `render` method and automatically augmented and invoked as soon as the element becomes _wicked_.


### In A Nutshell

All [hooks](https://github.com/WebReflection/augmentor#available-hooks) are available, and `useEffect` is granted to run *before* `disconnected`, if it returns a callback to drop the effect.

**[Live Demo](https://codepen.io/WebReflection/pen/mdJVERz)**

```js
// define via wickedElements literal, render auto-augmented
import {define, render, useEffect, useState} from 'hooked-elements';

define('button.counter', {
  // if not provided, the init() is automatically defined as such:
  init() {
    // the render augment the current render method once
    // and invokes it right away for the first time
    // the element gets upgraded as "wicked"
    render(this);
  },
  // all other wickedElements goodies are in too,
  // and if there is an effect that returns a callback,
  // that will always be invoked before `disconnected`
  disconnected() {
    console.log(this.element, 'disconnected');
  },
  // the render also receives an element, but you can always
  // retrieve it via `const {element} = this;`
  // please note the element is bound, so that any
  // `this.render()` call will always automatically pass
  // the component element too.
  render(element) {
    useEffect(() => {
      console.log('FX on');
      return () => console.log('FX off');
    });
    const [count, update] = useState(0);
    element.onclick = () => update(count + 1);
    element.textContent = `${count} clicks`;
  }
});
```


## F.A.Q.

<details>
  <summary>
    <strong>Can I use 3rd parts libraries to render content?</strong>
  </summary>
  <div>

  Sure thing! Following a <a href="https://github.com/WebReflection/uhtml#readme">µhtml</a> integration example, also <a href="https://codepen.io/WebReflection/pen/qBdOzWj?editors=0010">live in CodePen</a>:

**[Live Demo](https://codepen.io/WebReflection/pen/poJyjGy)**

```js
import {render, html, svg} from 'uhtml';
import {define, useState} from 'hooked-elements';

// as mixin
const MicroHTML = {
  html() { return render(this.element, html.apply(null, arguments)); },
  svg() { return render(this.element, svg.apply(null, arguments)); }
};

define('button.counter', {
  ...MicroHTML,
  render(element) {
    const [count, update] = useState(1);
    element.onclick = () => update(count + 1);
    this.html`Hello 👋 <strong>${count}</strong> times!`;
  }
});

// or straight forward via callback and explicit render
define('my-counter', element => {
  const [count, update] = useState(0);
  render(element, html`
    <button class="large btn" onclick=${() => update(count - 1)}>-</button>
    <span class="large value">${count}</span>
    <button class="large btn" onclick=${() => update(count + 1)}>+</button>
  `);
});
```
  </div>
</details>

<details>
  <summary>
    <strong>How can I use hooks outside the <code>render()</code>?</strong>
  </summary>
  <div>

  While the `render()` is the only augmented callback, as hooks changes are usually reflected through the UI, you can compose hooks outside the `render` method, or assign their state without any issue within such method.

**[Live Demo](https://codepen.io/WebReflection/pen/JjdGKmL)**

```js
// define via wickedElements literal, render auto-augmented
import {define, useState} from 'hooked-elements';

define('button.counter', {
  render(element) {
    // assign the current counter state
    this.countState = useState(0);

    // use only what you need in here
    const [count] = this.countState;
    element.textContent = `${count} clicks`;
  },

  // handle clicks through such state
  onClick() {
    const [count, update] = this.countState;
    update(count + 1);
  }
});
```

  Simply remember that a wicked component is unreachable, unless exposed otherwise, so that it's always safe to assign at runtime any property to it (it's just an object literal, after all 😉).

  </div>
</details>

