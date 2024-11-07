'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = require(__dirname + '/../config/config.json').development;
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

db.User.belongsToMany(db.Group, { through: db.UserGroup });
db.Group.belongsToMany(db.User, { through:db.UserGroup });

db.Expense.belongsTo(db.Group, { foreignKey: 'group_id' });
db.Expense.belongsTo(db.User, { foreignKey: 'user_id' });
db.Expense.belongsTo(db.Category, { foreignKey: 'group_id' });

db.User.hasMany(db.ExpenseShare, { foreignKey: 'user_id' });
db.Expense.hasMany(db.ExpenseShare, { foreignKey: 'expense_id' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
