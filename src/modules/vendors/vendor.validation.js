const Joi = require('joi');

const vendorSchema = Joi.object({
  name: Joi.string().required(),
  contact: Joi.string(),
  email: Joi.string().email(),
  address: Joi.string(),
});

module.exports = { vendorSchema };
