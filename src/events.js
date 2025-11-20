import { router } from "./router";
import { addEvent } from "./utils/eventUtils";

export function registerNavEvents() {
  addEvent("click", ".nav_router", async (e) => {
    const page = e.target.closest("[data-page]").dataset.page;

    // 상품 상세 페이지로 이동
    router.push(page);
  });
}

/**
 * 모든 이벤트 등록
 */
export function registerAllEvents() {
  registerNavEvents();
}
