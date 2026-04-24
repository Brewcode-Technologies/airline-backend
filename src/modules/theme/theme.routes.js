const router = require('express').Router();
const { getTheme, updateTheme } = require('./theme.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.get('/', getTheme);
router.put('/', authMiddleware, roleMiddleware('admin'), updateTheme);

module.exports = router;
