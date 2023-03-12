import nock from "nock";

nock.disableNetConnect();

jest.mock("./src/utils/env", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));
