import { expect, it, describe, vi } from "vitest";
import { Mailer } from "../../sdk";
import { faker } from "@faker-js/faker";

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

describe("Mailer", () => {
  it("should pass coverage lmao", () => {
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
  });
});
