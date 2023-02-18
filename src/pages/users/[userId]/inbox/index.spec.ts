import { json } from "next-runtime";
import { createMockedContext } from "../../../__mocks__/context";
import { follow } from "./follow";
import { getServerSideProps } from "./index.page";

jest.mock("./follow");
const mockedFollow = jest.mocked(follow).mockResolvedValue(json({}, 200));

describe("ユーザーinbox", () => {
  test.each`
    type        | fn
    ${"Follow"} | ${mockedFollow}
  `("$typeを実装した関数が呼ばれる", async ({ type, fn }) => {
    // arrange
    const activity = { type };
    const ctx = createMockedContext({
      method: "POST",
      headers: {
        accept: "application/activity+json",
      },
      body: activity,
    });
    // act
    await getServerSideProps(ctx);
    // assert
    expect(fn).toBeCalledWith(activity);
  });
  test.each`
    type        | fn
    ${"Follow"} | ${mockedFollow}
  `(
    "Undoで$typeを実装した関数がundoオプションをつけて呼ばれる",
    async ({ type, fn }) => {
      // arrange
      const activity = {
        type: "Undo",
        object: { type },
      };
      const ctx = createMockedContext({
        method: "POST",
        headers: {
          accept: "application/activity+json",
        },
        body: activity,
      });
      // act
      await getServerSideProps(ctx);
      // assert
      expect(fn).toBeCalledWith(activity.object, { undo: true });
    }
  );
  test("未実装のtypeの場合は400を返す", async () => {
    // arrange
    const activity = {
      type: "NotImplemented",
    };
    const ctx = createMockedContext({
      method: "POST",
      headers: {
        accept: "application/activity+json",
      },
      body: activity,
    });
    // act
    await getServerSideProps(ctx);
    // assert
    expect(ctx.res.statusCode).toBe(400);
  });
  test("typeを持たないリクエストの場合は400を返す", async () => {
    // arrange
    const activity = {
      invalid: "value",
    };
    const ctx = createMockedContext({
      method: "POST",
      headers: {
        accept: "application/activity+json",
      },
      body: activity,
    });
    // act
    await getServerSideProps(ctx);
    // assert
    expect(ctx.res.statusCode).toBe(400);
  });
});
