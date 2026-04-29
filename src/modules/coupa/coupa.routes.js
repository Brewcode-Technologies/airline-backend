const router = require('express').Router();
const express = require('express');
const { punchoutSetup, punchoutReturn, receiveOrder } = require('./coupa.controller');

// Coupa sends raw XML — parse as text for these two endpoints
const rawXml = express.text({ type: ['text/xml', 'application/xml', '*/*'] });

router.post('/punchout/setup', rawXml, punchoutSetup);
router.post('/order', rawXml, receiveOrder);

// Frontend sends JSON cart to trigger the return
router.post('/punchout/return', express.json(), punchoutReturn);

module.exports = router;
