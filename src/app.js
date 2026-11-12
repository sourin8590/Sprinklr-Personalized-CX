const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const requestId = require('./middleware/requestId');
const mockChaos = require('./middleware/mockChaos');
const { authenticate } = require('./middleware/auth');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const planRoutes = require('./routes/planRoutes');
const billingRoutes = require('./routes/billingRoutes');
const identityRoutes = require('./routes/identityRoutes');
const simRoutes = require('./routes/simRoutes');
const caseRoutes = require('./routes/caseRoutes');
const outboundRoutes = require('./routes/outboundRoutes');
const ivrRoutes = require('./routes/ivrRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();

const swaggerDocument = fs.existsSync(path.join(__dirname, '../openapi.yaml'))
  ? require('yaml').parse(fs.readFileSync(path.join(__dirname, '../openapi.yaml'), 'utf8'))
  : { openapi: '3.0.0', info: { title: 'Windtre Mock API', version: '1.0.0' } };

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(requestId);
app.use(mockChaos);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests',
        details: [],
      },
      requestId: req.requestId,
    });
  },
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, requestId: req.requestId });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', authenticate);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1', billingRoutes);
app.use('/api/v1/identity', identityRoutes);
app.use('/api/v1', simRoutes);
app.use('/api/v1', caseRoutes);
app.use('/api/v1', outboundRoutes);
app.use('/api/v1', ivrRoutes);
app.use('/api/v1', systemRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
