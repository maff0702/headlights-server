const {User} = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const generateJwt = (id, login, role) => {
  return jwt.sign({id, login, role}, process.env.SECRET_KEY, {expiresIn: '16h'})
}

class UserController {
  async registration(req, res, next) {
    try {
      const {login, password} = req.body
      if(!login || !password){
        return next(ApiError.badRequest('Заполните поля'))
      }
      if(login.length > 20 || password.length > 20){
        return next(ApiError.badRequest('Пароль и логин не должны быть больше 20 символов'))
      }
      const candidate = await User.findOne({where: {login}})
      if(candidate){
        return next(ApiError.badRequest('Пользователь с таким логином существует'))
      }
      const hashPassword = await bcrypt.hash(password, 7)
      const user = await User.create({login, password:hashPassword})
      const token = generateJwt(user.id, user.login)
      return res.json({
        token: 'Bearer '+token,
        user:{
          id: user.id,
          login: user.login,
          role: user.role
        }
      })
    } catch (e) {
      next(ApiError.internal(e.message))
    }
  }

  async login(req, res, next) {
    try {
      const {login, password} = req.body
      const user = await User.findOne({where: {login}})
      if(login.length > 20 || password.length > 20){
        return next(ApiError.badRequest('Пароль и логин не должны быть больше 20 символов'))
      }
      if(!user){
        return next(ApiError.badRequest('Пользователь с таким логином не существует'))
      }
      const comparePassword = bcrypt.compareSync(password, user.password)
      if(!comparePassword){
        return res.json(next(ApiError.badRequest('Неверный пароль')))
      }
      const token = generateJwt(user.id, user.login, user.role)
      return res.json({
        token: 'Bearer '+token,
        user:{
          id: user.id,
          login: user.login,
          role: user.role
        }
      })
    } catch (e) {
      next(ApiError.internal(e.message))
    }
  }

  async check(req, res, next) {
    try {
      const token = generateJwt(req.user.id, req.user.login, req.user.role)
      return res.json({token: 'Bearer '+token, user:{...req.user}})
    } catch (e) {
      next(ApiError.internal(e.message))
    }
  }
}

module.exports = new UserController()