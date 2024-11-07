'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Expense.init({
    expense_id: DataTypes.UUID,
    group_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    amount: DataTypes.DECIMAL,
    description: DataTypes.STRING,
    category_id: DataTypes.UUID,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Expense',
  });
  return Expense;
};