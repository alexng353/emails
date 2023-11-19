import sg, { send } from "@sendgrid/mail";
import z from "zod";
import outdent from "outdent";
import { Util } from "./util";
import format from "string-template";

//#region Sendgrid API Key Configuration
export const checkApiKey = () => {
  //@ts-expect-error - @sendgrid/mail's declarations do not export the auth property
  return !!sg.client.auth;
};

if (process.env.SENDGRID_API_KEY) {
  sg.setApiKey(process.env.SENDGRID_API_KEY);
}

export function setApiKey(apiKey: string) {
  sg.setApiKey(apiKey);
}
//#endregion

//#region Sendgrid Email Sender
let defaultSender: string | undefined;
/**
 * @description Set the default sender for all emails
 * @param sender The email address to send from
 * @example
 * ```ts
 * setDefaultSender("noreply@example.com");
 * ```
 */
export function setDefaultSender(sender: string) {
  defaultSender = sender;
}
//#endregion

//#region Declarations
export enum ContentType {
  TEXT = "text/plain",
  HTML = "text/html",
}

// const ZSendGridEmail = z
//   .object({
//     to: z.string().email(),
//     from: z.string().email(),
//     subject: z.string(),
//     text: z.string().optional(),
//     html: z.string().optional(),
//   })
//   .refine((data) => !!(data.text || data.html), {
//     message: "text or html must be set",
//   })
//   .refine((data) => (data.text || data.html) && !(data.text && data.html), {
//     message: "text and html cannot both be set",
//   });

const ZSendGridEmail = (type: ContentType) => {
  switch (type) {
    case ContentType.HTML: {
      return z.object({
        to: z.string().email(),
        from: z.string().email(),
        subject: z.string(),
        html: z.string(),
      });
    }
    case ContentType.TEXT: {
      return z.object({
        to: z.string().email(),
        from: z.string().email(),
        subject: z.string(),
        text: z.string(),
      });
    }
  }
};

const ZEmailProperties = z.object({
  to: z.string().email().optional(),
  from: z.string().email().optional(),
  subject: z.string().optional(),
  text: z.string().optional(),
  content_type: z.nativeEnum(ContentType).optional(),
});
//#endregion

export class Email extends Util {
  private props: z.infer<typeof ZEmailProperties> = {
    content_type: ContentType.TEXT,
    from: defaultSender,
  };

  constructor(properties?: typeof Email.prototype.props) {
    super();
    if (properties) {
      this.props = properties;
    }

    return this;
  }

  //#region Setters
  to(to: string) {
    z.string().email().parse(to);
    this.props.to = to;
    return this;
  }

  from(from: string, debug = false) {
    if (debug) console.log("from", from);
    z.string().email().parse(from);
    this.props.from = from;
    return this;
  }

  subject(subject: string) {
    this.props.subject = subject;
    return this;
  }

  message(text: string) {
    this.props.text = text;
    return this;
  }

  contentType(content_type: ContentType) {
    this.props.content_type = content_type;
    return this;
  }
  //#endregion

  async send() {
    this.checkApiKey();

    const formatted = this.toSendGridEmail();

    return send(formatted);
  }

  toSendGridEmail() {
    if (!this.props.content_type) {
      throw new Error("content type not set");
    }

    const message = {
      to: this.props.to,
      from: this.props.from,
      subject: this.props.subject,
      text:
        this.props.content_type === ContentType.TEXT
          ? this.props.text
          : undefined,
      html:
        this.props.content_type === ContentType.HTML
          ? this.props.text
          : undefined,
    };

    const result = ZSendGridEmail(this.props.content_type).safeParse(message);

    if (!result.success) {
      throw new Error("invalid email", {
        cause: result.error,
      });
    }

    return result.data;
  }

  toJSON() {
    return this.props;
  }
}

// TODO: move to declarations section
const ZTemplateData = z
  .object({
    email: z.string().email(),
  })
  .catchall(z.string().optional());

export type TemplateData = z.infer<typeof ZTemplateData>;

export class Mailer extends Util {
  private props: {
    from?: string;
    recipients: string[];
    subject_template?: string;
    message_template?: string;

    // possible generated
    subjects: string[];
    emails: Email[];
    template_data: TemplateData[];
  } = {
    emails: [],
    recipients: [],
    subjects: [],
    template_data: [],
  };

  constructor(properties?: typeof Mailer.prototype.props) {
    super();
    if (properties) {
      this.props = properties;
    }
    return this;
  }

