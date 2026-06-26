export type ActionType = 'read' | 'write' | 'run' | 'rest';

export interface ActionDecision {
  action: ActionType;
  target: string;
  reason: string;
}

export interface MappedAction {
  toolName: string | null;
  toolInput?: Record<string, unknown>;
  logMessage: string;
  durationMs: number;
}

const FILES = ['config.ts', 'agent.ts', 'index.ts', 'server.ts', 'package.json', 'README.md'];

export function getRandomTarget(): string {
  return FILES[Math.floor(Math.random() * FILES.length)];
}

export function mapActionToOffice(agentName: string, decision: ActionDecision): MappedAction {
  const target = decision.target || getRandomTarget();
  const reason = decision.reason || '업무 처리 중';

  switch (decision.action) {
    case 'read':
      return {
        toolName: 'Read',
        toolInput: { file_path: target },
        logMessage: `📖 ${target} 파일을 살펴보고 있어요 (${reason})`,
        durationMs: 3000 + Math.floor(Math.random() * 2000),
      };
    case 'write':
      return {
        toolName: 'Edit',
        toolInput: { file_path: target },
        logMessage: `✏️ ${target} 를 수정하는 중이에요 (${reason})`,
        durationMs: 4000 + Math.floor(Math.random() * 3000),
      };
    case 'run':
      return {
        toolName: 'Bash',
        toolInput: { command: `npm run build && test ${target}` },
        logMessage: `⚙️ 빌드 및 테스트 명령을 실행하고 있어요 (${reason})`,
        durationMs: 5000 + Math.floor(Math.random() * 2000),
      };
    case 'rest':
    default:
      return {
        toolName: null, // Stop event
        logMessage: `☕ 잠깐 쉬는 중이에요 (${reason})`,
        durationMs: 2000 + Math.floor(Math.random() * 2000),
      };
  }
}
