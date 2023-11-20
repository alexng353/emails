import { expect, it, vi } from "vitest";
import sg from "@sendgrid/mail";

vi.mock("@sendgrid/mail", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("@sendgrid/mail")>();
  return {
    ...module_,
    setApiKey: vi.fn(),
  };
});

vi.mock("../sdk", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("../sdk")>();
  return {
    ...module_,
    setApiKey: vi.fn(),
  };
});

vi.mock("../env", async (importOriginal) => {
  const module_ = await importOriginal<typeof import("../env")>();
  return {
    ...module_,
    env: {
      SENDGRID_API_KEY: "SG.UNIQUE",
    },
  };
});

it("should set api key if its in env", async () => {
  // to be honest I have no idea why checking for setApiKey being called doesn't work.
  // I think it has something to do with the way I'm mocking the module, but this is just speculation.
  await import("../sdk");

  expect(((sg as any).client as any).auth).toBeDefined();
  expect(((sg as any).client as any).auth).toMatch(/SG.UNIQUE/);
  // expect(setApiKey).toHaveBeenCalled();
  // expect(setApiKey).toHaveBeenCalledWith("SG.UNIQUE");
});
