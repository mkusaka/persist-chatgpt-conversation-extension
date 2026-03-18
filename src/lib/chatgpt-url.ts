interface URLPatternExecResult {
  pathname: {
    groups: Record<string, string | undefined>;
  };
}

interface URLPatternLike {
  exec(input: string | { pathname: string }): URLPatternExecResult | null;
}

type URLPatternConstructorLike = new (init: {
  pathname: string;
}) => URLPatternLike;
declare const URLPattern: URLPatternConstructorLike;

const conversationPatterns = [
  new URLPattern({ pathname: "/c/:conversationId{/}?" }),
  new URLPattern({
    pathname: "/g/:gptId/c/:conversationId{/}?",
  }),
];

export function getConversationIdFromPath(pathname: string): string | null {
  for (const pattern of conversationPatterns) {
    const matched = pattern.exec({ pathname });
    const conversationId = matched?.pathname.groups.conversationId;

    if (conversationId) {
      return conversationId;
    }
  }

  return null;
}
