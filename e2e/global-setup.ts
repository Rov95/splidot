import { cleanupTestData } from './db-cleanup';

export default async function globalSetup(): Promise<void> {
  // Guard against leftovers from a previous run that crashed before teardown.
  await cleanupTestData();
}
