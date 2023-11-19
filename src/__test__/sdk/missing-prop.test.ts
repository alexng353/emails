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

describe("Email Missing Props", () => {
  it("should throw if `from` is missing", async () => {
    setApiKey("SG.123");

    const email = new Email()
      // .from("noreply@example.com")
      .to("test@example.com")
      .subject("Test")
      .message("Hello World");

    try {
      await email.send();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).toMatch(/invalid email/);

      if (!(error.cause instanceof Error)) throw error;
      expect(typeof error.cause.message).toBe("string");
      expect(error.cause.message).toMatch(/from/);
    }
  });

  it("should throw if `to` is missing", async () => {
    setApiKey("SG.123");

    const email = new Email()
      .from("noreply@example.com")
      // .to("test@example.com")
      .subject("Test")
      .message("Hello World");

    try {
      await email.send();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).toMatch(/invalid email/);

      if (!(error.cause instanceof Error)) throw error;
      expect(typeof error.cause.message).toBe("string");
      expect(error.cause.message).toMatch(/to/);
    }
  });

  it("should throw if `subject` is missing", async () => {
    setApiKey("SG.123");

    const email = new Email()
      .from("noreply@example.com")
      .to("test@example.com")
      // .subject("Test")
      .message("Hello World");

    try {
      await email.send();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).toMatch(/invalid email/);

      if (!(error.cause instanceof Error)) throw error;
      expect(typeof error.cause.message).toBe("string");
      expect(error.cause.message).toMatch(/subject/);
    }
  });

  it("should throw if `message` is missing", async () => {
    setApiKey("SG.123");

    const email = new Email()
      .from("noreply@example.com")
      .to("test@example.com")
      .subject("Test");
    // .message("Hello World");

    try {
      await email.send();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).toMatch(/invalid email/);

      if (!(error.cause instanceof Error)) throw error;
      expect(typeof error.cause.message).toBe("string");
      expect(error.cause.message).toMatch(/message/);
    }
  });
});
