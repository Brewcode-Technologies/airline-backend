const proofService = require('./proof.service');
const Order = require('../../models/Order');
const { success } = require('../../utils/response');

// handles both GET /proof/:orderId and GET /orders/:id/proof
const getProof = async (req, res, next) => {
  try {
    const orderId = req.params.orderId || req.params.id;
    success(res, await proofService.getByOrder(orderId));
  } catch (e) { next(e); }
};

// handles both POST /proof and POST /orders/:id/proof
const submitProof = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const data = orderId ? { ...req.body, order: orderId } : req.body;
    res.status(201).json({ success: true, data: await proofService.create(data) });
  } catch (e) { next(e); }
};

module.exports = { getProof, submitProof };
