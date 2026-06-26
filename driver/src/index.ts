import { AGENTS } from './config.js';
import { AgentWorker } from './agent.js';
import { logSystem } from './logger.js';

logSystem('==================================================');
logSystem('🚀 픽셀 에이전트 오픈라우터 독립 구동기 시작');
logSystem('==================================================');

const workers: AgentWorker[] = [];

for (const conf of AGENTS) {
  const worker = new AgentWorker(conf);
  workers.push(worker);
}

// 순차적으로 약간의 시차를 두고 출근(스타트)
(async () => {
  for (let i = 0; i < workers.length; i++) {
    workers[i].start();
    await new Promise((res) => setTimeout(res, 1500));
  }
})();

// 종료 핸들러
process.on('SIGINT', () => {
  logSystem('🛑 프로그램 종료 신호 수신. 모든 에이전트 루프 중지 중...');
  for (const worker of workers) {
    worker.stop();
  }
  process.exit(0);
});
