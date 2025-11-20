// -------------------------------------------------------------------
// 1. Diff 알고리즘: 두 VNode 비교 및 Patch 생성
// -------------------------------------------------------------------

// Patch 타입 정의
const PATCH_TYPE = {
  REPLACE: "REPLACE", // 노드 전체 교체
  UPDATE_TEXT: "UPDATE_TEXT", // 텍스트 내용 변경
  UPDATE_PROPS: "UPDATE_PROPS", // 속성 변경
  REMOVE: "REMOVE", // 노드 제거
  ADD: "ADD", // 노드 추가
};

/**
 * 두 VNode를 비교하여 필요한 패치 목록 생성
 */
function diff(oldVNode, newVNode, patches = [], path = []) {
  // 1. 새 노드가 없으면 제거
  if (!newVNode) {
    patches.push({
      type: PATCH_TYPE.REMOVE,
      path: [...path],
      description: `노드 제거: ${getNodeDescription(oldVNode)}`,
    });
    return patches;
  }

  // 2. 이전 노드가 없으면 추가
  if (!oldVNode) {
    patches.push({
      type: PATCH_TYPE.ADD,
      path: [...path],
      node: newVNode,
      description: `노드 추가: ${getNodeDescription(newVNode)}`,
    });
    return patches;
  }

  // 3. 타입이 다르면 전체 교체
  if (oldVNode.type !== newVNode.type) {
    patches.push({
      type: PATCH_TYPE.REPLACE,
      path: [...path],
      oldNode: oldVNode,
      newNode: newVNode,
      description: `노드 교체: <${oldVNode.type}> → <${newVNode.type}>`,
    });
    return patches;
  }

  // 4. 텍스트 노드 비교
  if (oldVNode.type === "TEXT_ELEMENT") {
    const oldText = oldVNode.props.nodeValue;
    const newText = newVNode.props.nodeValue;
    if (oldText !== newText) {
      patches.push({
        type: PATCH_TYPE.UPDATE_TEXT,
        path: [...path],
        oldText,
        newText,
        description: `텍스트 변경: "${oldText}" → "${newText}"`,
      });
    }
    return patches;
  }

  // 5. Props 비교
  const propsDiff = diffProps(oldVNode.props, newVNode.props);
  if (propsDiff.length > 0) {
    patches.push({
      type: PATCH_TYPE.UPDATE_PROPS,
      path: [...path],
      propsDiff,
      description: `속성 변경 (${propsDiff.length}개): ${propsDiff.map((p) => p.key).join(", ")}`,
    });
  }

  // 6. Children 비교 (재귀)
  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    diff(oldChildren[i], newChildren[i], patches, [...path, i]);
  }

  return patches;
}

/**
 * Props 비교
 */
function diffProps(oldProps = {}, newProps = {}) {
  const changes = [];
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of allKeys) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];

    if (oldVal !== newVal) {
      changes.push({
        key,
        oldValue: oldVal,
        newValue: newVal,
        action: oldVal === undefined ? "added" : newVal === undefined ? "removed" : "updated",
      });
    }
  }

  return changes;
}

/**
 * 노드 설명 생성 (디버깅용)
 */
function getNodeDescription(vnode) {
  if (!vnode) return "null";
  if (vnode.type === "TEXT_ELEMENT") {
    return `"${vnode.props.nodeValue}"`;
  }
  return `<${vnode.type}>`;
}

// -------------------------------------------------------------------
// 2. Patch 적용: VNode → DOM 변환 및 단계별 적용
// -------------------------------------------------------------------

/**
 * VNode를 실제 DOM으로 변환
 */
function vdomToDom(vnode) {
  if (!vnode) return null;

  if (vnode.type === "TEXT_ELEMENT") {
    return document.createTextNode(vnode.props.nodeValue ?? "");
  }

  const el = document.createElement(vnode.type);

  // Props 적용
  Object.entries(vnode.props || {}).forEach(([key, value]) => {
    if (key === "className") {
      el.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.toLowerCase().slice(2);
      el.addEventListener(eventType, value);
    } else {
      el.setAttribute(key, value);
    }
  });

  // Children 재귀 렌더링
  (vnode.children || []).forEach((child) => {
    const childNode = vdomToDom(child);
    if (childNode) el.appendChild(childNode);
  });

  return el;
}

/**
 * Path를 따라 DOM 노드 찾기
 */
function findNodeByPath(root, path) {
  let current = root;
  for (const index of path) {
    if (!current || !current.childNodes) return null;
    current = current.childNodes[index];
  }
  return current;
}

/**
 * 단일 패치를 DOM에 적용
 */
