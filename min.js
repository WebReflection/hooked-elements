var hookedElements=function(e){"use strict";var n="function"==typeof cancelAnimationFrame,s=n?cancelAnimationFrame:clearTimeout,f=n?requestAnimationFrame:setTimeout;function g(e){var r,o,i,u,a;return t(),function(e,t,n){return i=e,u=t,a=n,o=o||f(c),--r<0&&l(!0),l};function c(){t(),i.apply(u,a||[])}function t(){r=e||1/0,o=n?0:null}function l(e){var t=!!o;return t&&(s(o),e&&c()),t}}function t(n){return{get:function(e){return n.get(e)},set:function(e,t){return n.set(e,t),t}}}function p(e,t,n){e.apply(t,n)}function d(e,t){return"function"==typeof t?t(e):t}function r(n,e,t,r){var o=m.i++,i=m.hook,u=m.args,a=m.stack,c=m.length;o===c&&(m.length=a.push({}));var l,s,f,h,v=a[o];return v.args=u,o===c&&(f=(s=((l="function"==typeof t)?r:t)||r||y).async,h=s.always,v.$=l?t(e):d(void 0,e),v._=f?b.get(i)||b.set(i,g()):p,v.f=function(e){var t=n(v.$,e);!h&&v.$===t||(v.$=t,v._(i,null,v.args))}),[v.$,v.f]}function o(e){var t=e.hook,n=e.args;t.apply(null,n)}var m=null,b=t(new WeakMap),y={async:!1,always:!1},i=new WeakMap;
/*! (c) Andrea Giammarchi - ISC */function u(e){this.value!==e&&(this.value=e,i.get(this).forEach(o))}function a(e){return e.hook===this.hook}function k(){}function c(d){return function(e,t){var n,r,o,i,u,a,c,l,s,f=m.i++,h=m.hook,v=m.after,p=m.stack;f<m.length?(r=(n=p[f]).update,o=n.values,i=n.stop,t&&!t.some(S,o)||(n.values=t,d&&i(d),(u=n.clean)&&(n.clean=null,u()),a=function(){n.clean=e()},d?r(a):v.push(a))):(c=d?g():k,l={clean:null,update:c,values:t,stop:k},m.length=p.push(l),(w.get(h)||w.set(h,[])).push(l),s=function(){l.clean=e()},d?l.stop=c(s):v.push(s))}}function l(e,t){var n=m.i++,r=m.stack;return n===m.length?m.length=r.push({$:e(),_:t}):t&&!t.some(S,r[n]._)||(r[n]={$:e(),_:t}),r[n].$}var h=new WeakMap,w=t(h),v=h.has.bind(h),E=c(!0),M=c(!1);function S(e,t){return e!==this[t]}
/*! (c) Andrea Giammarchi - ISC */
var O,A=(O=[].indexOf,"matches"in document.documentElement?function(e){return this.matches(e)}:function(e){var t=this;return(t.matchesSelector||t.webkitMatchesSelector||t.khtmlMatchesSelector||t.mozMatchesSelector||t.msMatchesSelector||t.oMatchesSelector||function(e){var t=this.parentNode;return!!t&&-1<O.call(t.querySelectorAll(e),this)}).call(t,e)}),C=Node.prototype.contains||function(e){return!!(e.compareDocumentPosition(this)&e.DOCUMENT_POSITION_CONTAINS)},N="undefined"==typeof Promise?function(e){var t=[],n=!1;return e(function(){n=!0,t.splice(0).forEach(r)}),{then:r,catch:function(){}};function r(e){return n?setTimeout(e):t.push(e),this}}:Promise,$=Object.create,q=Object.keys,_=new WeakMap,D=new Map,T="_"+Math.random(),x="connected",F="dis"+x,L=[],P=[],W=[],j=W.forEach,I=function(e){return _.get(e)||W},R=new MutationObserver(function(e){for(var t=0,n=e.length;t<n;t++)I(e[t].target).forEach(X,e[t])});
/*! (c) Andrea Giammarchi - ISC */new MutationObserver(function(e){if(L.length)for(var t=0,n=e.length;t<n;t++){var r=e[t],o=r.addedNodes,i=r.removedNodes;j.call(o,U),j.call(i,B)}}).observe(document,{childList:!0,subtree:!0});function V(e){L.forEach(Q,e)}function z(e){var t,n={promise:new N(function(e){return t=e}),resolve:t};return D.set(e,n),n}var U=function(e){e.querySelectorAll&&(G(e,!1),K.call(x,e),j.call(e.querySelectorAll(L),K,x))},B=function(e){e.querySelectorAll&&(K.call(F,e),j.call(e.querySelectorAll(L),K,F))},G=function(e,t){var n;e.querySelectorAll&&(L.forEach(Q,e),n=e.querySelectorAll(L),j.call(n,V),t&&C.call(e.ownerDocument,e)&&(K.call(x,e),j.call(n,K,x)))},H=function(e){var t=L.indexOf(e);return t<0?void 0:P[t].definition},J=function(e){L.length&&G(e,!0)};function K(e){I(e).forEach(Y,this)}function Q(e,t){var n,r,o,i,u,a,c;A.call(this,e)&&(r=(n=P[t]).definition,o=n.listeners,(i=n.wm).has(this)||function(e,t,n){for(var r=0,o=t.length;r<o;r++){var i=t[r],u=i.type,a=i.options;this.addEventListener(u,e,a)}var c=e.observerDetails;c&&R.observe(this,c),n.set(this,!0),_.set(this,I(this).concat(e)),e.init&&e.init()}.call(this,$(r,(c={writable:!0,value:""},(a=T)in(u={element:{enumerable:!0,value:this}})?Object.defineProperty(u,a,{value:c,enumerable:!0,configurable:!0,writable:!0}):u[a]=c,u)),o,i))}function X(e){var t,n,r,o,i=e.observerDetails;i&&(t=this.attributeName,n=this.oldValue,r=this.target,(!(o=i.attributeFilter)||-1<o.indexOf(t))&&e.attributeChanged(t,n,r.getAttribute(t)))}function Y(e){var t=e[this];t&&e[T]!=this&&(e[T]=this,t.call(e))}function Z(){ee(this)}var ee=function(t){var i,u,n=t.disconnected,e=t.element,r=t.render,o=(i=r.bind(t,e),u=[],function e(){var t=m,n=[];m={hook:e,args:arguments,stack:u,i:0,length:u.length,after:n};try{return i.apply(null,arguments)}finally{m=t;for(var r=0,o=n.length;r<o;r++)n[r]()}});return t.disconnected=function(){var e;v(o)&&(e=o,(h.get(e)||[]).forEach(function(e){var t=e.clean;(0,e.stop)(),t&&(e.clean=null,t())})),n&&n.call(t)},(t.render=o)()};return e.createContext=function(e){var t={value:e,provide:u};return i.set(t,[]),t},e.define=function(e,t){return function(e,t){if(H(e))throw new Error("duplicated "+e);for(var n,r,o=[],i=$(null),u=q(t),a=0,c=u.length;a<c;a++){var l,s,f,h=u[a];/^on/.test(h)&&!/Options$/.test(h)&&(l=t[h+"Options"]||!1,f=(s=h.toLowerCase()).slice(2),o.push({type:f,options:l}),s!==(i[f]=h)&&(f=h.slice(2,3).toLowerCase()+h.slice(3),i[f]=h,o.push({type:f,options:l})))}o.length&&(t.handleEvent=function(e){this[i[e.type]](e)}),t.attributeChanged&&(n={attributes:!0,attributeOldValue:!0},((r=t.observedAttributes)||W).length&&(n.attributeFilter=r),t.observerDetails=n),L.push(e),P.push({listeners:o,definition:t,wm:new WeakMap}),J(document.documentElement),(D.get(e)||z(e)).resolve()}(e,"function"==typeof t?{init:Z,render:t}:(t.init||(t.init=Z),t))},e.get=H,e.render=ee,e.upgrade=J,e.useCallback=function(e,t){return l(function(){return e},t)},e.useContext=function(e){var t=m.hook,n=m.args,r=i.get(e),o={hook:t,args:n};return r.some(a,o)||r.push(o),e.value},e.useEffect=E,e.useLayoutEffect=M,e.useMemo=l,e.useReducer=r,e.useRef=function(e){var t=m.i++,n=m.stack;return t===m.length&&(m.length=n.push({current:e})),n[t]},e.useState=function(e,t){return r(d,e,void 0,t)},e.whenDefined=function(e){return(D.get(e)||z(e)).promise},e}({});