export interface MessageContent {
  content_type: string;
  parts?: string[];
  content?: string;
}

export interface MessageMetadata {
  is_visually_hidden_from_conversation?: boolean;
}

export interface ConversationMessage {
  id: string;
  author: {
    role: "user" | "assistant" | "system";
    name: string | null;
  };
  content: MessageContent;
  create_time: number | null;
  status: string;
  metadata: MessageMetadata;
}

export interface ConversationNode {
  id: string;
  message: ConversationMessage | null;
  parent: string | null;
  children: string[];
}

export interface ConversationMapping {
  [key: string]: ConversationNode;
}

export interface ConversationData {
  title: string;
  mapping: ConversationMapping;
  current_node: string;
}

export function isVisibleMessage(msg: ConversationMessage): boolean {
  // Skip hidden messages
  if (msg.metadata.is_visually_hidden_from_conversation) {
    return false;
  }

  // Only include text content type with actual content
  if (msg.content.content_type !== "text") {
    return false;
  }

  // Must have parts with content
  if (!msg.content.parts || msg.content.parts.length === 0) {
    return false;
  }

  // Skip empty parts
  const hasContent = msg.content.parts.some((part) => part.trim().length > 0);
  if (!hasContent) {
    return false;
  }

  return true;
}

export function formatConversation(data: ConversationData): string {
  const lines: string[] = [];
  lines.push(`# ${data.title}`);
  lines.push("");

  const mapping = data.mapping;

  // Build path from current_node back to root, then reverse
  const nodePath: string[] = [];
  let nodeId: string | null = data.current_node;

  while (nodeId) {
    nodePath.unshift(nodeId);
    const node: ConversationNode | undefined = mapping[nodeId];
    nodeId = node?.parent ?? null;
  }

  // Collect visible messages in order
  for (const id of nodePath) {
    const node = mapping[id];
    if (!node.message) continue;

    const msg = node.message;

    // Skip system messages and hidden messages
    if (msg.author.role === "system") continue;
    if (!isVisibleMessage(msg)) continue;

    const role = msg.author.role === "user" ? "User" : "Assistant";
    const content = msg.content.parts!.join("\n");

    lines.push(`## ${role}`);
    lines.push("");
    lines.push(content);
    lines.push("");
  }

  return lines.join("\n");
}
