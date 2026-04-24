const Location = require('../../models/Location');

const getByOrder = (orderId) => Location.find({ order: orderId }).sort('recordedAt');
const addLocation = (data) => Location.create(data);

module.exports = { getByOrder, addLocation };
