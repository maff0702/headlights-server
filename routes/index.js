const Router = require('express')
const router = new Router
const productRouter = require('./productRouter')
const categoriesRouter = require('./categoriesRouter')
const userRouter = require('./userRouter')

router.use('/user', userRouter)
router.use('/product', productRouter)
router.use('/categories', categoriesRouter)

module.exports = router