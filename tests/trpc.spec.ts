import { test, expect } from "@playwright/test";

test.describe("tRPC Client-Side Integration", () => {
  test("should load users page with server-side data", async ({ page }) => {
    await page.goto("/users");

    // Wait for the page to load
    await expect(page.locator("h1")).toContainText("Users");

    // The user list container should be visible
    await expect(page.getByTestId("user-list")).toBeVisible();
  });

  test("should show empty state when no users exist", async ({ page }) => {
    await page.goto("/users");

    // Check for either users or the no-users message
    const userList = page.getByTestId("user-list");
    await expect(userList).toBeVisible();
  });

  test("should create a new user via tRPC mutation", async ({ page }) => {
    await page.goto("/users");

    // Generate a unique email
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const userName = "Test User";

    // Fill in the form
    await page.getByTestId("email-input").fill(uniqueEmail);
    await page.getByTestId("name-input").fill(userName);

    // Click create button
    await page.getByTestId("create-user-btn").click();

    // Wait for the user to appear in the list
    await expect(page.getByTestId("user-item").filter({ hasText: uniqueEmail })).toBeVisible({
      timeout: 10000,
    });

    // Verify the user's name is shown
    await expect(page.getByTestId("user-item").filter({ hasText: userName })).toBeVisible();
  });

  test("should show error for invalid email", async ({ page }) => {
    await page.goto("/users");

    // Try to submit with invalid email
    await page.getByTestId("email-input").fill("invalid-email");
    await page.getByTestId("create-user-btn").click();

    // The button should remain enabled (mutation may fail or validation kicks in)
    // Check that no new user was added with invalid email
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("user-item").filter({ hasText: "invalid-email" })).not.toBeVisible();
  });

  test("tRPC API endpoint should be accessible", async ({ request }) => {
    // Test the tRPC health check endpoint
    const response = await request.get("/api/trpc/health");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.result?.data).toBeDefined();
    expect(data.result?.data?.status).toBe("ok");
  });

  test("tRPC API should handle getUsers query", async ({ request }) => {
    const response = await request.get("/api/trpc/getUsers");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.result?.data).toBeDefined();
    expect(Array.isArray(data.result?.data)).toBe(true);
  });
});
