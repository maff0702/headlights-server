const Router = require('express')
const router = new Router
const categotiesController = require('../controllers/categoriesController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), categotiesController.create)
router.get('/', categotiesController.getAll)
router.patch('/:id', checkRole('ADMIN'), categotiesController.update)
router.delete('/', checkRole('ADMIN'), categotiesController.delete)

module.exports = router