var hookedElements=function(e){"use strict";var n="function"==typeof cancelAnimationFrame,s=n?cancelAnimationFrame:clearTimeout,f=n?requestAnimationFrame:setTimeout;function y(e){var r,i,o,a,u;return t(),function(e,t,n){return o=e,a=t,u=n,i=i||f(c),--r<0&&l(!0),l};function c(){t(),o.apply(a,u||[])}function t(){r=e||1/0,i=n?0:null}function l(e){var t=!!i;return t&&(s(i),e&&c()),t}}
/*! (c) Andrea Giammarchi - ISC */function v(e,t,n){e.apply(t,n)}function a(e,t){var n,r,i=b.i++,o=b.hook,a=b.args,u=b.stack,c=b.length,l=t||d,s=l.async,f=l.always;i===c&&(b.length=u.push({$:"function"==typeof e?e():e,_:s?p.get(o)||(n=o,r=y(),p.set(n,r),r):v}));var h=u[i];return[h.$,function(e){var t="function"==typeof e?e(h.$):e;!f&&h.$===t||(h.$=t,h._(o,null,a))}]}function t(e){var t=e.hook,n=e.args;t.apply(null,n)}var b=null,p=new WeakMap,d={async:!1,always:!1},o=new WeakMap;function r(e){this.value!==e&&(this.value=e,o.get(this).forEach(t))}function u(e){return e.hook===this.hook}function k(){}function i(g){return function(e,t){var n,r,i=b.i++,o=b.hook,a=b.after,u=b.stack;if(i<b.length){var c=u[i],l=c.update,s=c.values,f=c.stop;if(!t||t.some(E,s)){c.values=t,g&&f(g);var h=c.clean;h&&(c.clean=null,h());var v=function(){c.clean=e()};g?l(v):a.push(v)}}else{var p=g?y():k,d={clean:null,update:p,values:t,stop:k};b.length=u.push(d),(w.get(o)||(n=o,r=[],w.set(n,r),r)).push(d);var m=function(){d.clean=e()};g?d.stop=p(m):a.push(m)}}}function c(e,t){var n=b.i++,r=b.stack;return n===b.length?b.length=r.push({$:e(),_:t}):t&&!t.some(E,r[n]._)||(r[n]={$:e(),_:t}),r[n].$}var w=new WeakMap,l=w.has.bind(w),h=i(!0),m=i(!1);function E(e,t){return e!==this[t]}
/*! (c) Andrea Giammarchi - ISC */
var g,M=(g=[].indexOf,"matches"in document.documentElement?function(e){return this.matches(e)}:function(e){var t=this;return(t.matchesSelector||t.webkitMatchesSelector||t.khtmlMatchesSelector||t.mozMatchesSelector||t.msMatchesSelector||t.oMatchesSelector||function(e){var t=this.parentNode;return!!t&&-1<g.call(t.querySelectorAll(e),this)}).call(t,e)}),S=Node.prototype.contains||function(e){return!!(e.compareDocumentPosition(this)&e.DOCUMENT_POSITION_CONTAINS)},O="undefined"==typeof Promise?function(e){var t=[],n=!1;return e(function(){n=!0,t.splice(0).forEach(r)}),{then:r,catch:function(){}};function r(e){return n?setTimeout(e):t.push(e),this}}:Promise,A=Object.create,C=Object.keys,N=new WeakMap,q=new Map,$="_"+Math.random(),_="connected",D="dis"+_,T=[],x=[],F=[],L=F.forEach,P=function(e){return N.get(e)||F},W=new MutationObserver(function(e){for(var t=0,n=e.length;t<n;t++)P(e[t].target).forEach(J,e[t])});
/*! (c) Andrea Giammarchi - ISC */new MutationObserver(function(e){if(T.length)for(var t=0,n=e.length;t<n;t++){var r=e[t],i=r.addedNodes,o=r.removedNodes;L.call(i,R),L.call(o,V)}}).observe(document,{childList:!0,subtree:!0});function j(e){T.forEach(H,e)}function I(e){var t,n={promise:new O(function(e){return t=e}),resolve:t};return q.set(e,n),n}var R=function(e){e.querySelectorAll&&(z(e,!1),G.call(_,e),L.call(e.querySelectorAll(T),G,_))},V=function(e){e.querySelectorAll&&(G.call(D,e),L.call(e.querySelectorAll(T),G,D))},z=function(e,t){if(e.querySelectorAll){T.forEach(H,e);var n=e.querySelectorAll(T);L.call(n,j),t&&S.call(e.ownerDocument,e)&&(G.call(_,e),L.call(n,G,_))}},U=function(e){var t=T.indexOf(e);return t<0?void 0:x[t].definition},B=function(e){T.length&&z(e,!0)};function G(e){P(e).forEach(K,this)}function H(e,t){if(M.call(this,e)){var n=x[t],r=n.definition,i=n.listeners,o=n.wm;o.has(this)||function(e,t,n){for(var r=0,i=t.length;r<i;r++){var o=t[r],a=o.type,u=o.options;this.addEventListener(a,e,u)}var c=e.observerDetails;c&&W.observe(this,c),n.set(this,!0),N.set(this,P(this).concat(e)),e.init&&e.init()}.call(this,A(r,(c={writable:!0,value:""},(u=$)in(a={element:{enumerable:!0,value:this}})?Object.defineProperty(a,u,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[u]=c,a)),i,o)}var a,u,c}function J(e){var t=e.observerDetails;if(t){var n=this.attributeName,r=this.oldValue,i=this.target,o=t.attributeFilter;(!o||-1<o.indexOf(n))&&e.attributeChanged(n,i.getAttribute(n),r)}}function K(e){var t=e[this];t&&e[$]!=this&&(e[$]=this,t.call(e))}function Q(){X(this)}var X=function(t){var o,a,n=t.disconnected,e=t.element,r=t.render,i=(o=r.bind(t,e),a=[],function e(){var t=b,n=[];b={hook:e,args:arguments,stack:a,i:0,length:a.length,after:n};try{return o.apply(null,arguments)}finally{b=t;for(var r=0,i=n.length;r<i;r++)n[r]()}});return t.disconnected=function(){var e;l(i)&&(e=i,(w.get(e)||[]).forEach(function(e){var t=e.clean;(0,e.stop)(),t&&(e.clean=null,t())})),n&&n.call(t)},(t.render=i)()};return e.createContext=function(e){var t={value:e,provide:r};return o.set(t,[]),t},e.define=function(e,t){return function(e,t){if(U(e))throw new Error("duplicated "+e);for(var n=[],r=A(null),i=C(t),o=0,a=i.length;o<a;o++){var u=i[o];if(/^on/.test(u)){var c=t[u+"Options"]||!1,l=u.toLowerCase(),s=l.slice(2);n.push({type:s,options:c}),l!==(r[s]=u)&&(s=u.slice(2,3).toLowerCase()+u.slice(3),r[s]=u,n.push({type:s,options:c}))}}if(n.length&&(t.handleEvent=function(e){this[r[e.type]](e)}),t.attributeChanged){var f={attributes:!0,attributeOldValue:!0},h=t.observedAttributes;(h||F).length&&(f.attributeFilter=h),t.observerDetails=f}T.push(e),x.push({listeners:n,definition:t,wm:new WeakMap}),B(document.documentElement),(q.get(e)||I(e)).resolve()}(e,"function"==typeof t?{init:Q,render:t}:(t.init||(t.init=Q),t))},e.get=U,e.render=X,e.upgrade=B,e.useCallback=function(e,t){return c(function(){return e},t)},e.useContext=function(e){var t=b.hook,n=b.args,r=o.get(e),i={hook:t,args:n};return r.some(u,i)||r.push(i),e.value},e.useEffect=h,e.useLayoutEffect=m,e.useMemo=c,e.useReducer=function(t,e,n,r){var i="function"==typeof n,o=a(i?n(e):e,i?r:n);return[o[0],function(e){o[1](t(o[0],e))}]},e.useRef=function(e){var t=b.i++,n=b.stack;return t===b.length&&(b.length=n.push({current:e})),n[t]},e.useState=a,e.whenDefined=function(e){return(q.get(e)||I(e)).promise},e}({});