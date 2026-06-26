import { OPENROUTER_API_KEY } from './config.js';
import type { ActionDecision, ActionType } from './actions.js';

export async function askOpenRouterDecision(
  model: string,
  systemPrompt: string,
  currentContext: string
): Promise<ActionDecision> {
  const prompt = `${systemPrompt}

현재 상황 및 직전 행동:
${currentContext}

당신은 가상 오피스 공간의 개발자 캐릭터입니다. 다음 4가지 행동 중 하나를 골라야 합니다:
- read: 특정 코드를 검토하거나 설정 파일을 살펴봄
- write: 코드를 수정하거나 새로운 기능을 추가함
- run: 테스트나 빌드 터미널 명령을 실행함
- rest: 커피를 마시며 잠깐 휴식함

반드시 아래 JSON 포맷으로만 응답하세요. 다른 설명 텍스트나 마크다운 코드블록 없이 오직 JSON만 출력해야 합니다:
{"action": "read" | "write" | "run" | "rest", "target": "파일이름이나 대상", "reason": "행동하는 간단한 이유 한 문장"}
`;

  if (!OPENROUTER_API_KEY) {
    // API 키가 없으면 목(Mock) 동작 반환
    const actions: ActionType[] = ['read', 'write', 'run', 'rest'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    return {
      action: randomAction,
      target: 'src/app.ts',
      reason: '[Mock] API 키가 없어 임의 행동을 결정합니다.'
    };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API status: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    // JSON 파싱 (코드블록 포맷 감싸져 있을 경우 보정)
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      action: parsed.action || 'read',
      target: parsed.target || 'src/index.ts',
      reason: parsed.reason || '열심히 업무하는 중'
    };
  } catch (err) {
    const fallbackActions: ActionType[] = ['read', 'write', 'run'];
    const act = fallbackActions[Math.floor(Math.random() * fallbackActions.length)];
    const targets = ['src/index.ts', 'src/components/App.tsx', 'tests/main.test.ts', 'package.json'];
    const tgt = targets[Math.floor(Math.random() * targets.length)];
    return {
      action: act,
      target: tgt,
      reason: '프로젝트 구조를 분석하고 코드를 정비하는 중입니다.'
    };
  }
}
