import sg, { send } from "@sendgrid/mail";
import z from "zod";
import outdent from "outdent";

//#region Sendgrid API Key
let apiKeySet = false;
if (process.env.SENDGRID_API_KEY) {
  sg.setApiKey(process.env.SENDGRID_API_KEY);
  apiKeySet = true;
}
export function setApiKey(apiKey: string) {
  sg.setApiKey(apiKey);
  apiKeySet = true;
}
//#endregion

//#region Sendgrid Email Sender
let defaultSender: string | undefined = undefined;
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

const ZSendGridEmail = z.object({
  to: z.string().email(),
  from: z.string().email(),
  subject: z.string(),
  text: z.string(),
  html: z.string().optional(),
});
//#endregion

export class Email {
  private props: {
    to?: string;
    from?: string;
    subject?: string;
    text?: string;
    content_type: ContentType;
  } = {
      content_type: ContentType.TEXT,
      from: defaultSender,
    };
  //#region Setters
  constructor(props?: typeof Email.prototype.props) {
    if (props) {
      this.props = props;
    }

    return this;
  }

  to(to: string) {
    z.string().email().parse(to);
    this.props.to = to;
    return this;
  }

  from(from: string) {
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
    if (!apiKeySet) {
      throw new Error(
        outdent`
          Sendgrid API Key not set.
          Set the SENDGRID_API_KEY environment variable or call setApiKey()`,
      );
    }

    const msg = {
      to: this.props.to,
      from: this.props.from,
      subject: this.props.subject,
      text: this.props.text,
      html:
        this.props.content_type === ContentType.HTML
          ? this.props.text
          : undefined,
    };

    const result = ZSendGridEmail.safeParse(msg);

    if (!result.success) {
      throw new Error("Failed to send email", {
        cause: result.error,
      });
    }

    return send(result.data);
  }
}
