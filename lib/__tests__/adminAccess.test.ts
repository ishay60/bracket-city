import { describe, expect, it } from "vitest";
import { isAdminEnabled } from "../adminAccess";

describe("isAdminEnabled", () => {
  it("enables admin for the local workspace", () => {
    expect(isAdminEnabled({ NEXT_PUBLIC_WORKSPACE: "local" })).toBe(true);
  });

  it("disables admin outside the local workspace", () => {
    expect(isAdminEnabled({ NEXT_PUBLIC_WORKSPACE: "production" })).toBe(false);
  });

  it("prefers the server workspace env when present", () => {
    expect(
      isAdminEnabled({
        WORKSPACE: "local",
        NEXT_PUBLIC_WORKSPACE: "production",
      }),
    ).toBe(true);
  });
});
