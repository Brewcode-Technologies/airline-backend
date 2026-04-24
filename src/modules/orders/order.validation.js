const Joi = require('joi');

const orderSchema = Joi.object({
  orderNumber: Joi.string().required(),
  vendor: Joi.string(),
  driver: Joi.string(),
  items: Joi.array().items(Joi.object({ sku: Joi.string(), quantity: Joi.number() })),
  status: Joi.string().valid('pending', 'assigned', 'in_transit', 'delivered', 'cancelled'),
  scheduledAt: Joi.date(),
});

module.exports = { orderSchema };
