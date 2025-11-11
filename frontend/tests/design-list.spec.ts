import { expect, test, type APIRequestContext } from '@playwright/test';

const API_BASE = process.env.API_BASE ?? 'http://localhost:4000/api';
const SESSION_STORAGE_KEY = 'design-editor-session';
const TEST_USER_NAME = 'Playwright Lister';

interface SessionData {
  token: string;
  user: {
    id: string;
    name: string;
  };
}

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

test.describe('Design list management', () => {
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

  test('shows and deletes a design from the list', async ({ page, request }) => {
    const designName = `List Spec ${Date.now()}`;
    const createResponse = await request.post(`${API_BASE}/designs`, {
      data: {
        name: designName,
        width: 1080,
        height: 1080,
        elements: [],
      },
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    expect(createResponse.ok()).toBe(true);
    const created = await createResponse.json();
    const designId: string = created.data.id;

    await page.goto('/');

    const card = page.locator('.design-card').filter({ hasText: designName });
    await expect(card).toBeVisible();

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await card.getByRole('button', { name: 'Delete' }).click();

    await expect(card).toHaveCount(0);

    // Ensure backend cleanup (in case UI failed)
    await request.delete(`${API_BASE}/designs/${designId}`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
  });
});

