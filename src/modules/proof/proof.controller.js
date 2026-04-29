const proofService = require('./proof.service');
const Order = require('../../models/Order');
const { success } = require('../../utils/response');

const getProof = async (req, res, next) => {
  try {
    const orderId = req.params.orderId || req.params.id;
    success(res, await proofService.getByOrder(orderId));
  } catch (e) { next(e); }
};

const submitProof = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // if a file was uploaded, build the public URL
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const data = orderId
      ? { ...req.body, imageUrl, order: orderId }
      : { ...req.body, imageUrl };

    res.status(201).json({ success: true, data: await proofService.create(data) });
  } catch (e) { next(e); }
};

module.exports = { getProof, submitProof };
