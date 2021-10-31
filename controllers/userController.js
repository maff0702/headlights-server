const {User} = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const generageJwt = (id, login, role) => {
  return jwt.sign({id, login, role}, process.env.SECRET_KEY, {expiresIn: '16h'})
}

class UserController {
  async registration(req, res, next) {
    const {login, password} = req.body
    if(!login || !password){
      return next(ApiError.badRequest('Некорректный логин или пароль'))
    }
    const candidate = await User.findOne({where: {login}})
    if(candidate){
      return next(ApiError.badRequest('Пользователь с таким логином существует'))
    }
    const hashPassword = await bcrypt.hash(password, 7)
    const user = await User.create({login, password:hashPassword})
    const token = generageJwt(user.id, user.login)
    return res.json({token})
  }

  async login(req, res) {
    const {login, password} = req.body
    const user = await User.findOne({where: {login}})
    if(!user){
      return next(ApiError.badRequest('Пользователь с таким логином не существует'))
    }
    const comparePassword = bcrypt.compareSync(password, user.password)
    if(!comparePassword){
      return next(ApiError.badRequest('Неверный пароль'))
    }
    const token = generageJwt(user.id, user.login, user.role)
    return res.json({token})
  }

  async check(req, res) {
    const token = generateJwt(req.user.id, req.user.login, req.user.role)
    return res.json({token})
  }
}

module.exports = new UserController()