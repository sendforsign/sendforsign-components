import"../sb-preview/runtime.js";(function(){const _=document.createElement("link").relList;if(_&&_.supports&&_.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function s(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function l(e){if(e.ep)return;e.ep=!0;const t=s(e);fetch(e.href,t)}})();const d="modulepreload",p=function(i,_){return new URL(i,_).href},O={},o=function(_,s,l){let e=Promise.resolve();if(s&&s.length>0){const t=document.getElementsByTagName("link");e=Promise.all(s.map(r=>{if(r=p(r,l),r in O)return;O[r]=!0;const c=r.endsWith(".css"),E=c?'[rel="stylesheet"]':"";if(!!l)for(let a=t.length-1;a>=0;a--){const u=t[a];if(u.href===r&&(!c||u.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${r}"]${E}`))return;const n=document.createElement("link");if(n.rel=c?"stylesheet":d,c||(n.as="script",n.crossOrigin=""),n.href=r,document.head.appendChild(n),c)return new Promise((a,u)=>{n.addEventListener("load",a),n.addEventListener("error",()=>u(new Error(`Unable to preload CSS for ${r}`)))})}))}return e.then(()=>_()).catch(t=>{const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=t,window.dispatchEvent(r),!r.defaultPrevented)throw t})},{createBrowserChannel:R}=__STORYBOOK_MODULE_CHANNELS__,{addons:f}=__STORYBOOK_MODULE_PREVIEW_API__,m=R({page:"preview"});f.setChannel(m);window.__STORYBOOK_ADDONS_CHANNEL__=m;window.CONFIG_TYPE==="DEVELOPMENT"&&(window.__STORYBOOK_SERVER_CHANNEL__=m);const P={"./src/stories/contract-editor.stories.tsx":async()=>o(()=>import("./contract-editor.stories-Dj_TBsQ6.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]),import.meta.url),"./src/stories/contract-list.stories.tsx":async()=>o(()=>import("./contract-list.stories-BUDTnvF3.js"),__vite__mapDeps([16,1,2,3,4,5,6,7,8,9,10,17,12,11,13,14,15]),import.meta.url),"./src/stories/template-editor.stories.tsx":async()=>o(()=>import("./template-editor.stories-mXp_kIQe.js"),__vite__mapDeps([18,1,2,3,4,5,6,7,8,9,10,19,20]),import.meta.url),"./src/stories/template-list.stories.tsx":async()=>o(()=>import("./template-list.stories-CRY_CIsN.js"),__vite__mapDeps([21,1,2,3,4,5,6,7,8,9,10,17,12,19,20]),import.meta.url)};async function w(i){return P[i]()}const{composeConfigs:T,PreviewWeb:L,ClientApi:I}=__STORYBOOK_MODULE_PREVIEW_API__,v=async()=>{const i=await Promise.all([o(()=>import("./entry-preview-CtJY1E8m.js"),__vite__mapDeps([22,2,3,23,4]),import.meta.url),o(()=>import("./entry-preview-docs-9nEOGiy_.js"),__vite__mapDeps([24,25,3,9,6,26,2]),import.meta.url),o(()=>import("./preview-B_0crF9I.js"),__vite__mapDeps([27,28]),import.meta.url),o(()=>import("./preview-BkOW7CsI.js"),__vite__mapDeps([]),import.meta.url),o(()=>import("./preview-D8VCGkL0.js"),__vite__mapDeps([29,26]),import.meta.url),o(()=>import("./preview-BcxrGG1y.js"),__vite__mapDeps([30,26]),import.meta.url),o(()=>import("./preview-BTwmgt5n.js"),__vite__mapDeps([31,7]),import.meta.url),o(()=>import("./preview-BAz7FMXc.js"),__vite__mapDeps([32,26]),import.meta.url),o(()=>import("./preview-Cv3rAi2i.js"),__vite__mapDeps([]),import.meta.url),o(()=>import("./preview-CDTsxpVA.js"),__vite__mapDeps([33,3]),import.meta.url),o(()=>import("./preview-CIwosuWp.js"),__vite__mapDeps([]),import.meta.url)]);return T(i)};window.__STORYBOOK_PREVIEW__=window.__STORYBOOK_PREVIEW__||new L;window.__STORYBOOK_STORY_STORE__=window.__STORYBOOK_STORY_STORE__||window.__STORYBOOK_PREVIEW__.storyStore;window.__STORYBOOK_CLIENT_API__=window.__STORYBOOK_CLIENT_API__||new I({storyStore:window.__STORYBOOK_PREVIEW__.storyStore});window.__STORYBOOK_PREVIEW__.initialize({importFn:w,getProjectAnnotations:v});export{o as _};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["./contract-editor.stories-Dj_TBsQ6.js","./index.esm-BQi3gta5.js","./index-BsHCltJw.js","./_commonjsHelpers-BosuxZz1.js","./index-BY6ttnmU.js","./_commonjs-dynamic-modules-TwCWkOBp.js","./index-Dk74W0Oi.js","./tiny-invariant-CopsF_GD.js","./throttle-BZvPllO6.js","./isSymbol-DB5r9LRl.js","./index-Cqi7r2W_.css","./contract-editor-kFgnaqvB.js","./index-Ba-Zhihp.js","./index-BQ5IbGbl.js","./inheritsLoose-MVK87o0N.js","./contract-editor-DX_ZZ3D7.css","./contract-list.stories-BUDTnvF3.js","./use-save-params-d0meqd02.js","./template-editor.stories-mXp_kIQe.js","./template-editor-BJd0KovC.js","./template-editor-Bbg3a6ZG.css","./template-list.stories-CRY_CIsN.js","./entry-preview-CtJY1E8m.js","./react-16-Csl-nCkB.js","./entry-preview-docs-9nEOGiy_.js","./_getPrototype-C_maDOEK.js","./index-DrFu-skq.js","./preview-B_0crF9I.js","./index-Bw8VTzHM.js","./preview-D8VCGkL0.js","./preview-BcxrGG1y.js","./preview-BTwmgt5n.js","./preview-BAz7FMXc.js","./preview-CDTsxpVA.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}