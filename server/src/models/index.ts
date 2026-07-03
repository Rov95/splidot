import { sequelize } from '../config/database';
import { initUser, User } from './user';
import { initGroup, Group } from './group';
import { initUserGroup, UserGroup } from './usergroup';
import { initExpense, Expense } from './expense';
import { initExpenseShare, ExpenseShare } from './expenseshare';
import { initCategory, Category } from './category';

initUser(sequelize);
initGroup(sequelize);
initUserGroup(sequelize);
initExpense(sequelize);
initExpenseShare(sequelize);
initCategory(sequelize);

// Associations are currently disabled, matching the previous setup:
// User.belongsToMany(Group, { through: UserGroup });
// Group.belongsToMany(User, { through: UserGroup });

// Expense.belongsTo(Group, { foreignKey: 'group_id' });
// Expense.belongsTo(User, { foreignKey: 'user_id' });
// Expense.belongsTo(Category, { foreignKey: 'category_id' });

// User.hasMany(ExpenseShare, { foreignKey: 'user_id' });
// Expense.hasMany(ExpenseShare, { foreignKey: 'expense_id' });

export { sequelize, User, Group, UserGroup, Expense, ExpenseShare, Category };
