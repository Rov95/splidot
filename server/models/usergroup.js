'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserGroup extends Model {}
  
  UserGroup.init({
    user_group_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    group_id: DataTypes.UUID,
    joined_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserGroup',
  });
  return UserGroup;
};