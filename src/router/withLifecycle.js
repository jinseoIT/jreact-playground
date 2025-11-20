const lifeCycles = new WeakMap();
const pageState = { current: null, previous: null };
const initLifecycle = { mount: null, didMount: null, unmount: null, watches: [], deps: [], mounted: false };

// 현재 페이지 가져오기 (외부에서 사용)
export const getCurrentPage = () => pageState.current;

// 페이지의 생명주기 상태를 가져오거나 초기화
const getPageLifecycle = (page) => {
  if (!lifeCycles.has(page)) {
    lifeCycles.set(page, { ...initLifecycle });
  }
  return lifeCycles.get(page);
};

// 의존성 배열 비교 함수
const depsChanged = (newDeps, oldDeps) => {
  // 배열이 아니면 변경되지 않은 것으로 처리
  if (!Array.isArray(newDeps) || !Array.isArray(oldDeps)) {
    return false;
  }

  // 길이가 다르면 변경됨
  if (newDeps.length !== oldDeps.length) {
    return true;
  }

  // 각 요소 비교
  return newDeps.some((dep, index) => dep !== oldDeps[index]);
};

// 페이지 마운트 처리 (DOM 삽입 전)
const mount = (page) => {
  const lifecycle = getPageLifecycle(page);
  if (lifecycle.mounted) return;

  console.log(`🚀 페이지 마운트:`, page.name);

  // 마운트 콜백들 실행
  lifecycle.mount?.();
  lifecycle.mounted = true;
  lifecycle.deps = [];
};

// DOM 삽입 후 처리
export const didMountPage = (page) => {
  const lifecycle = getPageLifecycle(page);
  console.log(`✅ DOM 삽입 완료:`, page.name);
  lifecycle.didMount?.();
};

// 페이지 언마운트 처리
const unmount = (pageFunction) => {
  const lifecycle = getPageLifecycle(pageFunction);

  if (!lifecycle.mounted) return;

  console.log(`🔻 페이지 언마운트:`, pageFunction.name);

  // 언마운트 콜백들 실행
  lifecycle.unmount?.();
  lifecycle.mounted = false;
};

export const withLifecycle = ({ onMount, didMount, onUnmount, watches } = {}, page) => {
  const lifecycle = getPageLifecycle(page);
  if (typeof onMount === "function") {
    lifecycle.mount = onMount;
  }

  if (typeof didMount === "function") {
    lifecycle.didMount = didMount;
  }

  if (typeof onUnmount === "function") {
    lifecycle.unmount = onUnmount;
  }

  if (Array.isArray(watches)) {
    lifecycle.watches = typeof watches[0] === "function" ? [watches] : watches;
  }

  return (...args) => {
    const wasNewPage = pageState.current !== page;

    // 이전 페이지 언마운트
    if (pageState.current && wasNewPage) {
      unmount(pageState.current);
    }

    // 현재 페이지 설정
    pageState.previous = pageState.current;
    pageState.current = page;

    // 페이지 함수 실행 (HTML 문자열 생성)
    const result = page(...args);

    // DOM 렌더링 전 마운트 (onMount)
    if (wasNewPage) {
      mount(page);
    } else if (lifecycle.watches) {
      lifecycle.watches.forEach(([getDeps, callback], index) => {
        const newDeps = getDeps();

        if (depsChanged(newDeps, lifecycle.deps[index])) {
          console.log(`📊 의존성 변경 감지 (${page.name}):`, lifecycle.deps[index], "→", newDeps);
          callback();
        }

        // deps 업데이트 (이 부분이 중요!)
        lifecycle.deps[index] = Array.isArray(newDeps) ? [...newDeps] : [];
      });
    }

    // DOM이 실제로 삽입된 후 didMount 실행 (다음 틱)
    if (wasNewPage && lifecycle.didMount) {
      setTimeout(() => {
        didMountPage(page);
      }, 0);
    }

    return result;
  };
};
