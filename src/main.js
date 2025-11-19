import { initRender } from "./render";
import { router } from "./router";

function main() {
  console.log("🚀 애플리케이션이 시작되었습니다.");

  initRender();
  console.log("✅ 렌더링 시스템 초기화 완료");

  router.start();
  console.log("✅ 렌더링 설정 완료");

  console.log("🎉 애플리케이션 초기화 완료!");
}

main();
