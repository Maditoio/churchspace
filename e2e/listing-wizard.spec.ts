import { expect, test } from "@playwright/test";

test("listing wizard keeps values on back and can submit", async ({ page, request }) => {
  const timestamp = Date.now();
  const email = `autotest-${timestamp}@example.com`;
  const password = "Pass12345";

  const registerResponse = await request.post("/api/users/register", {
    data: {
      name: "Automation User",
      email,
      password,
      churchName: "Automation Church",
      denomination: "Independent",
      phone: "+27110001111",
      whatsapp: "+27110001111",
    },
  });

  if (![201, 409].includes(registerResponse.status())) {
    throw new Error(`User registration failed with status ${registerResponse.status()}`);
  }

  await page.goto("/signin");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.locator("form").getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL(/\/dashboard(\/.*)?$/);

  await page.goto("/dashboard/listings/new");
  await expect(page.getByRole("heading", { name: "Create a Listing" })).toBeVisible();

  const listingTitle = `E2E Listing ${timestamp}`;
  const description =
    "This is an automated end to end listing description used to verify step persistence and final submission behavior for ChurchSpace.";

  await page.getByPlaceholder("Listing title").fill(listingTitle);
  await page.getByRole("checkbox", { name: "RENT" }).check();
  await page.getByPlaceholder("Detailed property description").fill(description);

  await page.getByRole("button", { name: "Next Step" }).click();

  await page.locator('input[name="address"]').fill("123 Unity Street");
  await page.locator('input[name="suburb"]').fill("Central");
  await page.locator('input[name="city"]').fill("Johannesburg");
  await page.locator('input[name="province"]').fill("Gauteng");

  await page.getByRole("button", { name: "Back" }).click();

  await expect(page.getByPlaceholder("Listing title")).toHaveValue(listingTitle);
  await expect(page.getByRole("checkbox", { name: "RENT" })).toBeChecked();
  await expect(page.getByPlaceholder("Detailed property description")).toHaveValue(description);

  await page.getByRole("button", { name: "Next Step" }).click();
  await expect(page.locator('input[name="address"]')).toHaveValue("123 Unity Street");
  await expect(page.locator('input[name="city"]')).toHaveValue("Johannesburg");

  await page.getByRole("button", { name: "Next Step" }).click();
  await page.getByRole("button", { name: "Next Step" }).click();
  await page.getByRole("button", { name: "Next Step" }).click();
  await page.getByRole("button", { name: "Next Step" }).click();
  await page.getByRole("button", { name: "Next Step" }).click();

  const confirmAccuracy = page.getByRole("checkbox", { name: "I confirm this information is accurate." });
  await expect(confirmAccuracy).toBeVisible();
  await confirmAccuracy.check();
  await page.getByRole("button", { name: "Submit for Review" }).click();

  await expect(page).toHaveURL(/\/dashboard\/listings$/);
});