function applyPatch(rootElement, patch, oldVNode) {
  const targetNode = findNodeByPath(rootElement, patch.path);

  switch (patch.type) {
    case PATCH_TYPE.REPLACE: {
      if (targetNode && targetNode.parentNode) {
        const newDom = vdomToDom(patch.newNode);
        targetNode.parentNode.replaceChild(newDom, targetNode);
        highlightNode(newDom, "replace");
      }
      break;
    }

    case PATCH_TYPE.UPDATE_TEXT: {
      if (targetNode && targetNode.nodeType === Node.TEXT_NODE) {
        targetNode.nodeValue = patch.newText;
        highlightNode(targetNode.parentNode, "update");
      }
      break;
    }

    case PATCH_TYPE.UPDATE_PROPS: {
      if (targetNode && targetNode.nodeType === Node.ELEMENT_NODE) {
        patch.propsDiff.forEach(({ key, newValue, action }) => {
          if (action === "removed") {
            targetNode.removeAttribute(key);
          } else {
            if (key === "className") {
              targetNode.className = newValue;
            } else {
              targetNode.setAttribute(key, newValue);
            }
          }
        });
        highlightNode(targetNode, "update");
      }
      break;
    }

    case PATCH_TYPE.REMOVE: {
      if (targetNode && targetNode.parentNode) {
        highlightNode(targetNode, "remove");
        setTimeout(() => {
          if (targetNode.parentNode) {
            targetNode.parentNode.removeChild(targetNode);
          }
        }, 500);
      }
      break;
    }

    case PATCH_TYPE.ADD: {
      const parentPath = patch.path.slice(0, -1);
      const parentNode = parentPath.length ? findNodeByPath(rootElement, parentPath) : rootElement;

      if (parentNode) {
        const newDom = vdomToDom(patch.node);
        parentNode.appendChild(newDom);
        highlightNode(newDom, "add");
      }
      break;
    }
  }
}

/**
 * 노드에 애니메이션 하이라이트 효과
 */
function highlightNode(node, type) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

  const colors = {
    add: "#4caf50", // 초록
    remove: "#f44336", // 빨강
    update: "#ff9800", // 주황
    replace: "#2196f3", // 파랑
  };

  const originalBg = node.style.backgroundColor;
  node.style.backgroundColor = colors[type];
  node.style.transition = "background-color 0.3s ease";

  setTimeout(() => {
    node.style.backgroundColor = originalBg;
  }, 800);
}

// -------------------------------------------------------------------
// 3. JSX 파서 (재사용)
// -------------------------------------------------------------------

function jsxLikeToVNode(code) {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("입력이 비어 있습니다.");
  }

  const tagMatch = /^<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*)<\/\1>$/.exec(trimmed);
  if (!tagMatch) {
    throw new Error("지금 파서는 <tag ...>children</tag> 한 가지 형태만 지원합니다.");
  }

  const [, tagName, rawAttrs, rawChildren] = tagMatch;

  const props = parseAttributes(rawAttrs);
  const children = parseChildren(rawChildren);

  return createElement(tagName, props, ...children);
}

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

function parseAttributes(attrStr) {
  const props = {};
  if (!attrStr || !attrStr.trim()) return props;

  const regex = /([A-Za-z_][A-Za-z0-9_]*)=({[^}]*}|"[^"]*")/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    const [, name, rawValue] = match;
    let value;

    if (rawValue.startsWith("{")) {
      const inner = rawValue.slice(1, -1).trim();
      value = parseJsExpression(inner);
    } else if (rawValue.startsWith('"')) {
      value = rawValue.slice(1, -1);
    }

    const propName = name === "class" ? "className" : name;
    props[propName] = value;
  }

  return props;
}

function parseJsExpression(src) {
  const trimmed = src.trim();

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  return trimmed;
}

function parseChildren(childrenStr) {
  const trimmed = childrenStr.trim();
  if (!trimmed) return [];

  let content = trimmed;

  const fragMatch = /^<>\s*([\s\S]*)\s*<\/>$/.exec(content);
  if (fragMatch) {
    content = fragMatch[1];
  } else if (!trimmed.startsWith("<")) {
    return [trimmed];
  }

  const children = [];
  const tagRegex = /<([A-Za-z][A-Za-z0-9]*)\s*([^>]*)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const vnode = jsxLikeToVNode(fullTag);
    children.push(vnode);
  }

  return children;
}

// -------------------------------------------------------------------
// 4. UI 바인딩
// -------------------------------------------------------------------

const replacer = (key, value) => {
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  return value;
};

