import { router } from "./router";
import { withBatch } from "./utils/withBatch";
import { didMountPage, getCurrentPage } from "./router/withLifecycle";
import { HomePage } from "./pages";

router.addRoute("/", HomePage);

export const render = withBatch(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  const pageComponent = router.target;

  rootElement.innerHTML = pageComponent();

  // DOM 삽입 후 didMount 콜백 실행 (현재 페이지 함수 가져오기)
  const currentPage = getCurrentPage();
  if (currentPage) {
    didMountPage(currentPage);
  }
});

export function initRender() {
  router.subscribe(render);
}
