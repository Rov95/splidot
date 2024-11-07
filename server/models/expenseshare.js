'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExpenseShare extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ExpenseShare.init({
    expense_share_id: DataTypes.UUID,
    expense_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    amount: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'ExpenseShare',
  });
  return ExpenseShare;
};