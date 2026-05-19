const router = require('express').Router();
const controller = require('./customer.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Public catalog endpoints
router.get('/catalog', controller.getCatalog);
router.get('/catalog/:id', controller.getCatalogItem);
router.get('/categories', controller.getCategories);

// Public service endpoints
router.get('/services', controller.getServices);
router.get('/services/categories', controller.getServiceCategories);
router.get('/services/:id', controller.getServiceItem);

// Protected customer endpoints
router.use(authMiddleware);
router.use(roleMiddleware('customer'));

// Cart - Products
router.get('/cart', controller.getCart);
router.post('/cart/add', controller.addToCart);
router.put('/cart/update', controller.updateCartItem);
router.delete('/cart/remove/:skuId', controller.removeFromCart);
router.delete('/cart/clear', controller.clearCart);

// Cart - Services
router.post('/cart/add-service', controller.addServiceToCart);
router.put('/cart/update-service', controller.updateCartService);
router.delete('/cart/remove-service/:serviceId', controller.removeServiceFromCart);

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
