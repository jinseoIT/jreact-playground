export function vdomToDom(vnode) {
  if (!vnode) return null;

  // 1) 텍스트 노드
  if (vnode.type === "TEXT_ELEMENT") {
    return document.createTextNode(vnode.props.nodeValue ?? "");
  }

  // 2) 일반 태그 노드
  const el = document.createElement(vnode.type);

  // props 적용
  const props = vnode.props || {};
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      el.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      // onClick → click
      const eventType = key.toLowerCase().slice(2);
      el.addEventListener(eventType, value);
    } else {
      el.setAttribute(key, value);
    }
  });

  // children 재귀 렌더링
  const children = vnode.children || [];
  for (const child of children) {
    const childNode = vdomToDom(child);
    if (childNode) el.appendChild(childNode);
  }

  return el;
}
