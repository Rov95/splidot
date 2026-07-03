import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { v4 as uuid4 } from 'uuid';

export class UserGroup extends Model<
  InferAttributes<UserGroup>,
  InferCreationAttributes<UserGroup>
> {
  declare user_group_id: CreationOptional<string>;
  declare user_id: string;
  declare group_id: string;
  declare name: CreationOptional<string | null>;
  declare joined_at: CreationOptional<Date>;
}

export const initUserGroup = (sequelize: Sequelize): typeof UserGroup => {
  UserGroup.init(
    {
      user_group_id: {
        type: DataTypes.UUID,
        defaultValue: () => uuid4(),
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Groups', key: 'group_id' },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'UserGroup',
      timestamps: false,
    }
  );
  return UserGroup;
};
