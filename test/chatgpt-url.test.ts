import { describe, expect, it } from "vitest";
import { getConversationIdFromPath } from "../src/lib/chatgpt-url";

describe("getConversationIdFromPath", () => {
  it("returns the conversation ID for standard conversation URLs", () => {
    expect(
      getConversationIdFromPath("/c/69b9968f-3cdc-83a4-b246-5628f3b6bcdd"),
    ).toBe("69b9968f-3cdc-83a4-b246-5628f3b6bcdd");
  });

  it("returns the conversation ID for GPT-specific conversation URLs", () => {
    expect(
      getConversationIdFromPath(
        "/g/g-p-69b995716b1c81918896e351d7daaae3-pj-fuji/c/69b9968f-3cdc-83a4-b246-5628f3b6bcdd",
      ),
    ).toBe("69b9968f-3cdc-83a4-b246-5628f3b6bcdd");
  });

  it("accepts trailing slashes", () => {
    expect(
      getConversationIdFromPath("/c/69b9968f-3cdc-83a4-b246-5628f3b6bcdd/"),
    ).toBe("69b9968f-3cdc-83a4-b246-5628f3b6bcdd");
  });

  it("returns null for non-conversation URLs", () => {
    expect(getConversationIdFromPath("/")).toBeNull();
    expect(
      getConversationIdFromPath(
        "/g/g-p-69b995716b1c81918896e351d7daaae3-pj-fuji",
      ),
    ).toBeNull();
    expect(
      getConversationIdFromPath(
        "/g/g-p-69b995716b1c81918896e351d7daaae3-pj-fuji/share",
      ),
    ).toBeNull();
  });
});
