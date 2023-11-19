import { expect, describe, it, vi } from "vitest";
import { Mailer } from "../../sdk";
import faker from "@faker-js/faker";

describe("Mailer.build()", () => {
  it("should throw an error if subject not set", () => {
    const mailer = new Mailer();
    expect(() => mailer.build()).to.throw();
  });

  it("should throw an error if message not set", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    expect(() => mailer.build()).to.throw();
  });

  it("should throw an error if from not set", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    mailer.message("Hello {email}!");
    expect(() => mailer.build()).to.throw();
  });

  it("should throw an error if no recipients", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    mailer.message("Hello {email}!");
    mailer.from("test@mail.com");

    expect(() => mailer.build()).to.throw();
  });
});