export const loadReconciliation = () => {
  const jsxOldEl = document.getElementById("jsx-old");
  const jsxNewEl = document.getElementById("jsx-new");
  const vnodeOldEl = document.getElementById("vnode-old");
  const vnodeNewEl = document.getElementById("vnode-new");
  const patchListEl = document.getElementById("patch-list");
  const domPreviewEl = document.getElementById("dom-preview");
  const playBtn = document.getElementById("play-btn");
  const resetBtn = document.getElementById("reset-btn");
  const stepInfo = document.getElementById("step-info");

  let oldVNode = null;
  let newVNode = null;
  let patches = [];
  let currentStep = 0;

  function updateVNodes() {
    const oldCode = jsxOldEl.value.trim();
    const newCode = jsxNewEl.value.trim();

    try {
      // Old VNode 파싱
      if (oldCode) {
        oldVNode = jsxLikeToVNode(oldCode);
        vnodeOldEl.textContent = JSON.stringify(oldVNode, replacer, 2);
      } else {
        oldVNode = null;
        vnodeOldEl.textContent = "";
      }

      // New VNode 파싱
      if (newCode) {
        newVNode = jsxLikeToVNode(newCode);
        vnodeNewEl.textContent = JSON.stringify(newVNode, replacer, 2);
      } else {
        newVNode = null;
        vnodeNewEl.textContent = "";
      }

      // Diff 계산
      patches = diff(oldVNode, newVNode);

      // Patch 목록 표시
      renderPatchList();

      // 초기 DOM 렌더링 (Old VNode)
      resetDOM();
    } catch (err) {
      vnodeOldEl.textContent = `파싱 에러: ${err.message}`;
      vnodeNewEl.textContent = "";
      patchListEl.innerHTML = "";
    }
  }

  function renderPatchList() {
    if (patches.length === 0) {
      patchListEl.innerHTML = '<div style="color: #4caf50;">✓ 변경사항 없음</div>';
      stepInfo.textContent = "";
      return;
    }

    const html = patches
      .map(
        (patch, i) => `
      <div style="padding: 0.5rem; margin: 0.5rem 0; background: ${
        i === currentStep ? "#fff3cd" : "#f8f9fa"
      }; border-left: 4px solid ${getPatchColor(patch.type)}; border-radius: 4px;">
        <strong>[${i + 1}] ${patch.type}</strong>: ${patch.description}
        <div style="color: #666; font-size: 0.85rem;">Path: [${patch.path.join(", ")}]</div>
      </div>
    `
      )
      .join("");

    patchListEl.innerHTML = html;
    stepInfo.textContent = `총 ${patches.length}개의 변경사항`;
  }

  function getPatchColor(type) {
    const colors = {
      REPLACE: "#2196f3",
      UPDATE_TEXT: "#ff9800",
      UPDATE_PROPS: "#ff9800",
      REMOVE: "#f44336",
      ADD: "#4caf50",
    };
    return colors[type] || "#999";
  }

  function resetDOM() {
    domPreviewEl.innerHTML = "";
    currentStep = 0;

    if (oldVNode) {
      const oldDom = vdomToDom(oldVNode);
      domPreviewEl.appendChild(oldDom);
    }

    renderPatchList();
  }

  function playNextStep() {
    if (currentStep >= patches.length) {
      alert("모든 패치가 적용되었습니다!");
      return;
    }

    const patch = patches[currentStep];
    applyPatch(domPreviewEl, patch, oldVNode);

    currentStep++;
    renderPatchList();

    if (currentStep >= patches.length) {
      stepInfo.textContent = `✓ 완료 (${patches.length}/${patches.length})`;
    } else {
      stepInfo.textContent = `진행 중 (${currentStep}/${patches.length})`;
    }
  }

  // 이벤트 리스너
  jsxOldEl.addEventListener("input", updateVNodes);
  jsxNewEl.addEventListener("input", updateVNodes);
  playBtn.addEventListener("click", playNextStep);
  resetBtn.addEventListener("click", resetDOM);

  // Tab 키 지원
  [jsxOldEl, jsxNewEl].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const value = el.value;
        el.value = value.substring(0, start) + "  " + value.substring(end);
        el.selectionStart = el.selectionEnd = start + 2;
      }
    });
  });

  // 초기 예제 값
  jsxOldEl.value = '<div id="old" class="container">이전 내용</div>';
  jsxNewEl.value = `<div id="new" class="container">
    <div id="new1" key="new1" class="container">새로운 내용</div>
    <div id="new2" key="new2" class="container">새로운 내용</div>
  </div>`;

  // 초기 렌더링
  updateVNodes();
};
