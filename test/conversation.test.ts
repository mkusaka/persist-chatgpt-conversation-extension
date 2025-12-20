import { describe, expect, it } from "vitest";
import {
  formatConversation,
  isVisibleMessage,
  type ConversationData,
  type ConversationMessage,
} from "../src/lib/conversation";

describe("isVisibleMessage", () => {
  const baseMessage: ConversationMessage = {
    id: "test-id",
    author: { role: "user", name: null },
    content: { content_type: "text", parts: ["Hello"] },
    create_time: 1234567890,
    status: "finished_successfully",
    metadata: {},
  };

  it("returns true for visible text message with content", () => {
    expect(isVisibleMessage(baseMessage)).toBe(true);
  });

  it("returns false for hidden messages", () => {
    const msg: ConversationMessage = {
      ...baseMessage,
      metadata: { is_visually_hidden_from_conversation: true },
    };
    expect(isVisibleMessage(msg)).toBe(false);
  });

  it("returns false for non-text content types", () => {
    const thoughtsMsg: ConversationMessage = {
      ...baseMessage,
      content: { content_type: "thoughts", parts: ["thinking..."] },
    };
    expect(isVisibleMessage(thoughtsMsg)).toBe(false);

    const reasoningMsg: ConversationMessage = {
      ...baseMessage,
      content: {
        content_type: "reasoning_recap",
        content: "Thought for a few seconds",
      },
    };
    expect(isVisibleMessage(reasoningMsg)).toBe(false);
  });

  it("returns false for messages without parts", () => {
    const msg: ConversationMessage = {
      ...baseMessage,
      content: { content_type: "text" },
    };
    expect(isVisibleMessage(msg)).toBe(false);
  });

  it("returns false for messages with empty parts", () => {
    const msg: ConversationMessage = {
      ...baseMessage,
      content: { content_type: "text", parts: [] },
    };
    expect(isVisibleMessage(msg)).toBe(false);
  });

  it("returns false for messages with only whitespace", () => {
    const msg: ConversationMessage = {
      ...baseMessage,
      content: { content_type: "text", parts: ["", "   ", "\n"] },
    };
    expect(isVisibleMessage(msg)).toBe(false);
  });
});

