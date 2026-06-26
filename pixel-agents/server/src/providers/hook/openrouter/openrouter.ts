import * as path from 'path';

import { AgentEvent, HookProvider } from '../../../../../core/src/provider.js';

function normalizeHookEvent(
  raw: Record<string, unknown>,
): { sessionId: string; event: AgentEvent } | null {
  const eventName = raw.hook_event_name;
  const sessionId = raw.session_id as string;
  if (typeof eventName !== 'string' || !sessionId) return null;

  switch (eventName) {
    case 'SessionStart':
      // The server will handle this to create a hooksOnly character
      return {
        sessionId,
        event: {
          kind: 'sessionStart',
        },
      };

    case 'PreToolUse': {
      const toolName = typeof raw.tool_name === 'string' ? raw.tool_name : 'unknown';
      const toolInput = (raw.tool_input || {}) as Record<string, unknown>;
      return {
        sessionId,
        event: {
          kind: 'toolStart',
          toolId: `hook-${Date.now()}`,
          toolName,
          input: toolInput,
          runInBackground: false,
        },
      };
    }

    case 'PostToolUse':
      return { sessionId, event: { kind: 'toolEnd', toolId: 'current' } };

    case 'Stop':
      return { sessionId, event: { kind: 'turnEnd' } };

    default:
      return null;
  }
}

function formatToolStatus(toolName: string, input?: unknown): string {
  const inp = (input ?? {}) as Record<string, unknown>;
  const base = (p: unknown) => (typeof p === 'string' ? path.basename(p) : '');

  switch (toolName) {
    case 'Read':
      return `Reading ${base(inp.file_path)}`;
    case 'Edit':
      return `Editing ${base(inp.file_path)}`;
    case 'Bash':
      return `Running command...`;
    default:
      return `Working...`;
  }
}

export const openrouterProvider: HookProvider = {
  kind: 'hook',
  id: 'openrouter',
  displayName: 'OpenRouter Agent',
  protocolVersion: 1,

  normalizeHookEvent,

  installHooks: async () => {},
  uninstallHooks: async () => {},
  areHooksInstalled: async () => true,

  formatToolStatus,
  permissionExemptTools: new Set(),
  subagentToolNames: new Set(),
  readingTools: new Set(['Read']),
};
