import { withLifecycle } from "../router";
import { loadReconciliation } from "../services/reconciliationService.js";
import { PageWrapper } from "./PageWrapper.js";

export const ReconciliationPage = withLifecycle(
  {
    didMount: () => {
      loadReconciliation();
    },
  },
  () => {
    console.log("🔄 Reconciliation 페이지 로드");
    return PageWrapper({
      children: `
      <!-- Old VNode 입력 -->
      <section class="panel">
        <h2>
          Old JSX (이전 상태)
          <span class="badge">Before</span>
        </h2>
        <textarea
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

      <!-- DOM 결과 및 애니메이션 -->
      <section class="panel" style="grid-column: 1 / span 2">
        <h2>
          DOM Result
          <span class="badge">Real DOM</span>
        </h2>
        <div style="margin-bottom: 1rem;">
          <button id="play-btn" style="padding: 0.5rem 1rem; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; font-weight: bold;">
            ▶ 단계별 실행
          </button>
          <button id="reset-btn" style="padding: 0.5rem 1rem; cursor: pointer; background: #6c757d; color: white; border: none; border-radius: 4px; margin-left: 0.5rem;">
            🔄 리셋
          </button>
          <span id="step-info" style="margin-left: 1rem; color: #666;"></span>
        </div>
        <div id="dom-preview" style="padding: 1rem; border: 2px solid #e0e0e0; border-radius: 4px; min-height: 100px; background: #fafafa;"></div>
      </section>
  `,
    });
  }
);
