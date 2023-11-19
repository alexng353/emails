import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentType, Email, setApiKey } from "../../sdk";
import { faker } from "@faker-js/faker";
import { send } from "@sendgrid/mail";

vi.mock("@sendgrid/mail", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("@sendgrid/mail")>();
  return {
    ...module_,
    setApiKey: vi.fn(),
    send: vi.fn(),
  };
});

describe("Content Type", () => {
  setApiKey("SG.123");
  it.concurrent("should default to plain text", () => {
    const email = new Email();
    expect(email.toJSON().content_type).toBe(ContentType.TEXT);
  });

  it.concurrent("should allow setting content type", () => {
    const email = new Email();
    email.contentType(ContentType.HTML);
    expect(email.toJSON().content_type).toBe(ContentType.HTML);
  });

  it.concurrent("Should allow setting content type multiple times", () => {
    const email = new Email();
    email.contentType(ContentType.HTML);
    expect(email.toJSON().content_type).toBe(ContentType.HTML);
    email.contentType(ContentType.TEXT);
    expect(email.toJSON().content_type).toBe(ContentType.TEXT);
  });

  it.concurrent("Should allow setting content type in constructor", () => {
    const email = new Email({ content_type: ContentType.HTML });
    expect(email.toJSON().content_type).toBe(ContentType.HTML);
  });

  describe("Send with different content types", () => {
    let to = faker.internet.email();
    let from = faker.internet.email();
    let subject = faker.lorem.sentence();
    let message = faker.lorem.paragraph();

    beforeEach(() => {
      vi.resetAllMocks();
      to = faker.internet.email();
      from = faker.internet.email();
      subject = faker.lorem.sentence();
      message = faker.lorem.paragraph();
    });

    it.concurrent("Should send plain text", async () => {
      const email = new Email()
        .to(to)
        .from(from)
        .subject(subject)
        .message(message);

      await email.send();
      expect(send).toHaveBeenCalledWith({
        to,
        from,
        subject,
        text: message,
      });
    });

    it.concurrent("Should send html", async () => {
      const email = new Email()
        .to(to)
        .from(from)
        .subject(subject)
        .message(message)
        .contentType(ContentType.HTML);

      await email.send();
      expect(send).toHaveBeenCalledWith({ to, from, subject, html: message });
    });

    it.concurrent(
      "should send the correct content type after changing it",
      async () => {
        const email = new Email()
          .to(to)
          .from(from)
          .subject(subject)
          .message(message)
          .contentType(ContentType.HTML);

        await email.send();
        expect(send).toHaveBeenCalledWith({
          to,
          from,
          subject,
          html: message,
        });

        email.contentType(ContentType.TEXT);
        await email.send();
        expect(send).toHaveBeenCalledWith({
          to,
          from,
          subject,
          text: message,
        });
      }
    );

    it.concurrent(
      "should send the correct content type after changing it in constructor",
      async () => {
        const email = new Email({
          to,
          from,
          subject,
          text: message,
          content_type: ContentType.HTML,
        });

        await email.send();
        expect(send).toHaveBeenCalledWith({
          to,
          from,
          subject,
          html: message,
        });

        email.contentType(ContentType.TEXT);
        await email.send();
        expect(send).toHaveBeenCalledWith({
          to,
          from,
          subject,
          text: message,
        });
      }
    );
  });
});
