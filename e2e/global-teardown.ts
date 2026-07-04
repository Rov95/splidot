import { cleanupTestData } from './db-cleanup';

export default async function globalTeardown(): Promise<void> {
  await cleanupTestData();
}
