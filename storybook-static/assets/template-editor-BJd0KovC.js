import{Q as he,i as ue,k as we,l as Ae,u as Le,m as xe,j as e,A as _,e as j,g as N,h as z,a as m,d as ne,n as U,S as g,C as ee,o as me,B as J,I as se,T as oe,p as ke,q as ce,r as pe,s as De,D as je,t as Be,P as Fe,R as ye,b as Z,v as le,c as re,w as Ne,x as ze,y as q,z as Ke,E as He,F as Ve}from"./index.esm-BQi3gta5.js";import{r as l}from"./index-BsHCltJw.js";const ge=l.createContext(void 0),te=()=>{const n=l.useContext(ge);if(!n)throw new Error("useContractEditorContext must be used inside the EditorProvider");return n};he.register({"modules/better-table":ue},!0);for(let n=1;n<=40;n++)we(n);const $e=({value:n,quillRef:s})=>{Ae.extend(Le);const{apiKey:p,templateKey:c,clientKey:B,userKey:f,setRefreshPlaceholders:E,refreshPlaceholders:S}=te(),F=document.querySelector("#template-editor-container");l.useEffect(()=>{document.querySelector("#template-editor-container")&&(s.current=new he("#template-editor-container",{modules:{toolbar:{container:[["bold","italic","underline","strike"],["blockquote"],[{list:"ordered"},{list:"bullet"}],[{script:"sub"},{script:"super"}],[{indent:"-1"},{indent:"+1"}],[{direction:"rtl"}],[{size:["small",!1,"large","huge"]}],[{color:[]},{background:[]}],[{font:[]}],[{align:[]}],["link","image","table"],["clean"]],handlers:{table:T}},table:!1,"better-table":{operationMenu:{items:{unmergeCells:{text:"Unmerge"}}}},keyboard:{bindings:ue.keyboardBindings},history:{delay:5e3,maxStack:5e3,userOnly:!0}},theme:"bubble"}),s.current&&(s.current.getModule("toolbar").container.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation()}),s.current.on("text-change",function(i,y,b){var v,A;b==="user"&&k(s!=null&&s.current?(A=(v=s==null?void 0:s.current)==null?void 0:v.root)==null?void 0:A.innerHTML:"")})))},[F]),l.useEffect(()=>{var i;n&&(s!=null&&s.current)&&((i=s==null?void 0:s.current)==null||i.clipboard.dangerouslyPasteHTML(n),E(S+1))},[n]);const T=()=>{debugger;s.current.getModule("better-table").insertTable(3,3)},k=xe(async i=>{let y={data:{action:_.UPDATE,clientKey:B,userKey:f,template:{templateKey:c,value:i}}};await j.post(N+z.TEMPLATE,y,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":p},responseType:"json"}).then(b=>{console.log("editor read",b)})},5e3,{maxWait:5e3});return e("div",{id:"scroll-container",children:e("div",{id:"template-editor-container"})})},Me=()=>{const{setIsPdf:n,templateName:s,setTemplateName:p,setTemplateType:c,templateType:B,setTemplateValue:f,setCreateTemplate:E,pdfFileLoad:S,setPdfFileLoad:F,continueLoad:T,setContinueLoad:k}=te(),[i,y]=l.useState([]),{setArrayBuffer:b}=ce(),[v,A]=l.useState(!0),[K,H]=l.useState(!0),[X,V]=l.useState(!1),[L,Q]=l.useState(!1),[$,Y]=l.useState("Create template"),{Title:t,Text:a}=oe;return l.useEffect(()=>{y([{label:m("div",{style:{paddingTop:"8px",width:100,whiteSpace:"normal",lineHeight:"20px"},children:[e(ne,{style:{margin:"4px 0"},color:"magenta",children:"File"}),e("div",{style:{padding:"4px 0"},children:"Upload your DOCX file"})]}),value:U.DOCX},{label:m("div",{style:{paddingTop:"8px",width:100,whiteSpace:"normal",lineHeight:"20px"},children:[e(ne,{style:{margin:"4px 0"},color:"magenta",children:"File"}),e("div",{style:{padding:"4px 0"},children:"Upload your PDF file"})]}),value:U.PDF},{label:m("div",{style:{paddingTop:"8px",width:100,whiteSpace:"normal",lineHeight:"20px"},children:[e(ne,{style:{margin:"4px 0"},color:"cyan",children:"Empty"}),e("div",{style:{padding:"4px 0"},children:"Draft from scratch"})]}),value:U.EMPTY}])},[]),m(g,{direction:"vertical",size:16,style:{display:"flex"},children:[e(ee,{loading:L,children:m(g,{direction:"vertical",size:16,style:{display:"flex"},children:[m(g,{direction:"vertical",size:2,children:[e(t,{level:4,style:{margin:"0"},children:"Draft from scratch or upload a file"}),e(a,{type:"secondary",children:"This will speed up the drafting process."})]}),e(me,{options:i,onChange:o=>{o.toString()===U.DOCX.toString()||o.toString()===U.PDF.toString()?Y("Upload file"):Y("Create template"),c(o.toString()),A(!1)}}),e(J,{type:"primary",disabled:v,onClick:async()=>{let o;switch(B){case U.DOCX.toString():o=document.createElement("input"),o.type="file",o.accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document",o.onchange=M=>{let D=M.target.files[0],O=new FileReader;O.readAsArrayBuffer(D),O.onload=u=>{var P;u&&ke((P=u==null?void 0:u.target)==null?void 0:P.result,w=>{debugger;f(w),V(!0),A(!0)})}},o.click();break;case U.PDF.toString():o=document.createElement("input"),o.type="file",o.accept="application/pdf",o.onchange=M=>{let D=M.target.files[0];if(Math.round(D.size/1048576)>15){alert("File too big, please select a file less than 15mb");return}let u=new FileReader;u.readAsArrayBuffer(D),u.onload=async P=>{var G;debugger;n(!0);const w=(G=P==null?void 0:P.target)==null?void 0:G.result;await b("pdfFileTemplate",w),V(!0),A(!0),F(S+1)}},o.click();break;case U.EMPTY.toString():V(!0),A(!0);break}},children:$})]})}),X&&e(ee,{bordered:!0,children:m(g,{direction:"vertical",size:16,style:{display:"flex"},children:[e(g,{direction:"vertical",size:2,children:e(t,{level:4,style:{margin:"0"},children:"Let's create your template"})}),e(se,{id:"TemplateName",placeholder:"Enter your template name",value:s,onChange:o=>{switch(o.target.id){case"TemplateName":p(o.target.value),o.target.value?H(!1):H(!0);break}}}),e(J,{type:"primary",disabled:K,onClick:async()=>{k(!0),E(!0)},loading:T,children:"Continue"})]})})]})};pe.GlobalWorkerOptions.workerSrc=`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pe.version}/pdf.worker.min.js`;const Oe=()=>{const{pdfFileLoad:n,setContinueLoad:s}=te(),[p,c]=l.useState(),[B,f]=l.useState(1),[E,S]=l.useState(1),{getArrayBuffer:F}=ce(),{width:T,ref:k}=De();return l.useEffect(()=>{(async()=>{const y=await F("pdfFileTemplate");c(y)})()},[n]),e("div",{ref:k,children:e(je,{loading:e(Be,{spinning:!0}),file:p,onLoadSuccess:({numPages:i})=>{f(i)},onSourceError:()=>{console.log("PdfViewer onSourceError")},onLoadError:()=>{console.log("PdfViewer onLoadError")},onError:()=>{console.log("PdfViewer error")},children:new Array(B).fill(0).map((i,y)=>e(Fe,{width:T,height:T&&1.4*T,pageNumber:y+1,scale:E},y))})})},Ie=({quillRef:n})=>{const{templateKey:s,clientKey:p,placeholder:c,continueLoad:B,setPlaceholder:f,refreshPlaceholders:E,apiKey:S}=te(),[F,T]=l.useState(E),[k,i]=l.useState(!1),{Title:y,Text:b}=oe,v=async(t=!0)=>{console.log("PlaceholderBlock"),t&&i(!0);const a={data:{action:_.LIST,clientKey:p,templateKey:s}};await j.post(N+z.PLACEHOLDER,a,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":S},responseType:"json"}).then(r=>{if(console.log("getPlaceholders read",r),r.data.placeholders&&r.data.placeholders.length>0){let d=[];for(let h=0;h<r.data.placeholders.length;h++)d.push(r.data.placeholders[h]);f(d)}t&&i(!1)})};l.useEffect(()=>{s&&p&&F!==E&&(T(E),v())},[E]);const A=async()=>{let t=[...c];t.push({name:`Name${t.length}`,value:"",type:q.INTERNAL}),f(t);let a={data:{action:_.CREATE,clientKey:p,templateKey:s,placeholder:{name:`Name${t.length}`,value:"",type:q.INTERNAL}}};await j.post(N+z.PLACEHOLDER,a,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":S},responseType:"json"}).then(r=>{console.log("PLACEHOLDER read",r),v(!1)})},K=t=>{var d,h,C,o;const a=(d=n==null?void 0:n.current)==null?void 0:d.getSelection();console.log("position",a,n);const r=c[t].value?(h=c[t].value)==null?void 0:h.replace(/\s/g,""):"";(C=n==null?void 0:n.current)==null||C.clipboard.dangerouslyPasteHTML(a?a==null?void 0:a.index:0,`<placeholder${t+1} className={placeholderClass${t+1}}>${r?c[t].value:`{{{${c[t].name}}}}`}</placeholder${t+1}>`,"user"),console.log("handleInsertPlaceholder",(o=n==null?void 0:n.current)==null?void 0:o.root.innerHTML)},H=async t=>{let a=[...c],r={data:{action:_.DELETE,clientKey:p,templateKey:s,placeholder:{placeholderKey:a[t].placeholderKey}}};await j.post(N+z.PLACEHOLDER,r,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":S},responseType:"json"}).then(d=>{console.log("PLACEHOLDER read",d),a.splice(t,1),f(a),v(!1)})},X=(t,a)=>{let r=[...c];switch(t.target.id){case"PlaceholderName":r[a].name=t.target.value;break;case"PlaceholderValue":r[a].value=t.target.value;break}f(r)},V=(t,a)=>{var o,M,D,O;let r=(o=n==null?void 0:n.current)==null?void 0:o.root.innerHTML,d=`<placeholder${t}`,h=r==null?void 0:r.split(d),C="";if(h){for(let u=0;u<h.length;u++)if(h.length>1)if(u===0)C+=h[u];else{C+=`<placeholder${t}`,d=`</placeholder${t}>`;const P=h[u].split(d);for(let w=0;w<P.length;w++)if(w===0){d=`"placeholderClass${t}">`;const G=P[w].split(d);for(let W=0;W<G.length;W++)W===0?C+=`${G[W]}"placeholderClass${t}">`:C+=`${a}</placeholder${t}>`}else C+=P[w]}else C=h[u];(M=n==null?void 0:n.current)==null||M.clipboard.dangerouslyPasteHTML(C,"user"),(D=n==null?void 0:n.current)==null||D.blur()}console.log("changeValueInTag",(O=n==null?void 0:n.current)==null?void 0:O.root.innerHTML)},L=async(t,a)=>{switch(t.target.id){case"PlaceholderName":let r=[...c],d={data:{action:_.UPDATE,clientKey:p,templateKey:s,placeholder:{placeholderKey:r[a].placeholderKey,name:r[a].name}}};await j.post(N+z.PLACEHOLDER,d,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":S},responseType:"json"}).then(h=>{console.log("PLACEHOLDER read",h)});break;case"PlaceholderValue":Q(a);break}},Q=async t=>{let a=[...c];a[t].name&&V(a[t].id?a[t].id:0,a[t].value?a[t].value:`{{{${a[t].name}}}}`);let r={data:{action:_.UPDATE,clientKey:p,templateKey:s,placeholder:{placeholderKey:a[t].placeholderKey,value:a[t].value}}};await j.post(N+z.PLACEHOLDER,r,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":S},responseType:"json"}).then(d=>{console.log("PLACEHOLDER read",d)})},$=(t,a)=>{let r=[...c];r[a].type=t,f(r)},Y=t=>{Q(t)};return e(ee,{loading:k||B,children:m(g,{direction:"vertical",size:16,style:{display:"flex"},children:[m(g,{direction:"vertical",size:2,children:[e(y,{level:4,style:{margin:"0 0 0 0"},children:"Placeholders"}),e(b,{type:"secondary",children:"Add reusable text to the content."})]}),c&&c.map((t,a)=>e("div",{draggable:!0,id:t.placeholderKey,children:m(g,{id:t.placeholderKey,direction:"vertical",size:2,style:{display:"flex"},children:[m(ye,{wrap:!1,align:"middle",children:[e(Z,{children:e(le,{title:"Click to insert the placeholder at the current cursor position in the text.",children:e(J,{size:"small",type:"text",icon:e(re,{icon:Ne,size:"sm",onClick:()=>{K(a)}})})})}),e(Z,{children:e(le,{title:"Click to see more options.",children:e(ze,{content:m(g,{direction:"vertical",style:{display:"flex"},children:[e(J,{block:!0,type:"text",onClick:()=>{K(a)},children:"Insert into the text"}),e(J,{block:!0,danger:!0,type:"text",onClick:()=>{H(a)},children:"Delete"})]}),trigger:"click",children:e(se,{id:"PlaceholderName",placeholder:"Enter placeholder name",bordered:!1,value:t.name,onChange:r=>X(r,a),onBlur:r=>L(r,a)})})})}),e(Z,{flex:"auto"}),e(Z,{flex:"55px",children:e(le,{title:"Set who fills in this field: the user when creating a draft or the external signer when signing.",children:e(me,{size:"small",options:[{value:q.INTERNAL,icon:e(re,{icon:Ke,size:"xs"})},{value:q.EXTERNAL,icon:e(re,{icon:He,size:"xs"})}],value:t.type,onChange:r=>$(r,a)})})})]}),e(se,{id:"PlaceholderValue",placeholder:"Enter value",value:t.value,onChange:r=>X(r,a),onBlur:r=>L(r,a),onPressEnter:()=>Y(a)})]})})),e(g,{direction:"vertical",size:2,style:{display:"flex"},children:e(J,{block:!0,type:"dashed",onClick:A,children:"Add placeholder"})})]})})};var Ue={};const Ge=({apiKey:n,templateKey:s,clientKey:p,userKey:c})=>{if(!n&&!Ue.REACT_APP_SENDFORSIGN_KEY)throw new Error("Missing Publishable Key");const{getArrayBuffer:B,setArrayBuffer:f,clearArrayBuffer:E}=ce(),[S,F]=l.useState({open:!1,action:""}),[T,k]=l.useState(""),[i,y]=l.useState(""),[b,v]=l.useState(!1),[A,K]=l.useState(!1),[H,X]=l.useState(!1),[V,L]=l.useState(!1),[Q,$]=l.useState(!!s),[Y,t]=l.useState(!0),[a,r]=l.useState(""),[d,h]=l.useState(s),[C,o]=l.useState(p),[M,D]=l.useState(c),[O,u]=l.useState(n),[P,w]=l.useState(0),[G,W]=l.useState(0),[fe,Te]=l.useState([]),ae=l.useRef(s),{Title:be,Text:ve}=oe,ie=l.useRef();return l.useEffect(()=>{u(n)},[n]),l.useEffect(()=>{o(p)},[p]),l.useEffect(()=>{D(c)},[c]),l.useEffect(()=>{E(),ae.current=s;let R={};ae.current?(K(!1),v(!1),L(!0),$(!0),(async()=>{R={data:{action:_.READ,clientKey:p,userKey:c,template:{templateKey:ae.current}}};let I={createTime:new Date,changeTime:new Date,templateKey:"",value:"",name:"",isPdf:!1};await j.post(N+z.TEMPLATE,R,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":n},responseType:"json"}).then(x=>{console.log("getTemplate read",x),I=x.data.template}),I.isPdf?await j.get(I.value,{responseType:"arraybuffer"}).then(async function(x){v(!0),await f("pdfFileTemplate",x.data),w(P+1),L(!1)}):(y(I.value?I.value:"<div></div>"),L(!1))})()):(K(!0),$(!1),v(!1),k(""),r(""),y("<div></div>"),L(!1))},[s]),l.useEffect(()=>{const R=async()=>{let de={data:{action:_.CREATE,clientKey:p,userKey:c,template:{name:T,value:i,isPdf:b}}},I={createTime:new Date,changeTime:new Date,templateKey:"",value:"",name:"",isPdf:!1};if(await j.post(N+z.TEMPLATE,de,{headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json","x-sendforsign-key":n},responseType:"json"}).then(x=>{console.log("TEMPLATE editor read",x),h(x.data.template.templateKey),I=x.data.template,K(!1),$(!0)}),b){const x=new FormData,Ce=await B("pdfFileTemplate"),Pe=new Blob([Ce],{type:"application/pdf"});x.append("pdf",Pe);let Ee=`${N}${z.UPLOAD_PDF}?templateKey=${I.templateKey}&clientKey=${p}`;await j.post(Ee,x,{headers:{"x-sendforsign-key":n},responseType:"json"}).then(Se=>{console.log("editor read",Se)})}L(!1)};H&&(X(!1),R())},[H]),e(ge.Provider,{value:{resultModal:S,setResultModal:F,clientKey:C,setClientKey:o,userKey:M,setUserKey:D,templateKey:d,setTemplateKey:h,pdfFileLoad:P,setPdfFileLoad:w,templateName:T,setTemplateName:k,templateValue:i,setTemplateValue:y,templateType:a,setTemplateType:r,editorVisible:Q,setEditorVisible:$,isPdf:b,setIsPdf:v,createTemplate:H,setCreateTemplate:X,continueLoad:V,setContinueLoad:L,refreshPlaceholders:G,setRefreshPlaceholders:W,placeholder:fe,setPlaceholder:Te,placeholderVisible:Y,setPlaceholderVisible:t,apiKey:O,setApiKey:u},children:m(g,{direction:"vertical",size:16,style:{display:"flex"},children:[A&&e(Me,{}),Q&&m(ye,{gutter:{xs:8,sm:8,md:8,lg:8},wrap:!1,children:[e(Z,{flex:"auto",children:e(g,{direction:"vertical",size:16,style:{display:"flex"},children:e(ee,{loading:V,children:m(g,{direction:"vertical",size:16,style:{display:"flex"},children:[m(g,{direction:"vertical",size:2,children:[e(be,{level:4,style:{margin:"0 0 0 0"},children:"Review your template"}),e(ve,{type:"secondary",children:"Highlight text to see options."})]}),b?e(Oe,{}):e(Ve,{children:i&&e($e,{value:i,quillRef:ie})})]})})})}),!b&&e(Z,{flex:"300px",style:{display:"block"},children:e(g,{direction:"vertical",style:{display:"flex",top:10,position:"sticky"},children:e(Ie,{quillRef:ie})})})]})]})})};export{Ge as T};
