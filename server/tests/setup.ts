import { beforeEach, afterAll } from 'vitest';
import { sequelize } from '../src/models';

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
