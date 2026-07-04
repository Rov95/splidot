import 'dotenv/config';
import { sequelize } from '../src/models';

// One-off, idempotent schema update for the live Neon database.
// sequelize.sync() only creates missing tables — it does not alter existing ones,
// so the Groups owner column and the rebuilt expense tables are handled here.
// Safe to drop Expenses/ExpenseShares/Categories: no client ever wrote to them.
const migrate = async () => {
  await sequelize.query('ALTER TABLE "Groups" ADD COLUMN IF NOT EXISTS "created_by" UUID;');
  await sequelize.query('DROP TABLE IF EXISTS "ExpenseShares", "Expenses", "Categories" CASCADE;');
  await sequelize.sync();
  console.log('Schema migration complete.');
};

migrate()
  .catch((error) => {
    console.error('Schema migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
