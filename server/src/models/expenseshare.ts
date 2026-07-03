import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class ExpenseShare extends Model<
  InferAttributes<ExpenseShare>,
  InferCreationAttributes<ExpenseShare>
> {
  declare expense_share_id: CreationOptional<string | null>;
  declare expense_id: CreationOptional<string | null>;
  declare user_id: CreationOptional<string | null>;
  declare amount: CreationOptional<number | string | null>;
}

export const initExpenseShare = (sequelize: Sequelize): typeof ExpenseShare => {
  ExpenseShare.init(
    {
      expense_share_id: DataTypes.UUID,
      expense_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      amount: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: 'ExpenseShare',
    }
  );
  return ExpenseShare;
};
