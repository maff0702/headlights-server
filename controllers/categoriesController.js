const {Categories} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')
const imageUpdate = require('../utils/imageUpdate')

class CategoriesController {

  async create(req, res, next) {
    try{
        const {name} = req.body
        const img = req.files ? req.files.img : null
        if(name === '') return next(ApiError.badRequest('Название не должно быть пустым'))
        if(!img) return next(ApiError.badRequest('Добавьте изображение'))
        const verifyCategory = await Categories.findOne({where: {name}})
        if(verifyCategory) return next(ApiError.badRequest('Такая категория уже существует'))
        let fileName = uuid.v4() + ".png"
        if(img) await img.mv(path.resolve(__dirname, '..', 'static', fileName))
        imageUpdate.imageUpdateSize(`static/${fileName}`)
        const category = await Categories.create({name, img: fileName})
        return res.json(category)
      } catch (e) {
        next(ApiError.badRequest(e.message))
      }
  }

  async getAll(req, res, next) {
    try {
      const categoriesAll = await Categories.findAll()
      return res.json(categoriesAll)
    } catch (e) {
      next(ApiError.internal(e.message))
    }
  }

  async update(req, res, next) {
    try {
      const {name} = req.body
      const img = req.files ? req.files.img : null
      const {id} = req.params
      const verifyCategory = await Categories.findOne({where: {name}})
      if(verifyCategory && verifyCategory.dataValues.id !== +id) return next(ApiError.badRequest('Такая категория уже существует'))
      let fileName = uuid.v4() + ".png"
      if(img) img.mv(path.resolve(__dirname, '..', 'static', fileName))
      imageUpdate.imageUpdateSize(`static/${fileName}`)
      let category

      if(name) category = await Categories.update({name}, {where: {id}, returning: true,})
      if(img) category = await Categories.update({img: fileName}, {where: {id}, returning: true,})
      return res.json(category)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }

  async delete(req, res, next) {
    try {
      const id = req.params.id
      const currentCategory = await Categories.findOne({where: {id}})
      await Categories.destroy({where: {id}})
      return res.json(currentCategory)
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = new CategoriesController()