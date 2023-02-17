import { mockDeep } from "jest-mock-extended";
import type { GetServerSidePropsContext } from "next";

type Context<T> = GetServerSidePropsContext & {
  req: GetServerSidePropsContext["req"] & {
    body: T;
  };
};

export const createMockedContext = <T>(req: Partial<Context<T>["req"]>) => {
  const ctx = mockDeep<Context<T>>();
  // @ts-ignore
  ctx.req = {
    ...ctx.req,
    ...req,
  };
  return ctx;
};
