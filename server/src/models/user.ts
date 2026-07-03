import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { v4 as uuid4 } from 'uuid';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare user_id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
}

export const initUser = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: () => uuid4(),
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: false,
    }
  );
  return User;
};
