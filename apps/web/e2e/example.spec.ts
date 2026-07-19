import { test, expect } from '@playwright/test';

test('placeholder test to satisfy playwright', async () => {
  // We archived the E2E tests for now, but playwright fails if it finds zero tests.
  expect(true).toBe(true);
});
