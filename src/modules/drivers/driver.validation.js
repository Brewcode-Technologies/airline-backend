const Joi = require('joi');

const driverSchema = Joi.object({
  user: Joi.string().required(),
  licenseNumber: Joi.string(),
  vehicle: Joi.string(),
  isAvailable: Joi.boolean(),
});

module.exports = { driverSchema };
