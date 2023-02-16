import { mockDeep } from "jest-mock-extended";
import type { GetServerSidePropsContext } from "next";

type Context = GetServerSidePropsContext & {
  req: GetServerSidePropsContext["req"] & {
    body: object;
  };
};

export const createMockedContext = (req: Partial<Context["req"]>) => {
  const ctx = mockDeep<Context>();
  // @ts-ignore
  ctx.req = {
    ...ctx.req,
    ...req,
  };
  return ctx;
};
