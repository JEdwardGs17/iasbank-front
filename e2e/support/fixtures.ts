import { test as base, expect, Locator, Page } from '@playwright/test';
import { Api } from './api';

interface TestOptions {
  /** Console errors a test provokes on purpose (a 404 search, a simulated network failure...). */
  allowedConsoleErrors: RegExp | undefined;
}

interface WorkerFixtures {
  api: Api;
}

/**
 * - `api`: backend client to prepare data and verify results (usable in beforeAll).
 * - `page`: fails the test if the browser logs an error the test did not expect.
 */
export const test = base.extend<TestOptions, WorkerFixtures>({
  allowedConsoleErrors: [undefined, { option: true }],

  page: async ({ page, allowedConsoleErrors }, use) => {
    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    page.on('pageerror', (error) => errors.push(error.message));

    await use(page);

    const unexpected = errors.filter((error) => !allowedConsoleErrors?.test(error));
    expect(unexpected, 'unexpected browser console errors').toEqual([]);
  },

  api: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      await use(new Api(request));
      await request.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect };

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function toast(page: Page, type: ToastType, text: string): Locator {
  return page.locator(`.toast.${type}`, { hasText: text });
}

/** Horizontal overflow, in pixels, of an element (0 when everything fits). */
export function horizontalOverflow(element: Locator): Promise<number> {
  return element.evaluate((el) => el.scrollWidth - el.clientWidth);
}
