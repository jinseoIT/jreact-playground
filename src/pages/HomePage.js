import { withLifecycle } from "../router";
import { loadHome } from "../services/homeService.js";
import { PageWrapper } from "./PageWrapper.js";

export const HomePage = withLifecycle(
  {
    didMount: () => {
      loadHome();
    },
  },
  () => {
    console.log("🏠 홈 페이지 로드");
    return PageWrapper({
      children: `
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
  `,
    });
  }
);
