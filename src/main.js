import { registerAllEvents } from "./events";
import { initRender } from "./render";
import { router } from "./router";
import { registerGlobalEvents } from "./utils/eventUtils";

function main() {
  console.log("🚀 애플리케이션이 시작되었습니다.");

  registerAllEvents();
  console.log("✅ 애플리케이션 이벤트 등록 완료");

  registerGlobalEvents(); // 전역 이벤트 리스너 등록

  initRender();
  console.log("✅ 렌더링 시스템 초기화 완료");

  router.start();
  console.log("✅ 렌더링 설정 완료");
}

main();
