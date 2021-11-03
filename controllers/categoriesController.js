const {Categories} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')

class CategoriesController {

  async create(req, res, next) {
    try{
        const {name} = req.body
        const img = req.files?.img
        let fileName = uuid.v4() + ".jpg"
        if(img) img.mv(path.resolve(__dirname, '..', 'static', fileName))

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
      const {id, name} = req.body
      const img = req.files?.img
      let fileName = uuid.v4() + ".jpg"
      if(img) img.mv(path.resolve(__dirname, '..', 'static', fileName))
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
      await Categories.destroy({where: {id}})
      return res.json({message: 'success'})
    } catch (e) {
      next(ApiError.badRequest(e.message))
    }
  }
}

module.exports = new CategoriesController()