  //#region Setters

  /**
   * @description Set the sender for all emails
   * @param from The email address to send from
   * @example
   * ```ts
   * from("noreply@example.com");
   */
  from(from: string) {
    z.string().email().parse(from);
    this.props.from = from;
    return this;
  }

  /**
   * @description Add a recipient to the list of recipients
   * First argument can be a string, string[], TemplateData, or TemplateData[]
   * Check out [this link](https://www.npmjs.com/package/string-template) for more info on templating
   * and [the docs](https://github.com/alexng353/emails/blob/main/README.md) for more info on templating with this library
   * @example
   * ```ts
   * addRecipient("some@mail.com");
   * addRecipient([
   *   "first@mail.com",
   *   "second@mail.com",
   *   "third@mail.com"
   * ]);
   *
   * addRecipient({
   *   email: "email@mail.com",
   *   name: "Name"
   *   // Extra data for use with templating engine.
   *   // See https://www.npmjs.com/package/string-template
   *   // and check out Mailer.message() and Mailer.subject()
   * });
   * ```
   */
  addRecipient(email: string | string[] | TemplateData | TemplateData[]) {
    if (typeof email === "string") {
      z.string().email().parse(email);
      this.props.recipients.push(email);
      return this;
    }

    if (Array.isArray(email)) {
      for (const em of email) {
        if (typeof em === "string") {
          z.string().email().parse(em);
          this.props.recipients.push(em);
        } else {
          ZTemplateData.parse(em);
          this.props.template_data.push(em);
        }
      }
      return this;
    }

    ZTemplateData.parse(email);
    this.props.template_data.push(email);

    return this;
  }

  /**
   * @description Add an email to the list of emails
   */
  addEmail(email: Email) {
    this.props.emails.push(email);
    return this;
  }

  /**
   * @description Set the subject for all emails\
   * supports string-template syntax for templating
   * see [string-template](https://www.npmjs.com/package/string-template) for more info on templating
   * and [the docs](https://github.com/alx365/emails/blob/main/README.md) for more info on templating with this library
   * data for temlating can be passed in with Mailer.addRecipient()
   *
   * @param subject The subject to set
   * @example
   * ```ts
   * subject("Hello {name}!");
   * ```
   */
  subject(subject: string) {
    this.props.subject_template = subject;
    return this;
  }

  /**
   * @description Set the message for all emails
   * supports string-template syntax for templating
   * supports HTML and plain text messages
   * see [string-template](https://www.npmjs.com/package/string-template) for more info on templating
   * and [the docs](https://github.com/alexng353/emails/blob/main/README.md) for more info on templating with this library
   * data for temlating can be passed in with Mailer.addRecipient()
   *
   * @param message The message to set
   * @example
   * ```ts
   * message("Hello {name}!");
   * ```
   */
  message(message: string) {
    this.props.message_template = message;
    return this;
  }
  //#endregion

  /**
   * @description Generate emails from template
   */
  build() {
    //#region Validation
    if (!this.props.subject_template) {
      throw new Error(outdent`
        subject not set
        call subject()
      `);
    }

    if (!this.props.message_template) {
      throw new Error(outdent`
        message not set
        call message()
      `);
    }

    if (!this.props.from) {
      throw new Error(outdent`
        from not set
        call from()
      `);
    }

    if (
      this.props.recipients.length === 0 &&
      this.props.template_data.length === 0
    ) {
      throw new Error(outdent`
        no recipients
        call addRecipient()
      `);
    }
    //#endregion

    const emails: Email[] = [];

    for (const recipient of this.props.recipients) {
      const subject = format(this.props.subject_template, {
        email: recipient,
      });

      const message = format(this.props.message_template, {
        email: recipient,
      });

      const email = new Email()
        .from(this.props.from)
        .to(recipient)
        .subject(subject)
        .message(message);

      emails.push(email);
    }

    for (const data of this.props.template_data) {
      const subject = format(this.props.subject_template, data);
      const message = format(this.props.message_template, data);

      const email = new Email()
        .from(this.props.from)
        .to(data.email)
        .subject(subject)
        .message(message);

      emails.push(email);
    }

    this.props.emails = [...this.props.emails, ...emails];
  }

  async send() {
    this.checkApiKey();
    const formatted = this.props.emails.map((email) => email.toSendGridEmail());
    return send(formatted);
  }

  toJSON() {
    return this.props;
  }
}
