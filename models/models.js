const { Sequelize } = require('sequelize')
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
  name: {type: DataTypes.STRING, unique: true, allowNull: false},
  mainImg: {type: DataTypes.STRING},
  price: {type: DataTypes.INTEGER},
  // description: {type: DataTypes.STRING},
  description: {type: Sequelize.TEXT},
  vcode: {type: DataTypes.STRING},
  group: {type: DataTypes.STRING}
})

const Categories = sequelize.define('categories', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING, unique: true, allowNull: false},
  img: {type: DataTypes.STRING, allowNull: false},
})

const ProductInfo = sequelize.define('product_info', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  feature_title: {type: DataTypes.STRING, allowNull: false},
  feature_description: {type: DataTypes.STRING, allowNull: false},
})

const ProductImg = sequelize.define('product_img', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING, allowNull: false},
})

Product.hasMany(ProductInfo, {as: 'info'})
ProductInfo.belongsTo(Product)

Product.hasMany(ProductImg, {as: 'img'})
ProductImg.belongsTo(Product)

Categories.hasMany(Product)
Product.belongsTo(Categories)

module.exports = {
  User,
  Product,
  Categories,
  ProductInfo,
  ProductImg
}