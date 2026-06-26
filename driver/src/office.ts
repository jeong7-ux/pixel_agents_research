import { SERVER_URL } from './config.js';
import { logSystem } from './logger.js';

export async function sendOfficeHookEvent(
  sessionId: string,
  hookEventName: string,
  extra: Record<string, unknown> = {}
) {
  const url = `${SERVER_URL}/api/hooks/openrouter`;
  const payload = {
    session_id: sessionId,
    hook_event_name: hookEventName,
    ...extra,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      logSystem(`오피스 서버 신호 전송 실패 (${res.status}): ${url}`);
    }
  } catch (err) {
    const errMsg = (err as Error).message === 'fetch failed' ? '서버 연결 실패' : (err as Error).message;
    logSystem(`오피스 서버 연결 오류: ${errMsg}`);
  }
}
