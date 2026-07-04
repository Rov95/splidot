import { sequelize } from '../config/database';
import { initUser, User } from './user';
import { initGroup, Group } from './group';
import { initUserGroup, UserGroup } from './usergroup';
import { initExpense, Expense } from './expense';
import { initExpenseShare, ExpenseShare } from './expenseshare';
import { initSettlement, Settlement } from './settlement';

initUser(sequelize);
initGroup(sequelize);
initUserGroup(sequelize);
initExpense(sequelize);
initExpenseShare(sequelize);
initSettlement(sequelize);

// Associations are currently disabled, matching the previous setup:
// User.belongsToMany(Group, { through: UserGroup });
// Group.belongsToMany(User, { through: UserGroup });

// Expense.belongsTo(Group, { foreignKey: 'group_id' });
// Expense.belongsTo(User, { foreignKey: 'user_id' });

// User.hasMany(ExpenseShare, { foreignKey: 'user_id' });
// Expense.hasMany(ExpenseShare, { foreignKey: 'expense_id' });

export { sequelize, User, Group, UserGroup, Expense, ExpenseShare, Settlement };
