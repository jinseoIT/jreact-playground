import { router } from "./router";
import { withBatch } from "./utils/withBatch";
import { HomePage, ReconciliationPage } from "./pages";

router.addRoute("/", HomePage);
router.addRoute("/reconciliation", ReconciliationPage);

export const render = withBatch(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  const pageComponent = router.target;

  rootElement.innerHTML = pageComponent();
});

export function initRender() {
  router.subscribe(render);
}
