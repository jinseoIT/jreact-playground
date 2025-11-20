export const PageWrapper = ({ children }) => {
  return `
    <header>
      <h1>VNode Playground</h1>
      <span>JSX 비슷한 태그를 입력하면 VNode와 실제 DOM을 바로 확인할 수 있는 미니 도구</span>
      <nav style="margin-top: 1rem;>
        <li style="list-style:none" class="nav_router">
          <ul data-page="/" style="padding: 0.5rem 1rem; margin-right: 0.5rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">🏠 홈</ul>
          <ul data-page="/reconciliation" style="padding: 0.5rem 1rem; background: #28a745; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">🔄 Reconciliation</ul>
        </li>
      </nav>
    </header>

    <main>
      ${children}
    </main>
  `;
};
