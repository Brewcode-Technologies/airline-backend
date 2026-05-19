const router = require('express').Router();
const controller = require('./customer.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Public catalog endpoints
router.get('/catalog', controller.getCatalog);
router.get('/catalog/:id', controller.getCatalogItem);
router.get('/categories', controller.getCategories);

// Protected customer endpoints
router.use(authMiddleware);
router.use(roleMiddleware('customer'));

// Cart
router.get('/cart', controller.getCart);
router.post('/cart/add', controller.addToCart);
router.put('/cart/update', controller.updateCartItem);
router.delete('/cart/remove/:skuId', controller.removeFromCart);
router.delete('/cart/clear', controller.clearCart);

// Orders
router.post('/orders', controller.placeOrder);
router.get('/orders', controller.getOrders);
router.get('/orders/:id', controller.getOrder);
router.put('/orders/:id/cancel', controller.cancelOrder);
router.post('/orders/:id/reorder', controller.reorder);

// Tracking
router.get('/orders/:id/tracking', controller.getTracking);

// Feedback
router.post('/orders/:id/feedback', controller.submitFeedback);
router.get('/orders/:id/feedback', controller.getFeedback);

// Profile
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

module.exports = router;
