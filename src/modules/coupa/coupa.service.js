const xml2js = require('xml2js');
const { create: buildXml } = require('xmlbuilder2');
const PunchoutSession = require('../../models/PunchoutSession');
const Order = require('../../models/Order');
const SKU = require('../../models/SKU');

const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });

// ── helpers ──────────────────────────────────────────────────────────────────

const parseXml = (raw) => parser.parseStringPromise(raw);

const cxmlTimestamp = () => new Date().toISOString();

// ── 1. Handle PunchOutSetupRequest from Coupa ─────────────────────────────────

const handleSetupRequest = async (rawXml, baseUrl) => {
  const doc = await parseXml(rawXml);
  const cxml = doc.cXML;

  const sharedSecret =
    cxml?.Header?.[0]?.Sender?.[0]?.Credential?.[0]?.SharedSecret?.[0] ||
    cxml?.Header?.Sender?.Credential?.SharedSecret;

  if (sharedSecret !== process.env.COUPA_SHARED_SECRET) {
    throw Object.assign(new Error('Invalid shared secret'), { statusCode: 401 });
  }

  const request = cxml?.Request?.[0] || cxml?.Request;
  const setupReq = request?.PunchOutSetupRequest?.[0] || request?.PunchOutSetupRequest;

  const buyerCookie = setupReq?.BuyerCookie?.[0] || setupReq?.BuyerCookie;
  const returnUrl =
    setupReq?.BrowserFormPost?.[0]?.URL?.[0] ||
    setupReq?.BrowserFormPost?.URL;
  const identity =
    cxml?.Header?.[0]?.From?.[0]?.Credential?.[0]?.Identity?.[0] ||
    cxml?.Header?.From?.Credential?.Identity;

  if (!buyerCookie || !returnUrl) {
    throw Object.assign(new Error('Missing BuyerCookie or BrowserFormPost URL'), { statusCode: 400 });
  }

  await PunchoutSession.findOneAndUpdate(
    { buyerCookie },
    { buyerCookie, returnUrl, identity, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    { upsert: true, new: true }
  );

  const startPageUrl = `${baseUrl}/airline/punchout?session=${encodeURIComponent(buyerCookie)}`;

  const response = buildXml({ version: '1.0', encoding: 'UTF-8' })
    .ele('cXML', { payloadID: `${Date.now()}@airline-logistics`, timestamp: cxmlTimestamp() })
      .ele('Response')
        .ele('Status', { code: '200', text: 'OK' }).up()
        .ele('PunchOutSetupResponse')
          .ele('StartPage')
            .ele('URL').txt(startPageUrl).up()
          .up()
        .up()
      .up()
    .end({ prettyPrint: true });

  return response;
};

// ── 2. Return cart to Coupa (PunchOutOrderMessage) ────────────────────────────

const returnCart = async (buyerCookie, items) => {
  const session = await PunchoutSession.findOne({ buyerCookie });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });

  // Fetch SKU details for each item
  const skuIds = items.map((i) => i.skuId);
  const skus = await SKU.find({ _id: { $in: skuIds } }).populate('vendor', 'name');

  const root = buildXml({ version: '1.0', encoding: 'UTF-8' })
    .ele('cXML', { payloadID: `${Date.now()}@airline-logistics`, timestamp: cxmlTimestamp() })
      .ele('Message')
        .ele('PunchOutOrderMessage')
          .ele('BuyerCookie').txt(buyerCookie).up()
          .ele('PunchOutOrderMessageHeader', { operationAllowed: 'create' })
            .ele('Total')
              .ele('Money', { currency: 'USD' })
                .txt(
                  items.reduce((sum, item) => {
                    const sku = skus.find((s) => s._id.toString() === item.skuId);
                    return sum + (sku?.price ?? 0) * item.quantity;
                  }, 0).toFixed(2)
                ).up()
            .up()
          .up();

  const msgNode = root.root().first().first(); // PunchOutOrderMessage node

  items.forEach((item, idx) => {
    const sku = skus.find((s) => s._id.toString() === item.skuId);
    if (!sku) return;
    const unitPrice = (sku.price ?? 0).toFixed(2);
    const lineTotal = ((sku.price ?? 0) * item.quantity).toFixed(2);

    msgNode
      .ele('ItemIn', { quantity: item.quantity, lineNumber: idx + 1 })
        .ele('ItemID')
          .ele('SupplierPartID').txt(sku.code).up()
        .up()
        .ele('ItemDetail')
          .ele('UnitPrice')
            .ele('Money', { currency: 'USD' }).txt(unitPrice).up()
          .up()
          .ele('Description', { 'xml:lang': 'en' }).txt(sku.name).up()
          .ele('UnitOfMeasure').txt(sku.unit || 'EA').up()
          .ele('Classification', { domain: 'UNSPSC' }).txt('50000000').up()
          .ele('ManufacturerPartID').txt(sku.code).up()
          .ele('ManufacturerName').txt(sku.vendor?.name || 'Airline Logistics').up()
        .up()
      .up();
  });

  const xml = root.end({ prettyPrint: true });

  return { xml, returnUrl: session.returnUrl };
};

// ── 3. Handle OrderRequest (PO) from Coupa ────────────────────────────────────

const handleOrderRequest = async (rawXml) => {
  const doc = await parseXml(rawXml);
  const cxml = doc.cXML;

  const sharedSecret =
    cxml?.Header?.[0]?.Sender?.[0]?.Credential?.[0]?.SharedSecret?.[0] ||
    cxml?.Header?.Sender?.Credential?.SharedSecret;

  if (sharedSecret !== process.env.COUPA_SHARED_SECRET) {
    throw Object.assign(new Error('Invalid shared secret'), { statusCode: 401 });
  }

  const request = cxml?.Request?.[0] || cxml?.Request;
  const orderReq = request?.OrderRequest?.[0] || request?.OrderRequest;
  const header = orderReq?.OrderRequestHeader?.[0] || orderReq?.OrderRequestHeader;

  const orderNumber = header?.['$']?.orderID || `COUPA-${Date.now()}`;
  const rawItems = orderReq?.ItemOut;
  const itemsArray = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  // Match supplier part IDs to SKU ObjectIds
  const codes = itemsArray.map((i) => i?.ItemID?.[0]?.SupplierPartID?.[0] || i?.ItemID?.SupplierPartID);
  const skus = await SKU.find({ code: { $in: codes } });

  const items = itemsArray.map((i) => {
    const code = i?.ItemID?.[0]?.SupplierPartID?.[0] || i?.ItemID?.SupplierPartID;
    const qty = parseInt(i?.['$']?.quantity || '1', 10);
    const sku = skus.find((s) => s.code === code);
    return sku ? { sku: sku._id, quantity: qty } : null;
  }).filter(Boolean);

  const existing = await Order.findOne({ orderNumber });
  if (existing) return existing;

  const order = await Order.create({
    orderNumber,
    items,
    status: 'pending',
    slaDeadline: new Date(Date.now() + 22 * 60 * 1000),
  });

  const ack = buildXml({ version: '1.0', encoding: 'UTF-8' })
    .ele('cXML', { payloadID: `${Date.now()}@airline-logistics`, timestamp: cxmlTimestamp() })
      .ele('Response')
        .ele('Status', { code: '200', text: 'OK' }).txt('Order received').up()
      .up()
    .end({ prettyPrint: true });

  return { order, ack };
};

module.exports = { handleSetupRequest, returnCart, handleOrderRequest };
