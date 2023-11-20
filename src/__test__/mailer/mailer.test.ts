import { expect, it, describe, vi } from "vitest";
import { Email, Mailer, setApiKey } from "../../sdk";
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

describe("Mailer", () => {
  it("should set properties from constructor", () => {
    const props = {
      from: faker.internet.email(),
      recipients: [faker.internet.email(), faker.internet.email()],
      subject_template: faker.lorem.sentence(),
      message_template: faker.lorem.sentence(),
      emails: [],
      template_data: [],
      subjects: [],
    };

    const mailer = new Mailer(props);

    expect(mailer.toJSON()).toEqual(props);
  });

  describe("recipients", () => {
    describe("emails", () => {
      it("should add a single recipient", () => {
        const mailer = new Mailer();
        const recipient = faker.internet.email();
        mailer.addRecipient(recipient);

        expect(mailer.toJSON().recipients).toEqual([recipient]);
      });

      it("should add multiple recipients", () => {
        const mailer = new Mailer();
        const random = Math.floor(Math.random() * 10) + 1;
        const recipients = Array.from({ length: random }, () =>
          faker.internet.email()
        );
        mailer.addRecipient(recipients);
        expect(mailer.toJSON().recipients).toEqual(recipients);
      });
    });

    describe("template_data", () => {
      it("should add a single recipient", () => {
        const mailer = new Mailer();
        const recipient = {
          email: faker.internet.email(),
          name: faker.person.firstName(),
        };
        mailer.addRecipient(recipient);

        expect(mailer.toJSON().template_data).toEqual([recipient]);
      });

      it("should add multiple recipients", () => {
        const mailer = new Mailer();
        const random = Math.floor(Math.random() * 10) + 1;
        const recipients = Array.from({ length: random }, () => ({
          email: faker.internet.email(),
          name: faker.person.firstName(),
        }));
        mailer.addRecipient(recipients);
        expect(mailer.toJSON().template_data).toEqual(recipients);
      });
    });
  });

  describe("add email", () => {
    it("should add a single email", () => {
      const mailer = new Mailer();
      const email = new Email()
        .to(faker.internet.email())
        .from(faker.internet.email())
        .subject(faker.lorem.sentence())
        .message(faker.lorem.paragraph());

      mailer.addEmail(email);

      expect((mailer as any).props.emails).toEqual([email]);
    });

    it("should add multiple emails", () => {
      const mailer = new Mailer();
      const random = Math.floor(Math.random() * 10) + 1;

      const emails = Array.from({ length: random }, () =>
        new Email()
          .to(faker.internet.email())
          .from(faker.internet.email())
          .subject(faker.lorem.sentence())
          .message(faker.lorem.paragraph())
      );

      mailer.addEmail(emails);

      expect((mailer as any).props.emails).toEqual(emails);
    });
  });

  describe("send", () => {
    it("should send emails", async () => {
      setApiKey("SG.123");
      const mailer = new Mailer();
      const email = new Email()
        .to(faker.internet.email())
        .from(faker.internet.email())
        .subject(faker.lorem.sentence())
        .message(faker.lorem.paragraph());

      mailer.addEmail(email);

      await mailer.send();
      expect(send).toHaveBeenCalled();
    });
  });
});
