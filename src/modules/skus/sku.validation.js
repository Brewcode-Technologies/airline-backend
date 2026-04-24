const Joi = require('joi');

const skuSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string(),
  vendor: Joi.string(),
  unit: Joi.string(),
});

module.exports = { skuSchema };
