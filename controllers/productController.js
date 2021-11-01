const {Product, ProductInfo, ProductImg} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')

class ProductController {
  async create(req, res, next) {
    try {
      const {name, price, description, categoryId, info} = req.body
      const img = req.files?.img

      const product = await Product.create({name, price, description, categoryId})

      if(img){
        if(Array.isArray(img)) {
          img.forEach(e => {
            let fileName = uuid.v4() + ".png"
            e.mv(path.resolve(__dirname, '..', 'static', fileName))
            ProductImg.create({productId: product.id, name: fileName})
          })
        } else {
          let fileName = uuid.v4() + ".png"
          img.mv(path.resolve(__dirname, '..', 'static', fileName))
          ProductImg.create({productId: product.id, name: fileName})
        }
      }

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

  async getAll(req, res, next) {
    try {
      let {categoryId, search, limit, page} = req.query
      limit = limit || 15
      page = page || 1
      let offset = page * limit - limit
      let products

      if(search) {
        const productsAll = await Product.findAll()
        limit = limit || 5
        products = productsAll.filter(item => item.name.includes(search)).slice(0, limit)
      }
      if(categoryId){
        products = await Product.findAndCountAll({where: {categoryId}, limit, offset, include: [
          {model: ProductInfo, as: 'info'},
          {model: ProductImg, as: 'img'}
        ]})
      }
      return res.json(products)
    } catch (e) {
        next(ApiError.internal(e.message))
    }
  }

  async getOne(req, res, next) {
    try {
      const {id} = req.params
      const product = await Product.findOne({
        where: {id},
        include: [
          {model: ProductInfo, as: 'info'},
          {model: ProductImg, as: 'img'}
        ]
      })
    return res.json(product) 
    } catch (e) {
      next(ApiError.internal(e.message))
    }
  }

  async update(req, res, next) {
    try {
      const {id, name, description, price, categoryId} = req.body
      let product

      if(name) product = await Product.update({name}, {where: {id}, returning: true})
      if(description) product = await Product.update({description}, {where: {id}, returning: true})
      if(price) product = await Product.update({price}, {where: {id}, returning: true})
      if(categoryId) product = await Product.update({categoryId}, {where: {id}, returning: true})
      return res.json(product)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async delete(req, res, next) {
    try {
      const id = req.params.id
      await Product.destroy({where: {id}})
      return res.json({message: 'success'})
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async createImg(req, res, next) {
    try {
      const {productId} = req.body
      const img = req.files?.img

      if(img){
        if(Array.isArray(img)) {
          img.forEach(e => {
            let fileName = uuid.v4() + ".png"
            e.mv(path.resolve(__dirname, '..', 'static', fileName))
            ProductImg.create({productId, name: fileName})
          })
        } else {
          let fileName = uuid.v4() + ".png"
          img.mv(path.resolve(__dirname, '..', 'static', fileName))
          ProductImg.create({productId, name: fileName})
        }
      }
      const image = await ProductImg.findAll({where: {productId}})
      return res.json(image)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async deleteImg(req, res, next) {
    try {
      const id = req.params.id
      console.log(id);
      await ProductImg.destroy({where: {id}})
      return res.json({message: 'success'})
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async createInfo(req, res, next) {
    try {
      const {productId, title, description} = req.body

      const info = await ProductInfo.create({
        productId,
        feature_title: title,
        feature_description: description
      })

      return res.json(info)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async updateInfo(req, res, next) {
    try {
      const {id, title, description} = req.body
      let info
      if(title, description) info = await ProductInfo.update({
        feature_title: title,
        feature_description: description
      }, {where: {id}, returning: true})
      
      return res.json(info)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async deleteInfo(req, res, next) {
    try {
      const id = req.params.id
      await ProductInfo.destroy({where: {id}})
      return res.json({message: 'success'})
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = new ProductController()