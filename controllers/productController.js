const {Product, ProductInfo} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')

class ProductController {
  async create(req, res, next) {
    try {
      const {name, price, description, categoryId, info} = req.body
      const {img} = req.files
      let fileName = uuid.v4() + ".jpg"
      img.mv(path.resolve(__dirname, '..', 'static', fileName))

      const product = await Product.create({name, price, description, img: fileName, categoryId})

      if(info){
        info = JSON.parse(info)
        info.forEach(e => {
          ProductInfo.create({
            productId: product.id,
            feature_title: e.title,
            feature_description: e.description
          })
        });
      }

      return res.json(product)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async getAll(req, res) {
    let {categoryId, limit, page} = req.query
    limit = limit || 15
    page = page || 1
    let offset = page * limit - limit
    const products = await Product.findAndCountAll({where: {categoryId}, limit, offset})
    return res.json(products)
  }

  async getOne(req, res) {
    const {id} = req.params
    const product = await Product.findOne({
      where: {id},
      include: [{model: ProductInfo, as: 'info'}]
    })
    return res.json(product) 
  }

  async update(req, res) {

  }

  async delete(req, res) {

  }
}

module.exports = new ProductController()