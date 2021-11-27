const {Product, ProductInfo, ProductImg} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')
const { Sequelize } = require('sequelize')
const imageUpdate = require('../utils/imageUpdate')

class ProductController {
  async create(req, res, next) {
    try {
      let {name, price, description, categoryId, info, vcode, group} = req.body
      name = name.trim();
      const img = req.files ? req.files.img : null
      const mainImg = req.files ? req.files.mainImg : null
      price = +price
      categoryId= +categoryId
      if(name === '') return next(ApiError.badRequest('Название не должно быть пустым'))
      if(!categoryId) return next(ApiError.badRequest('Выберите категорию'))
      const verifyProduct = await Product.findOne({where: {name}})
      if(verifyProduct) return next(ApiError.badRequest('Продукт с таким названием уже существует'))
      let fileNameMainImg = "no-image.png"
      if(mainImg){
        fileNameMainImg = uuid.v4() + ".png"
        mainImg.mv(path.resolve(__dirname, '..', 'static', fileNameMainImg))
        imageUpdate.imageUpdateSize(`static/${fileNameMainImg}`)
      }
      const product = await Product.create({name, mainImg: fileNameMainImg, price, description, categoryId, vcode, group})

      if(img){
        if(Array.isArray(img) && img.length > 1) {
          img.forEach(e => {
            let fileName = uuid.v4() + ".png"
            e.mv(path.resolve(__dirname, '..', 'static', fileName))
            imageUpdate.imageUpdateSize(`static/${fileName}`)
            ProductImg.create({productId: product.id, name: fileName})
          })
        } else {
          let fileName = uuid.v4() + ".png"
          img.mv(path.resolve(__dirname, '..', 'static', fileName))
          imageUpdate.imageUpdateSize(`static/${fileName}`)
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
      let {categoryId, search, group, limit, page} = req.query
      limit = limit || 15
      page = page || 1
      let offset = page * limit - limit
      let products
      if(group && group !=="undefined") {
        products = await Product.findAndCountAll({where: {group}, limit, include: [
          {model: ProductInfo, as: 'info'},
          {model: ProductImg, as: 'img'}
        ],distinct:true})
      }
      if(search && search !=="undefined") {
        limit = limit || 5
        const productsAll = await Product.findAndCountAll({include: [
          {model: ProductInfo, as: 'info'},
          {model: ProductImg, as: 'img'}
        ],distinct:true})
        const rows = productsAll.rows.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
        const toSlice = Number(offset)*page;
        products = {
          count: rows.length,
          rows: rows.slice(offset, toSlice === 0 ? limit : toSlice),
        }
      }
      if(categoryId && categoryId !=="undefined"){
        products = await Product.findAndCountAll({where: {categoryId}, limit, offset, include: [
          {model: ProductInfo, as: 'info'},
          {model: ProductImg, as: 'img'}
        ],distinct:true})
      }
      return res.json(products)
    } catch (e) {
        next(ApiError.internal(e.message))
    }
  }

  async getOne(req, res, next) {
    try {
      const {name} = req.params
      const product = await Product.findOne({
        where: {$and: Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), Sequelize.fn('lower', name))},
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
      let {id, name, description, price, categoryId, vcode, group} = req.body
      let product
      const img = req.files ? req.files.img : null
      let fileName = uuid.v4() + ".png"
      if(img) {
        await img.mv(path.resolve(__dirname, '..', 'static', fileName))
        imageUpdate.imageUpdateSize(`static/${fileName}`)
      }
      const verifyProduct = await Product.findOne({where: {name}})
      if(verifyProduct && verifyProduct.dataValues.id !== +id) return next(ApiError.badRequest('Продукт с таким именем уже существует'))

      if(name) product = await Product.update({name}, {where: {id}, returning: true})
        else return next(ApiError.badRequest('Название не должно быть пустым'))
      if(img) product = await Product.update({mainImg: fileName}, {where: {id}, returning: true})

      product = await Product.update(
        {description, price: +price, categoryId, vcode, group}, {where: {id}, returning: true})

      name = product[1][0].name
      product = await Product.findOne({ where: {name},
        include: [{model: ProductInfo, as: 'info'},
          {model: ProductImg, as: 'img'}]})
      return res.json({ product })
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
      const img = req.files ? req.files.img : null
      let fileName
      const newImg = []
      if(img){
        if(Array.isArray(img)) {
          img.forEach((e, i) => {
            fileName = uuid.v4() + ".png"
            e.mv(path.resolve(__dirname, '..', 'static', fileName))
            imageUpdate.imageUpdateSize(`static/${fileName}`)
            ProductImg.create({productId, name: fileName})
            newImg.push({productId, name: fileName})
          })
        } else {
          fileName = uuid.v4() + ".png"
          img.mv(path.resolve(__dirname, '..', 'static', fileName))
          imageUpdate.imageUpdateSize(`static/${fileName}`)
          ProductImg.create({productId, name: fileName})
          newImg.push({productId, name: fileName})
        }
      } else throw Error('Добавтье изображение')
      // const image = await ProductImg.findAll()
      return res.json({newImg})
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async deleteImg(req, res, next) {
    try {
      const id = req.params.id
      await ProductImg.destroy({where: {id}})
      return res.json({message: 'success', id: +id})
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async createInfo(req, res, next) {
    try {
      const {productId, title, description} = req.body
      let info
      if(title, description) info = await ProductInfo.create({
        productId,
        feature_title: title,
        feature_description: description
      })
        else throw Error('Поле не должно быть пустым')

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
        else throw Error('Поле не должно быть пустым')
      
      return res.json(info[1][0])
    } catch (e) {
      next(ApiError.internal(e.message))
    }
  }

  async deleteInfo(req, res, next) {
    try {
      const id = req.params.id
      await ProductInfo.destroy({where: {id}})
      return res.json({message: 'success', id: +id})
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = new ProductController()