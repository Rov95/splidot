'use strict';
const { Model, DataTypes } = require('sequelize');
const { v4: uuid4 } = require('uuid');

module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    user_id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid4(),
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: { 
      type: DataTypes.STRING, 
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: false
  });
  return User;
};