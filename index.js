// -------------------------------------------------------------------
// 1. createElement / VNode 정의
// -------------------------------------------------------------------
/**
 * VNode 구조 (새 버전):
 * {
 *   type: string | function,
 *   props: { ... },       // children 없음
 *   children: VNode[]     // 여기로 분리
 * }
 */
function createElement(type, originProps, ...rawChildren) {
  const props = originProps || {};

  const flattenChildren = (children) => {
    const result = [];
    for (const child of children) {
      if (Array.isArray(child)) {
        result.push(...flattenChildren(child));
      } else {
        result.push(child);
      }
    }
    return result;
  };

  const flatChildren = flattenChildren(rawChildren).filter(
    (child) => child !== null && child !== undefined && child !== false
  );

  const normalizedChildren = flatChildren.map((child) => {
    if (typeof child === "string" || typeof child === "number") {
      // TEXT_ELEMENT도 children은 바깥에 분리
      return {
        type: "TEXT_ELEMENT",
        props: { nodeValue: String(child) },
        children: [],
      };
    }
    return child;
  });

  return {
    type,
    props,
    children: normalizedChildren,
  };
}

// -------------------------------------------------------------------
// 2. 간단한 렌더러 (VNode -> 실제 DOM)
// -------------------------------------------------------------------
function render(vnode, container) {
  container.innerHTML = "";
  const dom = createDom(vnode);
  if (dom) container.appendChild(dom);
}

function createDom(vnode) {
  if (vnode == null) return null;

  // 텍스트 노드
  if (vnode.type === "TEXT_ELEMENT") {
    return document.createTextNode(vnode.props.nodeValue);
  }

  // 함수 컴포넌트 (확장용)
  if (typeof vnode.type === "function") {
    const childVNode = vnode.type(vnode.props || {});
    return createDom(childVNode);
  }

  // 일반 DOM 요소
  const dom = document.createElement(vnode.type);
  const { children = [], ...rest } = vnode.props || {};

  Object.entries(rest).forEach(([key, value]) => {
    if (key === "className") {
      dom.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.toLowerCase().slice(2);
      dom.addEventListener(eventType, value);
    } else {
      dom.setAttribute(key, value);
    }
  });

  children.forEach((child) => {
    const childDom = createDom(child);
    if (childDom) dom.appendChild(childDom);
  });

  return dom;
}

// -------------------------------------------------------------------
// 3. JSX 흉내 파서: "<div id="바다" room={"sea"}>바다</div>" → VNode
// -------------------------------------------------------------------
function jsxLikeToVNode(code) {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("입력이 비어 있습니다.");
  }

  // <tagName attrs>children</tagName> 패턴만 지원
  const tagMatch = /^<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*)<\/\1>$/.exec(trimmed);
  if (!tagMatch) {
    throw new Error("지금 파서는 <tag ...>children</tag> 한 가지 형태만 지원합니다.");
  }

  const [, tagName, rawAttrs, rawChildren] = tagMatch;

  const props = parseAttributes(rawAttrs);
  const children = parseChildren(rawChildren);

  return createElement(tagName, props, ...children);
}

// 속성 파싱: name="text" / name={expr} 형태만
function parseAttributes(attrStr) {
  const props = {};
  if (!attrStr || !attrStr.trim()) return props;

  // name=value 전체를 찾는다
  const regex = /([A-Za-z_][A-Za-z0-9_]*)=({[^}]*}|"[^"]*")/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    const [, name, rawValue] = match;
    let value;

    if (rawValue.startsWith("{")) {
      // { ... } 형태 → 안의 표현식 파싱
      const inner = rawValue.slice(1, -1).trim();
      value = parseJsExpression(inner);
    } else if (rawValue.startsWith('"')) {
      // "..." 문자열
      value = rawValue.slice(1, -1);
    }

    // class -> className 매핑
    const propName = name === "class" ? "className" : name;
    props[propName] = value;
  }

  return props;
}

// { ... } 안의 JS 흉내 표현식 파싱
function parseJsExpression(src) {
  const trimmed = src.trim();

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  // 숫자
  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;

  // 문자열 리터럴 "..." or '...'
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  // 그 외는 그냥 문자열로 둔다 (간단 버전)
  return trimmed;
}

// children 파싱: 지금은 텍스트만 지원
// children 파싱: Fragment(<>...</>) + 여러 형제 태그 지원 (단순 버전)
function parseChildren(childrenStr) {
  const trimmed = childrenStr.trim();
  if (!trimmed) return [];

  let content = trimmed;

  // 1. Fragment(<>...</>)로 감싸져 있으면 껍데기 제거
  const fragMatch = /^<>\s*([\s\S]*)\s*<\/>$/.exec(content);
  if (fragMatch) {
    content = fragMatch[1]; // <>와 </> 사이만 남김
  } else if (!trimmed.startsWith("<")) {
    // 태그로 안 시작하면 걍 텍스트 하나
    // (createElement에서 TEXT_ELEMENT로 변환됨)
    return [trimmed];
  }

  // 2. 이제 content 안에는 <div>...</div><div>...</div> 같은 형제 태그들만 있다고 가정
  const children = [];
  const tagRegex = /<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const fullTag = match[0]; // 전체 "<div ...>...</div>"
    const vnode = jsxLikeToVNode(fullTag); // 재귀 파싱
    children.push(vnode);
  }

  return children;
}

// -------------------------------------------------------------------
// 4. UI 바인딩
// -------------------------------------------------------------------
const jsxInputEl = document.getElementById("jsx-input");
const vnodeViewerEl = document.getElementById("vnode-viewer");
const domPreviewEl = document.getElementById("dom-preview");

const replacer = (key, value) => {
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  return value;
};

function updateFromInput() {
  const code = jsxInputEl.value.trim();
  if (!code) {
    vnodeViewerEl.textContent = "";
    domPreviewEl.innerHTML = "";
    return;
  }

  try {
    const vnode = jsxLikeToVNode(code);
    vnodeViewerEl.textContent = JSON.stringify(vnode, replacer, 2);
    render(vnode, domPreviewEl);
  } catch (err) {
    vnodeViewerEl.textContent = `파싱 에러: ${err.message}`;
    domPreviewEl.innerHTML = "";
  }
}

jsxInputEl.addEventListener("input", updateFromInput);

// 초기 예제 값 세팅
jsxInputEl.value = '<div id="바다" room={"sea"}>바다</div>';
updateFromInput();
