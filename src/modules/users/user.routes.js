const router = require('express').Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.get('/', roleMiddleware('admin'), getUsers);
router.post('/', roleMiddleware('admin'), createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', roleMiddleware('admin'), deleteUser);

module.exports = router;
