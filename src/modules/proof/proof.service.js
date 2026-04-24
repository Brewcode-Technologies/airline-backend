const DeliveryProof = require('../../models/DeliveryProof');

const getByOrder = (orderId) => DeliveryProof.findOne({ order: orderId }).populate('driver');
const create = (data) => DeliveryProof.create(data);

module.exports = { getByOrder, create };
