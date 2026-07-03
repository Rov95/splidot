import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare category_id: CreationOptional<string | null>;
  declare name: CreationOptional<string | null>;
}

export const initCategory = (sequelize: Sequelize): typeof Category => {
  Category.init(
    {
      category_id: DataTypes.UUID,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Category',
    }
  );
  return Category;
};
