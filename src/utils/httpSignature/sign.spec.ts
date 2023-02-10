import { mockedKeys } from "./fixtures/keys";
import { signActivity } from "./sign";

afterAll(() => {
  jest.useRealTimers();
});

describe("signActivity", () => {
  test.each`
    url                                                      | date            | activity              | description
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-01"} | ${{}}                 | ${"default"}
    ${new URL("https://remote1.example.com/inbox")}          | ${"2023-01-01"} | ${{}}                 | ${"url"}
    ${new URL("https://remote.example.com/users/foo/inbox")} | ${"2023-01-01"} | ${{}}                 | ${"path"}
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-02"} | ${{}}                 | ${"date"}
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-01"} | ${{ type: "Create" }} | ${"activity"}
  `("署名されたヘッダーを返す: $description", ({ url, date, activity }) => {
    // arrange
    jest.useFakeTimers().setSystemTime(new Date(date));
    // act
    const headers = signActivity(
      activity,
      url,
      "https://myhost.example.com/example#main-key",
      mockedKeys.privateKey
    );
    // assert
    expect(headers).toMatchSnapshot();
  });
});
