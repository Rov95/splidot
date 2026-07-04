import { Sequelize } from 'sequelize';

const { DATABASE_URL, NODE_ENV } = process.env;

const createSequelize = (): Sequelize => {
  if (NODE_ENV === 'test') {
    return new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
  }

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from environment variables');
  }

  return new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
};

export const sequelize = createSequelize();
