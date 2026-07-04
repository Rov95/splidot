import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

export const TEST_GROUP_NAME = 'E2E Test Group';
export const TEST_EMAIL_PREFIX = 'e2e_';

export async function cleanupTestData(): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  await client.connect();
  try {
    // Children first: ExpenseShares → Settlements/Expenses → UserGroups → Groups.
    await client.query(
      `DELETE FROM "ExpenseShares" WHERE expense_id IN (
         SELECT expense_id FROM "Expenses" WHERE group_id IN (SELECT group_id FROM "Groups" WHERE name = $1)
       )`,
      [TEST_GROUP_NAME]
    );
    await client.query(
      `DELETE FROM "Settlements" WHERE group_id IN (SELECT group_id FROM "Groups" WHERE name = $1)`,
      [TEST_GROUP_NAME]
    );
    await client.query(
      `DELETE FROM "Expenses" WHERE group_id IN (SELECT group_id FROM "Groups" WHERE name = $1)`,
      [TEST_GROUP_NAME]
    );
    await client.query(
      `DELETE FROM "UserGroups" WHERE group_id IN (SELECT group_id FROM "Groups" WHERE name = $1)`,
      [TEST_GROUP_NAME]
    );
    await client.query(`DELETE FROM "Groups" WHERE name = $1`, [TEST_GROUP_NAME]);
    await client.query(`DELETE FROM "Users" WHERE email LIKE $1`, [`${TEST_EMAIL_PREFIX}%`]);
  } finally {
    await client.end();
  }
}
