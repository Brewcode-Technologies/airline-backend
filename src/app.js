const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/user.routes'));
app.use('/api/vendors', require('./modules/vendors/vendor.routes'));
app.use('/api/skus', require('./modules/skus/sku.routes'));
app.use('/api/orders', require('./modules/orders/order.routes'));
app.use('/api/drivers', require('./modules/drivers/driver.routes'));
app.use('/api/tracking', require('./modules/tracking/tracking.routes'));
app.use('/api/proof', require('./modules/proof/proof.routes'));
app.use('/api/analytics', require('./modules/analytics/analytics.routes'));
app.use('/api/theme', require('./modules/theme/theme.routes'));

app.use(errorMiddleware);

module.exports = app;
