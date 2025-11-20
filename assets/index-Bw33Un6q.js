(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const I=()=>{const t=new Set;return{subscribe:r=>t.add(r),notify:()=>t.forEach(r=>r())}};class v{#r;#t;#n=I();#e;constructor(e=""){this.#r=new Map,this.#t=null,this.#e=e?e.replace(/\/$/,"")+"/":"",window.addEventListener("popstate",()=>{this.#t=this.findRoute(),this.#n.notify()})}get baseUrl(){return this.#e}get query(){return v.parseQuery(window.location.search)}get params(){return this.#t?.params??{}}get route(){return this.#t}get target(){return this.#t?.handler}set query(e){const n=v.getUrl(e,this.#e);this.push(n)}subscribe(e){this.#n.subscribe(e)}addRoute(e,n){const r=[],o=e.replace(/:\w+/g,c=>(r.push(c.slice(1)),"([^/]+)")).replace(/\//g,"\\/"),s=this.#e?this.#e.replace(/\/$/,""):"",i=new RegExp(`^${s}${o}$`);this.#r.set(e,{regex:i,paramNames:r,handler:n})}findRoute(e=window.location.pathname){const{pathname:n}=new URL(e,window.location.origin);for(const[r,o]of this.#r){const s=n.match(o.regex);if(s){const i={};return o.paramNames.forEach((c,a)=>{i[c]=s[a+1]}),{...o,params:i,path:r}}}return null}push(e){try{let n=e.startsWith(this.#e)?e:this.#e+(e.startsWith("/")?e:"/"+e);`${window.location.pathname}${window.location.search}`!==n&&window.history.pushState(null,"",n),this.#t=this.findRoute(n),this.#n.notify()}catch(n){console.error("라우터 네비게이션 오류:",n)}}start(){const e=window.location.pathname,n=this.#e.replace(/\/$/,"");n&&e===n&&window.history.replaceState(null,"",this.#e),this.#t=this.findRoute(),this.#n.notify()}static parseQuery=(e=window.location.search)=>{const n=new URLSearchParams(e),r={};for(const[o,s]of n)r[o]=s;return r};static stringifyQuery=e=>{const n=new URLSearchParams;for(const[r,o]of Object.entries(e))o!=null&&o!==""&&n.set(r,String(o));return n.toString()};static getUrl=(e,n="")=>{const o={...v.parseQuery(),...e};Object.keys(o).forEach(i=>{(o[i]===null||o[i]===void 0||o[i]==="")&&delete o[i]});const s=v.stringifyQuery(o);return`${n}${window.location.pathname.replace(n,"")}${s?`?${s}`:""}`}}const U="/jreact-playground/",b=new v(U),L=new WeakMap,E={current:null,previous:null},H={mount:null,didMount:null,unmount:null,watches:[],deps:[],mounted:!1},T=t=>(L.has(t)||L.set(t,{...H}),L.get(t)),J=(t,e)=>!Array.isArray(t)||!Array.isArray(e)?!1:t.length!==e.length?!0:t.some((n,r)=>n!==e[r]),Z=t=>{const e=T(t);e.mounted||(console.log("🚀 페이지 마운트:",t.name),e.mount?.(),e.mounted=!0,e.deps=[])},F=t=>{const e=T(t);console.log("✅ DOM 삽입 완료:",t.name),e.didMount?.()},Q=t=>{const e=T(t);e.mounted&&(console.log("🔻 페이지 언마운트:",t.name),e.unmount?.(),e.mounted=!1)},k=({onMount:t,didMount:e,onUnmount:n,watches:r}={},o)=>{const s=T(o);return typeof t=="function"&&(s.mount=t),typeof e=="function"&&(s.didMount=e),typeof n=="function"&&(s.unmount=n),Array.isArray(r)&&(s.watches=typeof r[0]=="function"?[r]:r),(...i)=>{const c=E.current!==o;E.current&&c&&Q(E.current),E.previous=E.current,E.current=o;const a=o(...i);return c?Z(o):s.watches&&s.watches.forEach(([d,h],p)=>{const u=d();J(u,s.deps[p])&&(console.log(`📊 의존성 변경 감지 (${o.name}):`,s.deps[p],"→",u),h()),s.deps[p]=Array.isArray(u)?[...u]:[]}),c&&s.didMount&&setTimeout(()=>{F(o)},0),a}},x={},q=t=>{const e=x[t.type];if(e){for(const[n,r]of Object.entries(e))if(t.target.closest(n))try{r(t)}catch(s){console.error(`이벤트 핸들러 실행 오류 (${n}):`,s)}}},G=(()=>{let t=!1;return()=>{if(t){console.log("⚠️ 전역 이벤트가 이미 등록되었습니다.");return}console.log("🔧 전역 이벤트 리스너 등록 중..."),Object.keys(x).forEach(e=>{document.body.addEventListener(e,q),console.log(`✅ ${e} 이벤트 리스너 등록됨`)}),t=!0,console.log("✅ 전역 이벤트 리스너 등록 완료")}})(),K=(t,e,n)=>{x[t]||(x[t]={}),x[t][e]=n,console.log(`📝 이벤트 등록: ${t} - ${e}`)};function Y(){K("click",".nav_router",async t=>{const e=t.target.closest("[data-page]").dataset.page;b.push(e)})}function ee(){Y()}const te=t=>{let e=!1;return(...n)=>{e||(e=!0,queueMicrotask(()=>{e=!1,t(...n)}))}};function ne(t,e,...n){const r=e||{},o=c=>{const a=[];for(const d of c)Array.isArray(d)?a.push(...o(d)):a.push(d);return a},i=o(n).filter(c=>c!=null&&c!==!1).map(c=>typeof c=="string"||typeof c=="number"?{type:"TEXT_ELEMENT",props:{nodeValue:String(c)},children:[]}:c);return{type:t,props:r,children:i}}function P(t){if(t==null)return null;if(t.type==="TEXT_ELEMENT")return document.createTextNode(t.props.nodeValue);if(typeof t.type=="function"){const n=t.type(t.props||{});return P(n)}const e=document.createElement(t.type);return Object.entries(t.props||{}).forEach(([n,r])=>{if(n==="className")e.className=r;else if(n.startsWith("on")&&typeof r=="function"){const o=n.toLowerCase().slice(2);e.addEventListener(o,r)}else e.setAttribute(n,r)}),(t.children||[]).forEach(n=>{const r=P(n);r&&e.appendChild(r)}),e}function re(t,e){e.innerHTML="";const n=P(t);n&&e.appendChild(n)}function j(t){const e=t.trim();if(!e)throw new Error("입력이 비어 있습니다.");const n=/^<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*)<\/\1>$/.exec(e);if(!n)throw new Error("지금 파서는 <tag ...>children</tag> 한 가지 형태만 지원합니다.");const[,r,o,s]=n,i=oe(o),c=ie(s);return ne(r,i,...c)}function oe(t){const e={};if(!t||!t.trim())return e;const n=/([A-Za-z_][A-Za-z0-9_]*)=({[^}]*}|"[^"]*")/g;let r;for(;(r=n.exec(t))!==null;){const[,o,s]=r;let i;if(s.startsWith("{")){const a=s.slice(1,-1).trim();i=se(a)}else s.startsWith('"')&&(i=s.slice(1,-1));const c=o==="class"?"className":o;e[c]=i}return e}function se(t){const e=t.trim();if(e==="true")return!0;if(e==="false")return!1;if(e==="null")return null;const n=Number(e);if(!Number.isNaN(n))return n;if(e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'"))try{return JSON.parse(e)}catch{return e.slice(1,-1)}return e}function ie(t){const e=t.trim();if(!e)return[];let n=e;const r=/^<>\s*([\s\S]*)\s*<\/>$/.exec(n);if(r)n=r[1];else if(!e.startsWith("<"))return[e];const o=[],s=/<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*?)<\/\1>/g;let i;for(;(i=s.exec(n))!==null;){const c=i[0],a=j(c);o.push(a)}return o}const ce=(t,e)=>typeof e=="function"?`[Function ${e.name||"anonymous"}]`:e,ae=()=>{const t=document.getElementById("jsx-input"),e=document.getElementById("vnode-viewer"),n=document.getElementById("dom-preview");function r(){const o=t.value.trim();if(!o){e.textContent="",n.innerHTML="";return}try{const s=j(o);e.textContent=JSON.stringify(s,ce,2),re(s,n)}catch(s){e.textContent=`파싱 에러: ${s.message}`,n.innerHTML=""}}t.addEventListener("keydown",o=>{if(o.key==="Tab"){o.preventDefault();const s=t.selectionStart,i=t.selectionEnd,c=t.value;t.value=c.substring(0,s)+"  "+c.substring(i),t.selectionStart=t.selectionEnd=s+2,r()}}),t.value='<div id="바다" room={"sea"}>바다</div>',t.addEventListener("input",r),r()},_=({children:t})=>`
    <header>
      <h1>VNode Playground</h1>
      <span>JSX 비슷한 태그를 입력하면 VNode와 실제 DOM을 바로 확인할 수 있는 미니 도구</span>
      <nav style="margin-top: 1rem;>
        <li style="list-style:none" class="nav_router">
          <ul data-page="/" style="padding: 0.5rem 1rem; margin-right: 0.5rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">🏠 홈</ul>
          <ul data-page="/reconciliation" style="padding: 0.5rem 1rem; background: #28a745; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">🔄 Reconciliation</ul>
        </li>
      </nav>
    </header>

    <main>
      ${t}
    </main>
  `,le=k({didMount:()=>{ae()}},()=>(console.log("🏠 홈 페이지 로드"),_({children:`
    <!-- JSX 흉내 입력 패널 -->
      <section class="panel" style="grid-column: 1 / span 2">
        <h2>
          JSX 흉내 입력
          <span class="badge">JSX → VNode</span>
        </h2>
        <textarea
          id="jsx-input"
          placeholder='<div id="바다" room={"sea"}>바다</div>'
        ></textarea>
        <div class="hint">
          예) <code>&lt;div id="바다" room={"sea"}&gt;바다&lt;/div&gt;</code><br />
          속성은 <code>id="텍스트"</code>, <code>count={10}</code>, <code>flag={true}</code> 같은 형태만
          지원합니다.
        </div>
      </section>

      <!-- VNode 구조 패널 -->
      <section class="panel">
        <h2>
          VNode 구조
          <span class="badge">Virtual Node</span>
        </h2>
        <pre><code id="vnode-viewer"></code></pre>
      </section>

      <!-- DOM 결과 패널 -->
      <section class="panel">
        <h2>
          DOM 결과
          <span class="badge">Real DOM</span>
        </h2>
        <div id="dom-preview"></div>
      </section>
  `}))),m={REPLACE:"REPLACE",UPDATE_TEXT:"UPDATE_TEXT",UPDATE_PROPS:"UPDATE_PROPS",REMOVE:"REMOVE",ADD:"ADD"};function z(t,e,n=[],r=[]){if(!e)return n.push({type:m.REMOVE,path:[...r],description:`노드 제거: ${S(t)}`}),n;if(!t)return n.push({type:m.ADD,path:[...r],node:e,description:`노드 추가: ${S(e)}`}),n;if(t.type!==e.type)return n.push({type:m.REPLACE,path:[...r],oldNode:t,newNode:e,description:`노드 교체: <${t.type}> → <${e.type}>`}),n;if(t.type==="TEXT_ELEMENT"){const a=t.props.nodeValue,d=e.props.nodeValue;return a!==d&&n.push({type:m.UPDATE_TEXT,path:[...r],oldText:a,newText:d,description:`텍스트 변경: "${a}" → "${d}"`}),n}const o=de(t.props,e.props);o.length>0&&n.push({type:m.UPDATE_PROPS,path:[...r],propsDiff:o,description:`속성 변경 (${o.length}개): ${o.map(a=>a.key).join(", ")}`});const s=t.children||[],i=e.children||[],c=Math.max(s.length,i.length);for(let a=0;a<c;a++)z(s[a],i[a],n,[...r,a]);return n}function de(t={},e={}){const n=[],r=new Set([...Object.keys(t),...Object.keys(e)]);for(const o of r){const s=t[o],i=e[o];s!==i&&n.push({key:o,oldValue:s,newValue:i,action:s===void 0?"added":i===void 0?"removed":"updated"})}return n}function S(t){return t?t.type==="TEXT_ELEMENT"?`"${t.props.nodeValue}"`:`<${t.type}>`:"null"}function N(t){if(!t)return null;if(t.type==="TEXT_ELEMENT")return document.createTextNode(t.props.nodeValue??"");const e=document.createElement(t.type);return Object.entries(t.props||{}).forEach(([n,r])=>{if(n==="className")e.className=r;else if(n.startsWith("on")&&typeof r=="function"){const o=n.toLowerCase().slice(2);e.addEventListener(o,r)}else e.setAttribute(n,r)}),(t.children||[]).forEach(n=>{const r=N(n);r&&e.appendChild(r)}),e}function D(t,e){let n=t;for(const r of e){if(!n||!n.childNodes)return null;n=n.childNodes[r]}return n}function ue(t,e,n){const r=D(t,e.path);switch(e.type){case m.REPLACE:{if(r&&r.parentNode){const o=N(e.newNode);r.parentNode.replaceChild(o,r),w(o,"replace")}break}case m.UPDATE_TEXT:{r&&r.nodeType===Node.TEXT_NODE&&(r.nodeValue=e.newText,w(r.parentNode,"update"));break}case m.UPDATE_PROPS:{r&&r.nodeType===Node.ELEMENT_NODE&&(e.propsDiff.forEach(({key:o,newValue:s,action:i})=>{i==="removed"?r.removeAttribute(o):o==="className"?r.className=s:r.setAttribute(o,s)}),w(r,"update"));break}case m.REMOVE:{r&&r.parentNode&&(w(r,"remove"),setTimeout(()=>{r.parentNode&&r.parentNode.removeChild(r)},500));break}case m.ADD:{const o=e.path.slice(0,-1),s=o.length?D(t,o):t;if(s){const i=N(e.node);s.appendChild(i),w(i,"add")}break}}}function w(t,e){if(!t||t.nodeType!==Node.ELEMENT_NODE)return;const n={add:"#4caf50",remove:"#f44336",update:"#ff9800",replace:"#2196f3"},r=t.style.backgroundColor;t.style.backgroundColor=n[e],t.style.transition="background-color 0.3s ease",setTimeout(()=>{t.style.backgroundColor=r},800)}function $(t){const e=t.trim();if(!e)throw new Error("입력이 비어 있습니다.");const n=/^<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*)<\/\1>$/.exec(e);if(!n)throw new Error("지금 파서는 <tag ...>children</tag> 한 가지 형태만 지원합니다.");const[,r,o,s]=n,i=pe(o),c=he(s);return fe(r,i,...c)}function fe(t,e,...n){const r=e||{},o=c=>{const a=[];for(const d of c)Array.isArray(d)?a.push(...o(d)):a.push(d);return a},i=o(n).filter(c=>c!=null&&c!==!1).map(c=>typeof c=="string"||typeof c=="number"?{type:"TEXT_ELEMENT",props:{nodeValue:String(c)},children:[]}:c);return{type:t,props:r,children:i}}function pe(t){const e={};if(!t||!t.trim())return e;const n=/([A-Za-z_][A-Za-z0-9_]*)=({[^}]*}|"[^"]*")/g;let r;for(;(r=n.exec(t))!==null;){const[,o,s]=r;let i;if(s.startsWith("{")){const a=s.slice(1,-1).trim();i=me(a)}else s.startsWith('"')&&(i=s.slice(1,-1));const c=o==="class"?"className":o;e[c]=i}return e}function me(t){const e=t.trim();if(e==="true")return!0;if(e==="false")return!1;if(e==="null")return null;const n=Number(e);if(!Number.isNaN(n))return n;if(e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'"))try{return JSON.parse(e)}catch{return e.slice(1,-1)}return e}function he(t){const e=t.trim();if(!e)return[];let n=e;const r=/^<>\s*([\s\S]*)\s*<\/>$/.exec(n);if(r)n=r[1];else if(!e.startsWith("<"))return[e];const o=[],s=/<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*?)<\/\1>/g;let i;for(;(i=s.exec(n))!==null;){const c=i[0],a=$(c);o.push(a)}return o}const R=(t,e)=>typeof e=="function"?`[Function ${e.name||"anonymous"}]`:e,ge=()=>{const t=document.getElementById("jsx-old"),e=document.getElementById("jsx-new"),n=document.getElementById("vnode-old"),r=document.getElementById("vnode-new"),o=document.getElementById("patch-list"),s=document.getElementById("dom-preview-step"),i=document.getElementById("dom-preview-final"),c=document.getElementById("play-btn"),a=document.getElementById("reset-btn"),d=document.getElementById("step-info");let h=null,p=null,u=[],g=0;function A(){const l=t.value.trim(),f=e.value.trim();try{l?(h=$(l),n.textContent=JSON.stringify(h,R,2)):(h=null,n.textContent=""),f?(p=$(f),r.textContent=JSON.stringify(p,R,2)):(p=null,r.textContent=""),u=z(h,p),C(),O()}catch(y){n.textContent=`파싱 에러: ${y.message}`,r.textContent="",o.innerHTML=""}}function C(){if(u.length===0){o.innerHTML='<div style="color: #4caf50;">✓ 변경사항 없음</div>',d.textContent="";return}const l=u.map((f,y)=>`
      <div style="padding: 0.5rem; margin: 0.5rem 0; background: ${y===g?"#fff3cd":"#f8f9fa"}; border-left: 4px solid ${V(f.type)}; border-radius: 4px;">
        <strong>[${y+1}] ${f.type}</strong>: ${f.description}
        <div style="color: #666; font-size: 0.85rem;">Path: [${f.path.join(", ")}]</div>
      </div>
    `).join("");o.innerHTML=l,d.textContent=`총 ${u.length}개의 변경사항`}function V(l){return{REPLACE:"#2196f3",UPDATE_TEXT:"#ff9800",UPDATE_PROPS:"#ff9800",REMOVE:"#f44336",ADD:"#4caf50"}[l]||"#999"}function O(){if(s.innerHTML="",g=0,h){const l=N(h);s.appendChild(l)}i.innerHTML='<div style="color: #999; text-align: center; padding: 2rem;">재조정을 완료하면 최종 결과가 여기에 표시됩니다</div>',C()}function B(){if(g>=u.length){alert("모든 패치가 적용되었습니다!");return}const l=u[g];ue(s,l),g++,C(),g>=u.length?(d.textContent=`✓ 완료 (${u.length}/${u.length})`,W()):d.textContent=`진행 중 (${g}/${u.length})`}function W(){if(i.innerHTML="",p){const l=N(p);i.appendChild(l),i.style.animation="fadeIn 0.5s ease"}else i.innerHTML='<div style="color: #999; text-align: center; padding: 2rem;">결과가 비어있습니다</div>'}t.addEventListener("input",A),e.addEventListener("input",A),c.addEventListener("click",B),a.addEventListener("click",O),[t,e].forEach(l=>{l.addEventListener("keydown",f=>{if(f.key==="Tab"){f.preventDefault();const y=l.selectionStart,X=l.selectionEnd,M=l.value;l.value=M.substring(0,y)+"  "+M.substring(X),l.selectionStart=l.selectionEnd=y+2}})}),t.value='<div id="old" class="container">이전 내용</div>',e.value=`<div id="new" class="container">
    <div id="new1" key="new1" class="container">새로운 내용</div>
    <div id="new2" key="new2" class="container">새로운 내용</div>
  </div>`,A()},ye=k({didMount:()=>{ge()}},()=>(console.log("🔄 Reconciliation 페이지 로드"),_({children:`
      <!-- Old VNode 입력 -->
      <section class="panel">
        <h2>
          Old JSX (이전 상태)
          <span class="badge">Before</span>
        </h2>
        <textarea
          class="jsx_textarea"
          id="jsx-old"
          placeholder='<div id="old">이전 내용</div>'
        ></textarea>
        <div class="hint">
          이전 상태의 JSX를 입력하세요
        </div>
      </section>

      <!-- New VNode 입력 -->
      <section class="panel">
        <h2>
          New JSX (새 상태)
          <span class="badge">After</span>
        </h2>
        <textarea
          class="jsx_textarea"
          id="jsx-new"
          placeholder='<div id="new">새로운 내용</div>'
        ></textarea>
        <div class="hint">
          새로운 상태의 JSX를 입력하세요
        </div>
      </section>

      <!-- VNode 비교 결과 -->
      <section class="panel" style="grid-column: 1 / span 2">
        <h2>
          VNode Diff
          <span class="badge">Comparison</span>
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666;">Old VNode</h3>
            <pre><code id="vnode-old"></code></pre>
          </div>
          <div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666;">New VNode</h3>
            <pre><code id="vnode-new"></code></pre>
          </div>
        </div>
      </section>

      <!-- Patch Operations -->
      <section class="panel" style="grid-column: 1 / span 2">
        <h2>
          Patch Operations
          <span class="badge">DOM 조작 목록</span>
        </h2>
        <div id="patch-list" style="font-family: monospace; font-size: 0.9rem;"></div>
      </section>

      <!-- DOM 결과 (좌우 분할) -->
      <section class="panel" style="grid-column: 1 / span 2">
        <div style="margin-bottom: 1rem;">
          <button id="play-btn" style="padding: 0.5rem 1rem; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; font-weight: bold;">
            ▶ 단계별 실행
          </button>
          <button id="reset-btn" style="padding: 0.5rem 1rem; cursor: pointer; background: #6c757d; color: white; border: none; border-radius: 4px; margin-left: 0.5rem;">
            🔄 리셋
          </button>
          <span id="step-info" style="margin-left: 1rem; color: #666;"></span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <!-- 왼쪽: 중간 단계 변경사항 -->
          <div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #333;">
              Step-by-Step Changes
              <span class="badge" style="font-size: 0.75rem; background: #ff9800;">Live Preview</span>
            </h3>
            <div id="dom-preview-step" style="padding: 1rem; border: 2px solid #ff9800; border-radius: 4px; min-height: 150px; background: #fff8e1;"></div>
          </div>
          <!-- 오른쪽: 최종 결과 -->
          <div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #333;">
              Final Result
              <span class="badge" style="font-size: 0.75rem; background: #4caf50;">Complete</span>
            </h3>
            <div id="dom-preview-final" style="padding: 1rem; border: 2px solid #4caf50; border-radius: 4px; min-height: 150px; background: #f1f8e9;"></div>
          </div>
        </div>
      </section>
  `})));b.addRoute("/",le);b.addRoute("/reconciliation",ye);const Ee=te(()=>{const t=document.getElementById("root");if(!t)return;const e=b.target;t.innerHTML=e()});function ve(){b.subscribe(Ee)}function be(){console.log("🚀 애플리케이션이 시작되었습니다."),ee(),console.log("✅ 애플리케이션 이벤트 등록 완료"),G(),ve(),console.log("✅ 렌더링 시스템 초기화 완료"),b.start(),console.log("✅ 렌더링 설정 완료")}be();
