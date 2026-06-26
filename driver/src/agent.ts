import type { AgentConfig } from './config.js';
import { askOpenRouterDecision } from './openrouter.js';
import { mapActionToOffice } from './actions.js';
import { sendOfficeHookEvent } from './office.js';
import { logAgentAction } from './logger.js';

export class AgentWorker {
  private currentContext = '오피스에 출근했습니다.';
  private isRunning = false;
  private toolCounter = 1;

  constructor(public readonly config: AgentConfig) {}

  async start() {
    this.isRunning = true;
    logAgentAction(this.config.name, '🚪 출근하여 세션을 시작합니다.');

    // 1. SessionStart 훅 이벤트 전송 (서버에서 캐릭터 즉시 생성)
    await sendOfficeHookEvent(this.config.id, 'SessionStart', {
      source: 'openrouter-driver',
      cwd: 'c:/Work/plan/driver',
    });

    // 상태 루프 개시
    this.loop();
  }

  stop() {
    this.isRunning = false;
  }

  private async loop() {
    while (this.isRunning) {
      // 대기 시간 (7~13초 간격으로 행동 결정)
      const delay = 7000 + Math.floor(Math.random() * 6000);
      await new Promise((res) => setTimeout(res, delay));
      if (!this.isRunning) break;

      // 2. OpenRouter 행동 결정 의뢰
      const decision = await askOpenRouterDecision(
        this.config.model,
        this.config.systemPrompt,
        this.currentContext
      );

      // 3. 오피스 전용 도구 매핑 및 로그 전송
      const mapped = mapActionToOffice(this.config.name, decision);
      logAgentAction(this.config.name, mapped.logMessage);
      this.currentContext = `직전 행동: ${decision.action} (${decision.target}) - ${decision.reason}`;

      const toolId = `tool_${this.toolCounter++}`;

      if (mapped.toolName) {
        // PreToolUse 전송 (도구 풍선 띄우고 상태를 업무 중으로 변경)
        await sendOfficeHookEvent(this.config.id, 'PreToolUse', {
          tool_id: toolId,
          tool_name: mapped.toolName,
          tool_input: mapped.toolInput || {},
        });

        // 도구 실행 시간 대기
        await new Promise((res) => setTimeout(res, mapped.durationMs));
        if (!this.isRunning) break;

        // PostToolUse 전송 (업무 완료 신호)
        await sendOfficeHookEvent(this.config.id, 'PostToolUse', {
          tool_id: toolId,
        });
      } else {
        // 휴식 또는 루프 종료 (Stop 이벤트)
        await sendOfficeHookEvent(this.config.id, 'Stop', {});
        // 휴식 시간 대기
        await new Promise((res) => setTimeout(res, mapped.durationMs));
      }
    }
  }
}
