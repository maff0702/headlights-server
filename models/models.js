const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  login: {type: DataTypes.STRING, unique: true},
  password: {type: DataTypes.STRING},
  role: {type: DataTypes.STRING, defaultValue: 'USER'},
})

const Product = sequelize.define('product', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING, allowNull: false},
  price: {type: DataTypes.INTEGER},
  description: {type: DataTypes.STRING},
  img: {type: DataTypes.STRING, allowNull: false},
})

const Categories = sequelize.define('categories', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING, unique: true, allowNull: false},
})

const ProductInfo = sequelize.define('product_info', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  feature_title: {type: DataTypes.STRING, allowNull: false},
  feature_description: {type: DataTypes.STRING, allowNull: false},
})

Product.hasMany(ProductInfo)
ProductInfo.belongsTo(Product)

Categories.hasMany(Product)
Product.belongsTo(Categories)

module.exports = {
  User,
  Product,
  Categories,
  ProductInfo
}