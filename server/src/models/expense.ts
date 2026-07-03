import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Expense extends Model<InferAttributes<Expense>, InferCreationAttributes<Expense>> {
  declare expense_id: CreationOptional<string | null>;
  declare group_id: CreationOptional<string | null>;
  declare user_id: CreationOptional<string | null>;
  declare amount: CreationOptional<number | string | null>;
  declare description: CreationOptional<string | null>;
  declare category_id: CreationOptional<string | null>;
  declare created_at: CreationOptional<Date | null>;
}

export const initExpense = (sequelize: Sequelize): typeof Expense => {
  Expense.init(
    {
      expense_id: DataTypes.UUID,
      group_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      amount: DataTypes.DECIMAL,
      description: DataTypes.STRING,
      category_id: DataTypes.UUID,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Expense',
    }
  );
  return Expense;
};
