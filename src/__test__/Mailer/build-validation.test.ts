import { expect, describe, it } from "vitest";
import { Mailer } from "../../sdk";
import { faker } from "@faker-js/faker";

describe("Mailer.build() validation", () => {
  it.concurrent("should throw an error if subject not set", () => {
    const mailer = new Mailer();
    expect(() => mailer.build()).to.throw();
  });

  it.concurrent("should throw an error if message not set", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    expect(() => mailer.build()).to.throw();
  });

  it.concurrent("should throw an error if from not set", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    mailer.message("Hello {email}!");
    expect(() => mailer.build()).to.throw();
  });

  it.concurrent("should throw an error if no recipients", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    mailer.message("Hello {email}!");
    mailer.from("test@mail.com");

    expect(() => mailer.build()).to.throw();
  });
});

describe("Mailer.build() success", () => {
  it.concurrent("should build a valid mail", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {email}!");
    mailer.message("Hello {email}!");

    mailer.addRecipient({
      email: faker.internet.email(),
      name: faker.person.firstName(),
    });
  });

  it.concurrent("should build a valid mail", () => {
    const mailer = new Mailer();
    mailer.subject("Hello {name} {email}!");
    mailer.message("Hello {name} {email}!");
    mailer.from(faker.internet.email());

    const email = faker.internet.email();
    const name = faker.person.firstName();
    mailer.addRecipient({
      email,
      name,
    });

    mailer.build();

    expect(mailer.toJSON().emails).to.have.lengthOf(1);

    const built = mailer.toJSON().emails.pop()!.toJSON();

    expect(built).to.have.property("subject");
    expect(built).to.have.property("text");
    expect(built).to.have.property("from");
    expect(built).to.have.property("to");

    expect(built.subject).toMatch(new RegExp(name));
    expect(built.subject).toMatch(new RegExp(email));

    expect(built.text).toMatch(new RegExp(name));
    expect(built.text).toMatch(new RegExp(email));
  });
});
