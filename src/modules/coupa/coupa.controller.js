const coupaService = require('./coupa.service');

// POST /api/coupa/punchout/setup
// Coupa sends PunchOutSetupRequest XML → we return a redirect URL
const punchoutSetup = async (req, res, next) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const xml = await coupaService.handleSetupRequest(req.body, baseUrl);
    res.set('Content-Type', 'text/xml').send(xml);
  } catch (e) { next(e); }
};

// POST /api/coupa/punchout/return
// Frontend sends cart JSON → we build PunchOutOrderMessage XML and POST it to Coupa
const punchoutReturn = async (req, res, next) => {
  try {
    const { buyerCookie, items } = req.body;
    if (!buyerCookie || !items?.length) {
      return res.status(400).json({ success: false, message: 'buyerCookie and items are required' });
    }
    const { xml, returnUrl } = await coupaService.returnCart(buyerCookie, items);

    // POST the cXML back to Coupa's return URL
    const fetch = (await import('node-fetch')).default;
    await fetch(returnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xml,
    });

    res.json({ success: true, message: 'Cart returned to Coupa' });
  } catch (e) { next(e); }
};

// POST /api/coupa/order
// Coupa sends OrderRequest XML (PO) → we create an order in our system
const receiveOrder = async (req, res, next) => {
  try {
    const { order, ack } = await coupaService.handleOrderRequest(req.body);
    res.set('Content-Type', 'text/xml').send(ack);
  } catch (e) { next(e); }
};

module.exports = { punchoutSetup, punchoutReturn, receiveOrder };
