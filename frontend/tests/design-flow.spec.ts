import { expect, test, type APIRequestContext } from '@playwright/test';

const API_BASE = process.env.API_BASE ?? 'http://localhost:4000/api';
const TEST_USER_NAME = 'Playwright Tester';
const SESSION_STORAGE_KEY = 'design-editor-session';

interface SessionData {
  token: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
}
const TEXT_TOOL_LABEL = 'Text';
const EMPTY_LAYERS_TEXT = 'No layers yet';
const LAYERS_SELECTOR = '.layers-panel li';

const createSession = async (request: APIRequestContext): Promise<SessionData> => {
  const response = await request.post(`${API_BASE}/auth/token`, {
    data: {
      name: TEST_USER_NAME,
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body.data as SessionData;
};

test.describe('Design editor end-to-end', () => {
  let session: SessionData;

  test.beforeEach(async ({ page, request }) => {
    session = await createSession(request);
    await page.addInitScript(
      ({ key, value }: { key: string; value: SessionData }) => {
        window.localStorage.setItem(key, JSON.stringify(value));
      },
      { key: SESSION_STORAGE_KEY, value: session },
    );
  });

  test('create design, add elements, comment once, and persist', async ({ page, request }) => {
    const createResponse = await request.post(`${API_BASE}/designs`, {
      data: {
        name: `Playwright design ${Date.now()}`,
        width: 1080,
        height: 1080,
        elements: [],
      },
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    const designId: string = created.data.id;

    await page.goto(`/designs/${designId}`);

    const stage = page.locator('.design-stage');
    await expect(stage).toBeVisible();

    // Add and edit a text element via inspector
    await page.getByRole('button', { name: TEXT_TOOL_LABEL }).click();
    const latestLayer = page.locator(LAYERS_SELECTOR).first().locator('.layer-row');
    await latestLayer.click();
    const textInput = page.locator('.inspector-panel label', { hasText: TEXT_TOOL_LABEL }).locator('input');
    const textValue = `Hello Playwright ${Date.now()}`;
    await textInput.fill(textValue);

    // Add rectangle and circle
    await page.getByRole('button', { name: 'Rect' }).click();
    await page.getByRole('button', { name: 'Circle' }).click();

    const layers = page.locator(LAYERS_SELECTOR).filter({ hasNotText: EMPTY_LAYERS_TEXT });
    await expect(layers).toHaveCount(3);

    // Add a comment via the comments panel
    const commentMessage = `Playwright comment ${Date.now()}`;
    const commentForm = page.locator('.comment-form');
    await commentForm.locator('textarea').fill(commentMessage);
    await commentForm.locator('button', { hasText: 'Send' }).click();

    const commentLocator = page.locator('.comments-list article').filter({ hasText: commentMessage });
    await expect(commentLocator).toHaveCount(1);

    // Save and ensure toast appears
    await page.getByRole('button', { name: 'Save' }).click();
    const toast = page.locator('.toast');
    await expect(toast).toContainText('Design saved');
    await toast.locator('button[aria-label="Dismiss"]').click();

    // Reload and verify persistence
    await page.reload();
    await expect(page.locator(LAYERS_SELECTOR).filter({ hasNotText: EMPTY_LAYERS_TEXT })).toHaveCount(3);
    await expect(page.locator('.comments-list article').filter({ hasText: commentMessage })).toHaveCount(1);

    const response = await request.delete(`${API_BASE}/designs/${designId}`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    expect(response.ok()).toBeTruthy();
  });
});

