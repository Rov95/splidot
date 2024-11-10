const { Model, DataTypes } = require('sequelize');
const { v4: uuid4 } = require('uuid');

module.exports = (sequelize) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsToMany(models.User, { through: models.UserGroup, foreignKey: 'group_id' });
    }
  }

  Group.init({
    group_id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid4(),
      primaryKey: true,
    },
    name: DataTypes.STRING,
    total_expense: {
      type: DataTypes.DECIMAL,
      defaultValue: 0, 
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    sequelize,
    modelName: 'Group',
    timestamps: false,
});


  return Group;
};
