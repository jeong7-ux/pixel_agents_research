import fs from 'fs';
import path from 'path';

export interface AgentConfig {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
}

export const AGENTS: AgentConfig[] = [
  {
    id: 'agent-kim',
    name: '김대리',
    model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    systemPrompt: '당신은 IT 회사의 성실하고 꼼꼼한 김대리입니다. 주로 코드나 환경 설정을 확인하고 문서화하는 작업을 좋아합니다.'
  },
  {
    id: 'agent-park',
    name: '박사원',
    model: 'meta-llama/llama-3.2-3b-instruct:free',
    systemPrompt: '당신은 열정 넘치는 신입 개발자 박사원입니다. 새로운 기능을 개발하거나 코드를 적극적으로 수정하는 작업을 좋아합니다.'
  },
  {
    id: 'agent-lee',
    name: '이주임',
    model: 'mistralai/mistral-7b-instruct:free',
    systemPrompt: '당신은 인프라와 빌드 시스템을 담당하는 이주임입니다. 터미널 명령어를 실행하거나 빌드 상태를 점검하는 작업을 좋아합니다.'
  }
];

export const SERVER_URL = process.env.PIXEL_AGENTS_SERVER || 'http://127.0.0.1:3100';

function getOpenRouterKey(): string {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  try {
    const envFile = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envFile)) {
      const match = fs.readFileSync(envFile, 'utf-8').match(/OPENROUTER_API_KEY=(.*)/);
      if (match && match[1]) return match[1].trim();
    }
  } catch (e) {}
  return 'sk-or-v1-YOUR_OPENROUTER_API_KEY_HERE';
}

export const OPENROUTER_API_KEY = getOpenRouterKey();
