import { router } from "./router";
import { withBatch } from "./utils/withBatch";
import { HomePage } from "./pages";

router.addRoute("/", HomePage);

export const render = withBatch(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  const pageComponent = router.target;

  rootElement.innerHTML = pageComponent();
});

export function initRender() {
  router.subscribe(render);
}
