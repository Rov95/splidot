'use strict';
const { Model, DataTypes } = require('sequelize');
const { v4: uuid4 } = require('uuid');

module.exports = (sequelize) => {
  class UserGroup extends Model {}

  UserGroup.init({
    user_group_id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid4(),
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Users', key: 'user_id' },
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
  }, {
    sequelize,
    modelName: 'UserGroup',
    timestamps: false,
  });


  return UserGroup;
};
