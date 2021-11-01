const Router = require('express')
const router = new Router
const ProductController = require('../controllers/productController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), ProductController.create)
router.get('/', ProductController.getAll)
router.get('/:id', ProductController.getOne)
router.patch('/', checkRole('ADMIN'), ProductController.update)
router.delete('/:id', checkRole('ADMIN'), ProductController.delete)

router.post('/img', checkRole('ADMIN'), ProductController.createImg)
router.delete('/img/:id', checkRole('ADMIN'), ProductController.deleteImg)

router.post('/info', checkRole('ADMIN'), ProductController.createInfo)
router.patch('/info', checkRole('ADMIN'), ProductController.updateInfo)
router.delete('/info/:id', checkRole('ADMIN'), ProductController.deleteInfo)

module.exports = router