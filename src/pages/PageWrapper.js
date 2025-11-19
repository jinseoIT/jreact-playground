export const PageWrapper = ({ children }) => {
  return `
    <header>
      <h1>VNode Playground</h1>
      <span>JSX 비슷한 태그를 입력하면 VNode와 실제 DOM을 바로 확인할 수 있는 미니 도구</span>
    </header>

    <main>
      ${children}
    </main>
  `;
};
