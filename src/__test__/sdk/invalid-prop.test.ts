import { expect, describe, it, vi } from "vitest";
import { Email, setApiKey } from "../../sdk";

vi.mock("@sendgrid/mail", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("@sendgrid/mail")>();
  return {
    ...module_,
    setApiKey: vi.fn(),
    send: vi.fn(),
  };
});

describe("Invalid Email Props", () => {
  it("should throw if `from` is invalid", async () => {
    setApiKey("SG.123");

    expect(() => new Email().from("noreply(at)example.com)")).toThrowError(
      /invalid email/i
    );
  });

  it("should throw if `to` is invalid", async () => {
    setApiKey("SG.123");

    expect(() => new Email().to("test(at)example.com")).toThrowError(
      /invalid email/i
    );
  });
});
