import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { v4 as uuid4 } from 'uuid';

export class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
  declare group_id: CreationOptional<string>;
  declare name: string | null;
  declare total_expense: CreationOptional<number | string>;
  declare created_by: CreationOptional<string | null>;
  declare created_at: CreationOptional<Date>;
}

export const initGroup = (sequelize: Sequelize): typeof Group => {
  Group.init(
    {
      group_id: {
        type: DataTypes.UUID,
        defaultValue: () => uuid4(),
        primaryKey: true,
      },
      name: DataTypes.STRING,
      total_expense: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Group',
      timestamps: false,
    }
  );
  return Group;
};
