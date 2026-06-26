export const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const AGENT_COLORS: Record<string, string> = {
  '김대리': COLORS.cyan,
  '박사원': COLORS.green,
  '이주임': COLORS.magenta,
};

export function logAgentAction(agentName: string, actionText: string) {
  const time = new Date().toLocaleTimeString('ko-KR');
  const color = AGENT_COLORS[agentName] || COLORS.yellow;
  console.log(`${COLORS.gray}[${time}]${COLORS.reset} ${color}[${agentName}]${COLORS.reset} ${actionText}`);
}

export function logSystem(msg: string) {
  const time = new Date().toLocaleTimeString('ko-KR');
  console.log(`${COLORS.gray}[${time}] [시스템]${COLORS.reset} ${msg}`);
}
