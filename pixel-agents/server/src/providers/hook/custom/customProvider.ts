import { AgentEvent, HookProvider } from '../../../../../core/src/provider.js';

function normalizeHookEvent(
  raw: Record<string, unknown>,
): { sessionId: string; event: AgentEvent } | null {
  const eventName = raw.hook_event_name;
  const sessionId = raw.session_id as string;
  if (typeof eventName !== 'string' || !sessionId) return null;

  switch (eventName) {
    case 'node_start':
      return {
        sessionId,
        event: {
          kind: 'toolStart',
          toolId: (raw.node as string) || `hook-${Date.now()}`,
          toolName: (raw.node as string) || 'unknown_node',
        },
      };
    case 'node_end':
      return { sessionId, event: { kind: 'toolEnd', toolId: 'current' } };
    case 'workflow_end':
      return { sessionId, event: { kind: 'turnEnd' } };
    case 'session_start':
      return { sessionId, event: { kind: 'sessionStart' } };
    default:
      return null;
  }
}

export const customProvider: HookProvider = {
  kind: 'hook',
  id: 'custom',
  displayName: 'Edu Custom Agent',
  protocolVersion: 1,

  normalizeHookEvent,

  installHooks: async () => {},
  uninstallHooks: async () => {},
  areHooksInstalled: async () => true,

  formatToolStatus: (toolName: string) => `Running ${toolName}...`,
  permissionExemptTools: new Set(),
  subagentToolNames: new Set(),
  readingTools: new Set(['retrieve_docs', 'search_db']),
};
