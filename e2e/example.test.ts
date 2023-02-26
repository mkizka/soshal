import { test, expect } from "@playwright/test";

// TODO: e2eテスト実装
test("他サーバーのユーザーを検索して表示", async ({ page }) => {
  await page.goto("https://misskey.paas.mkizka.dev");
  await page.getByRole("button", { name: "Sign In" }).click();

  // ログイン
  await page.getByPlaceholder("Username").fill("e2e");
  await page.getByPlaceholder("Password").fill("com0806e2e");
  await page.locator("form").getByRole("button", { name: "Sign In" }).click();

  // ユーザーを検索
  await page.locator("button.search").click();
  await page.getByRole("textbox").fill("@pr1@pr1-soshal.mkizka.dev");
  await page.getByRole("button", { name: "OK" }).click();

  await expect(page.locator(".banner-container .username")).toHaveText(
    "@pr1@pr1-soshal.mkizka.dev"
  );
});
