import { expect, describe, it, vi } from "vitest";
import { Email, setApiKey, setDefaultSender } from "../sdk";
import { send } from "@sendgrid/mail";

vi.mock("string-template", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("string-template")>();
  return {
    ...module_,
  };
});

vi.mock("@sendgrid/mail", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("@sendgrid/mail")>();
  return {
    ...module_,
    setApiKey: vi.fn(),
    send: vi.fn(),
  };
});

describe("email", () => {
  it.concurrent("should throw if no api key is set", async () => {
    await expect(new Email().send()).rejects.toThrowError(/API Key/);
  });

  it.concurrent("should send email", async () => {
    setApiKey("SG.123");
    const email = new Email()
      .from("noreply@example.com")
      .to("test@example.com")
      .subject("Test")
      .message("Hello World");

    await email.send();
    expect(send).toHaveBeenCalled();
  });
});

describe("helper functions", () => {
  describe("setDefaultSender", () => {
    it.concurrent("should set default sender", async () => {
      setDefaultSender("test@mail.com");
    });
  });
});
