import sg from "@sendgrid/mail";
import { outdent } from "outdent";

export class Util {
  constructor() {
    return this;
  }

  checkApiKey() {
    //@ts-expect-error - @sendgrid/mail's declarations do not export the auth property
    if (!!!sg.client.auth) {
      throw new Error(
        outdent`
          Sendgrid API Key not set.
          Set the SENDGRID_API_KEY environment variable or call setApiKey()
        `
      );
    }
  }
}
