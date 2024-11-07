'use strict';
const { Model, DataTypes } = require('sequelize');
const { v4: uuid4 } = require('uuid');

module.exports = (sequelize) => {
  class Group extends Model {}
  Group.init({
    group_id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid4(),
      primaryKey: true
    },
    name: DataTypes.STRING,
    total_expense: DataTypes.DECIMAL,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Group',
    timestamps: false
  });
  return Group;
};