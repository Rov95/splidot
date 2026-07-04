import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { v4 as uuid4 } from 'uuid';

export class ExpenseShare extends Model<
  InferAttributes<ExpenseShare>,
  InferCreationAttributes<ExpenseShare>
> {
  declare expense_share_id: CreationOptional<string>;
  declare expense_id: string;
  declare user_id: string;
  declare amount: number | string;
}

export const initExpenseShare = (sequelize: Sequelize): typeof ExpenseShare => {
  ExpenseShare.init(
    {
      expense_share_id: {
        type: DataTypes.UUID,
        defaultValue: () => uuid4(),
        primaryKey: true,
      },
      expense_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Expenses', key: 'expense_id' },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ExpenseShare',
      timestamps: false,
    }
  );
  return ExpenseShare;
};