describe("formatConversation", () => {
  it("formats a simple conversation with user and assistant", () => {
    const data: ConversationData = {
      title: "Test Conversation",
      current_node: "msg-3",
      mapping: {
        root: {
          id: "root",
          message: null,
          parent: null,
          children: ["msg-1"],
        },
        "msg-1": {
          id: "msg-1",
          message: {
            id: "msg-1",
            author: { role: "user", name: null },
            content: { content_type: "text", parts: ["Hello!"] },
            create_time: 1234567890,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "root",
          children: ["msg-2"],
        },
        "msg-2": {
          id: "msg-2",
          message: {
            id: "msg-2",
            author: { role: "assistant", name: null },
            content: { content_type: "text", parts: ["Hi there!"] },
            create_time: 1234567891,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "msg-1",
          children: ["msg-3"],
        },
        "msg-3": {
          id: "msg-3",
          message: {
            id: "msg-3",
            author: { role: "user", name: null },
            content: { content_type: "text", parts: ["How are you?"] },
            create_time: 1234567892,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "msg-2",
          children: [],
        },
      },
    };

    const result = formatConversation(data);
    expect(result).toBe(`# Test Conversation

## User

Hello!

## Assistant

Hi there!

## User

How are you?
`);
  });

  it("skips system messages", () => {
    const data: ConversationData = {
      title: "System Test",
      current_node: "msg-2",
      mapping: {
        root: {
          id: "root",
          message: null,
          parent: null,
          children: ["sys-1"],
        },
        "sys-1": {
          id: "sys-1",
          message: {
            id: "sys-1",
            author: { role: "system", name: null },
            content: { content_type: "text", parts: ["System prompt"] },
            create_time: null,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "root",
          children: ["msg-1"],
        },
        "msg-1": {
          id: "msg-1",
          message: {
            id: "msg-1",
            author: { role: "user", name: null },
            content: { content_type: "text", parts: ["Hello"] },
            create_time: 1234567890,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "sys-1",
          children: ["msg-2"],
        },
        "msg-2": {
          id: "msg-2",
          message: {
            id: "msg-2",
            author: { role: "assistant", name: null },
            content: { content_type: "text", parts: ["Hi"] },
            create_time: 1234567891,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "msg-1",
          children: [],
        },
      },
    };

    const result = formatConversation(data);
    expect(result).not.toContain("System prompt");
    expect(result).toContain("## User");
    expect(result).toContain("Hello");
  });

  it("skips hidden messages", () => {
    const data: ConversationData = {
      title: "Hidden Test",
      current_node: "msg-2",
      mapping: {
        root: {
          id: "root",
          message: null,
          parent: null,
          children: ["hidden-1"],
        },
        "hidden-1": {
          id: "hidden-1",
          message: {
            id: "hidden-1",
            author: { role: "user", name: null },
            content: { content_type: "text", parts: ["Hidden message"] },
            create_time: null,
            status: "finished_successfully",
            metadata: { is_visually_hidden_from_conversation: true },
          },
          parent: "root",
          children: ["msg-1"],
        },
        "msg-1": {
          id: "msg-1",
          message: {
            id: "msg-1",
            author: { role: "user", name: null },
            content: { content_type: "text", parts: ["Visible message"] },
            create_time: 1234567890,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "hidden-1",
          children: ["msg-2"],
        },
        "msg-2": {
          id: "msg-2",
          message: {
            id: "msg-2",
            author: { role: "assistant", name: null },
            content: { content_type: "text", parts: ["Response"] },
            create_time: 1234567891,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "msg-1",
          children: [],
        },
      },
    };

    const result = formatConversation(data);
    expect(result).not.toContain("Hidden message");
    expect(result).toContain("Visible message");
  });

  it("skips non-text content types like thoughts and reasoning_recap", () => {
    const data: ConversationData = {
      title: "Thinking Test",
      current_node: "msg-3",
      mapping: {
        root: {
          id: "root",
          message: null,
          parent: null,
          children: ["msg-1"],
        },
        "msg-1": {
          id: "msg-1",
          message: {
            id: "msg-1",
            author: { role: "user", name: null },
            content: { content_type: "text", parts: ["Question?"] },
            create_time: 1234567890,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "root",
          children: ["thoughts-1"],
        },
        "thoughts-1": {
          id: "thoughts-1",
          message: {
            id: "thoughts-1",
            author: { role: "assistant", name: null },
            content: { content_type: "thoughts", parts: [] },
            create_time: 1234567891,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "msg-1",
          children: ["recap-1"],
        },
        "recap-1": {
          id: "recap-1",
          message: {
            id: "recap-1",
            author: { role: "assistant", name: null },
            content: {
              content_type: "reasoning_recap",
              content: "Thought for a few seconds",
            },
            create_time: 1234567892,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "thoughts-1",
          children: ["msg-3"],
        },
        "msg-3": {
          id: "msg-3",
          message: {
            id: "msg-3",
            author: { role: "assistant", name: null },
            content: { content_type: "text", parts: ["Answer!"] },
            create_time: 1234567893,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "recap-1",
          children: [],
        },
      },
    };

    const result = formatConversation(data);
    expect(result).not.toContain("Thought for a few seconds");
    expect(result).toContain("Question?");
    expect(result).toContain("Answer!");
  });

  it("handles multi-part messages", () => {
    const data: ConversationData = {
      title: "Multi-part Test",
      current_node: "msg-1",
      mapping: {
        root: {
          id: "root",
          message: null,
          parent: null,
          children: ["msg-1"],
        },
        "msg-1": {
          id: "msg-1",
          message: {
            id: "msg-1",
            author: { role: "user", name: null },
            content: {
              content_type: "text",
              parts: ["Part 1", "Part 2", "Part 3"],
            },
            create_time: 1234567890,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "root",
          children: [],
        },
      },
    };

    const result = formatConversation(data);
    expect(result).toContain("Part 1\nPart 2\nPart 3");
  });

  it("formats the actual ChatGPT response structure correctly", () => {
    const data: ConversationData = {
      title: "肌白いことわざ",
      current_node: "6e5f8b04-f106-4e47-adc4-9ee0af2894b7",
      mapping: {
        "70538bba-ba23-44cc-bcc2-5a94cf397d59": {
          id: "70538bba-ba23-44cc-bcc2-5a94cf397d59",
          message: null,
          parent: null,
          children: ["9eaccdf0-3186-4d3a-89bc-177ce59361bb"],
        },
        "9eaccdf0-3186-4d3a-89bc-177ce59361bb": {
          id: "9eaccdf0-3186-4d3a-89bc-177ce59361bb",
          message: {
            id: "9eaccdf0-3186-4d3a-89bc-177ce59361bb",
            author: { role: "system", name: null },
            content: { content_type: "text", parts: [""] },
            create_time: null,
            status: "finished_successfully",
            metadata: { is_visually_hidden_from_conversation: true },
          },
          parent: "70538bba-ba23-44cc-bcc2-5a94cf397d59",
          children: ["bbb21ae0-0b66-4f3a-a424-b7cf116079e1"],
        },
        "bbb21ae0-0b66-4f3a-a424-b7cf116079e1": {
          id: "bbb21ae0-0b66-4f3a-a424-b7cf116079e1",
          message: {
            id: "bbb21ae0-0b66-4f3a-a424-b7cf116079e1",
            author: { role: "user", name: null },
            content: {
              content_type: "text",
              parts: ["肌が白いと得するみたいなことわざある？"],
            },
            create_time: 1766217921.3838,
            status: "finished_successfully",
            metadata: { is_visually_hidden_from_conversation: false },
          },
          parent: "9eaccdf0-3186-4d3a-89bc-177ce59361bb",
          children: ["6c815934-0c22-4c1c-83c6-cdec3be0dc8d"],
        },
        "6c815934-0c22-4c1c-83c6-cdec3be0dc8d": {
          id: "6c815934-0c22-4c1c-83c6-cdec3be0dc8d",
          message: {
            id: "6c815934-0c22-4c1c-83c6-cdec3be0dc8d",
            author: { role: "assistant", name: null },
            content: { content_type: "thoughts", parts: [] },
            create_time: 1766217923.757705,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "bbb21ae0-0b66-4f3a-a424-b7cf116079e1",
          children: ["8c62bbf7-bf6a-4a11-b143-3ba58af4eab6"],
        },
        "8c62bbf7-bf6a-4a11-b143-3ba58af4eab6": {
          id: "8c62bbf7-bf6a-4a11-b143-3ba58af4eab6",
          message: {
            id: "8c62bbf7-bf6a-4a11-b143-3ba58af4eab6",
            author: { role: "assistant", name: null },
            content: {
              content_type: "reasoning_recap",
              content: "Thought for a few seconds",
            },
            create_time: 1766217927.110645,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "6c815934-0c22-4c1c-83c6-cdec3be0dc8d",
          children: ["6e5f8b04-f106-4e47-adc4-9ee0af2894b7"],
        },
        "6e5f8b04-f106-4e47-adc4-9ee0af2894b7": {
          id: "6e5f8b04-f106-4e47-adc4-9ee0af2894b7",
          message: {
            id: "6e5f8b04-f106-4e47-adc4-9ee0af2894b7",
            author: { role: "assistant", name: null },
            content: {
              content_type: "text",
              parts: [
                "ある。いちばん有名なのはこれ。\n\n- **「色の白いは七難隠す」**",
              ],
            },
            create_time: 1766217921.513177,
            status: "finished_successfully",
            metadata: {},
          },
          parent: "8c62bbf7-bf6a-4a11-b143-3ba58af4eab6",
          children: [],
        },
      },
    };

    const result = formatConversation(data);

    expect(result).toBe(`# 肌白いことわざ

## User

肌が白いと得するみたいなことわざある？

## Assistant

ある。いちばん有名なのはこれ。

- **「色の白いは七難隠す」**
`);
  });
});
