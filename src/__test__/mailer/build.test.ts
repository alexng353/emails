import { expect, it, describe, vi } from "vitest";
import { Mailer } from "../../sdk";
import { faker } from "@faker-js/faker";
import format from "string-template";

vi.mock("../../sdk", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("../../sdk")>();
  return {
    ...module_,
    Email: {
      constructor: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      subject: vi.fn().mockReturnThis(),
      message: vi.fn().mockReturnThis(),
      send: vi.fn(),
    },
  };
});

vi.mock("string-template", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("string-template")>();
  return {
    ...module_,
    default: vi.fn(),
  };
});

describe("Mailer", () => {
  it("Should build if an object is passed as a recipient", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    mailer.message("Hello {email}!");
    mailer.from(faker.internet.email());

    const email = faker.internet.email();
    const name = faker.person.firstName();
    mailer.addRecipient({
      email,
      name,
    });

    mailer.build();

    expect(format).toHaveBeenCalled();
  });

  it("Should build if an email is passed as a recipient", () => {
    const mailer = new Mailer();
    mailer.subject("Hello!");
    mailer.message("Hello!");
    mailer.from(faker.internet.email());

    const email = faker.internet.email();
    mailer.addRecipient(email);

    mailer.build();

    expect(format).toHaveBeenCalled();
  });
});
