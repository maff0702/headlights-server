const {Categories} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')

class CategoriesController {

  async create(req, res) {
    try{
        const {name} = req.body
        const {img} = req.files
        let fileName = uuid.v4() + ".jpg"
        img.mv(path.resolve(__dirname, '..', 'static', fileName))

        const category = await Categories.create({name, img: fileName})
        return res.json(category)
      } catch (e) {
        next(ApiError.badRequest(e.message))
      }
  }

  async getAll(req, res) {
    const categoriesAll = await Categories.findAll()
    return res.json(categoriesAll)
  }

  async update(req, res) {
    const {name, img} = req.body
    const category = await Categories.findByIdAndUpdate(req.params.id, req.body, {name, img})
    return res.json(category)
  }

  async delete(req, res) {

  }
}

module.exports = new CategoriesController()