function o(){return o=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(t[n]=r[n])}return t},o.apply(this,arguments)}function i(t,e){return i=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,c){return n.__proto__=c,n},i(t,e)}function a(t){return a=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(r){return r.__proto__||Object.getPrototypeOf(r)},a(t)}function s(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch{}return(s=function(){return!!t})()}function u(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function f(t){throw new Error('Could not dynamically require "'+t+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}export{i as _,o as a,s as b,f as c,a as d,u as e};
