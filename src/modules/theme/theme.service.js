const Theme = require('../../models/Theme');

const get = () => Theme.findOne();
const upsert = (data) => Theme.findOneAndUpdate({}, data, { new: true, upsert: true });

module.exports = { get, upsert };
