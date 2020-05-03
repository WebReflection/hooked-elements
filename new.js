var hookedElements=function(e){"use strict";var t="function"==typeof cancelAnimationFrame,n=t?cancelAnimationFrame:clearTimeout,o=t?requestAnimationFrame:setTimeout;function s(e){var s,c,r,l,i;return u(),function(e,t,n){return r=e,l=t,i=n,c||(c=o(a)),--s<0&&h(!0),h};function a(){u(),r.apply(l,i||[])}function u(){s=e||1/0,c=t?0:null}function h(e){var t=!!c;return t&&(n(c),e&&a()),t}}var c=e=>({get:t=>e.get(t),set:(t,n)=>(e.set(t,n),n)})
/*! (c) Andrea Giammarchi - ISC */;let r=null;const l=c(new WeakMap),i=(e,t,n)=>{e.apply(t,n)},a={async:!1,always:!1},u=(e,t)=>"function"==typeof t?t(e):t,h=(e,t,n,o)=>{const c=r.i++,{hook:h,args:f,stack:d,length:p}=r;c===p&&(r.length=d.push({}));const g=d[c];if(g.args=f,c===p){const c="function"==typeof n,{async:r,always:f}=(c?o:n)||o||a;g.$=c?n(t):u(void 0,t),g._=r?l.get(h)||l.set(h,s()):i,g.f=t=>{const n=e(g.$,t);(f||g.$!==n)&&(g.$=n,g._(h,null,g.args))}}return[g.$,g.f]},f=new WeakMap,d=({hook:e,args:t})=>{e.apply(null,t)};function p(e){this.value!==e&&(this.value=e,f.get(this).forEach(d))}function g({hook:e}){return e===this.hook}const v=new WeakMap,m=c(v),y=()=>{},b=e=>(t,n)=>{const o=r.i++,{hook:c,after:l,stack:i,length:a}=r;if(o<a){const s=i[o],{update:c,values:r,stop:a}=s;if(!n||n.some(M,r)){s.values=n,e&&a(e);const{clean:o}=s;o&&(s.clean=null,o());const r=()=>{s.clean=t()};e?c(r):l.push(r)}}else{const o=e?s():y,a={clean:null,update:o,values:n,stop:y};r.length=i.push(a),(m.get(c)||m.set(c,[])).push(a);const u=()=>{a.clean=t()};e?a.stop=o(u):l.push(u)}},k=v.has.bind(v),w=b(!0),E=b(!1),A=(e,t)=>{const n=r.i++,{stack:o,length:s}=r;return n===s?r.length=o.push({$:e(),_:t}):t&&!t.some(M,o[n]._)||(o[n]={$:e(),_:t}),o[n].$};function M(e,t){return e!==this[t]}function $(e){return this.matches(e)}var O=Node.prototype.contains;const q="undefined"==typeof Promise?function(e){var t=[],n=!1;return e((function(){n=!0,t.splice(0).forEach(o)})),{then:o,catch(){}};function o(e){return n?setTimeout(e):t.push(e),this}}:Promise,{create:C,keys:S}=Object,_=new WeakMap,D=new Map,F="_"+Math.random(),L=[],W=[],x=[],{forEach:N}=x,T=e=>_.get(e)||x,P=new MutationObserver(e=>{for(let t=0,{length:n}=e;t<n;t++)T(e[t].target).forEach(U,e[t])});new MutationObserver(e=>{if(L.length)for(let t=0,{length:n}=e;t<n;t++){const{addedNodes:n,removedNodes:o}=e[t];N.call(n,R),N.call(o,V)}}).observe(document,{childList:!0,subtree:!0});const R=e=>{e.querySelectorAll&&(z(e,!1),J.call("connected",e),N.call(e.querySelectorAll(L),J,"connected"))},V=e=>{e.querySelectorAll&&(J.call("disconnected",e),N.call(e.querySelectorAll(L),J,"disconnected"))},j=e=>{L.forEach(Q,e)},z=(e,t)=>{if(e.querySelectorAll){L.forEach(Q,e);const n=e.querySelectorAll(L);N.call(n,j),t&&O.call(e.ownerDocument,e)&&(J.call("connected",e),N.call(n,J,"connected"))}},B=e=>{let t;const n={promise:new q(e=>t=e),resolve:t};return D.set(e,n),n},G=(e,t)=>{if(H(e))throw new Error("duplicated "+e);const n=[],o=C(null);for(let e=S(t),s=0,{length:c}=e;s<c;s++){let c=e[s];if(/^on/.test(c)&&!/Options$/.test(c)){const e=t[c+"Options"]||!1,s=c.toLowerCase();let r=s.slice(2);n.push({type:r,options:e}),o[r]=c,s!==c&&(r=c.slice(2,3).toLowerCase()+c.slice(3),o[r]=c,n.push({type:r,options:e}))}}if(n.length&&(t.handleEvent=function(e){this[o[e.type]](e)}),t.attributeChanged){const e={attributes:!0,attributeOldValue:!0},{observedAttributes:n}=t;(n||x).length&&(e.attributeFilter=n),t.observerDetails=e}L.push(e),W.push({listeners:n,definition:t,wm:new WeakMap}),I(document.documentElement),(D.get(e)||B(e)).resolve()},H=e=>{const t=L.indexOf(e);return t<0?void 0:W[t].definition},I=e=>{L.length&&z(e,!0)};function J(e){T(e).forEach(X,this)}function K(e,t,n){for(let n=0,{length:o}=t;n<o;n++){const{type:o,options:s}=t[n];this.addEventListener(o,e,s)}const{observerDetails:o}=e;o&&P.observe(this,o),n.set(this,!0),_.set(this,T(this).concat(e)),e.init&&e.init()}function Q(e,t){if($.call(this,e)){const{definition:e,listeners:n,wm:o}=W[t];o.has(this)||K.call(this,C(e,{element:{enumerable:!0,value:this},[F]:{writable:!0,value:""}}),n,o)}}function U(e){const{observerDetails:t}=e;if(t){const{attributeName:n,oldValue:o,target:s}=this,{attributeFilter:c}=t;(!c||-1<c.indexOf(n))&&e.attributeChanged(n,o,s.getAttribute(n))}}function X(e){const t=e[this];t&&e[F]!=this&&(e[F]=this,t.call(e))}function Y(){Z(this)}const Z=e=>{const{disconnected:t,element:n,render:o}=e,s=(e=>{const t=[];return function n(){const o=r,s=[];r={hook:n,args:arguments,stack:t,i:0,length:t.length,after:s};try{return e.apply(null,arguments)}finally{r=o;for(let e=0,{length:t}=s;e<t;e++)s[e]()}}})(o.bind(e,n));return e.disconnected=()=>{k(s)&&(e=>{(v.get(e)||[]).forEach(e=>{const{clean:t,stop:n}=e;n(),t&&(e.clean=null,t())})})(s),t&&t.call(e)},(e.render=s)()};return e.createContext=e=>{const t={value:e,provide:p};return f.set(t,[]),t},e.define=(e,t)=>G(e,"function"==typeof t?{init:Y,render:t}:(t.init||(t.init=Y),t)),e.get=H,e.render=Z,e.upgrade=I,e.useCallback=(e,t)=>A(()=>e,t),e.useContext=e=>{const{hook:t,args:n}=r,o=f.get(e),s={hook:t,args:n};return o.some(g,s)||o.push(s),e.value},e.useEffect=w,e.useLayoutEffect=E,e.useMemo=A,e.useReducer=h,e.useRef=e=>{const t=r.i++,{stack:n,length:o}=r;return t===o&&(r.length=n.push({current:e})),n[t]},e.useState=(e,t)=>h(u,e,void 0,t),e.whenDefined=e=>(D.get(e)||B(e)).promise,e}({});
