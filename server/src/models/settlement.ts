import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { v4 as uuid4 } from 'uuid';

export class Settlement extends Model<
  InferAttributes<Settlement>,
  InferCreationAttributes<Settlement>
> {
  declare settlement_id: CreationOptional<string>;
  declare group_id: string;
  declare from_user_id: string;
  declare to_user_id: string;
  declare amount: number | string;
  declare is_paid: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
}

export const initSettlement = (sequelize: Sequelize): typeof Settlement => {
  Settlement.init(
    {
      settlement_id: {
        type: DataTypes.UUID,
        defaultValue: () => uuid4(),
        primaryKey: true,
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Groups', key: 'group_id' },
      },
      from_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      to_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Settlement',
      timestamps: false,
    }
  );
  return Settlement;
};
