import { API_URL } from './api';

const APP_URL = process.env['APP_URL'] ?? 'http://localhost:4200';

/** Fails fast with a clear message when the application is not running. */
export default async function globalSetup(): Promise<void> {
  for (const [name, url] of [
    ['Backend', `${API_URL}/accounts`],
    ['Frontend', APP_URL],
  ]) {
    const reachable = await fetch(url).then(
      (response) => response.ok,
      () => false,
    );
    if (!reachable) {
      throw new Error(
        `${name} is not reachable at ${url}. Start the application with "docker compose up --build -d" from iasbank-back.`,
      );
    }
  }
}
