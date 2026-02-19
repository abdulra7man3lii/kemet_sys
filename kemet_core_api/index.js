const express = require('express');
const cors = require('cors');
require('dotenv').config();

// BigInt serialization fix for JSON.stringify
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();
const port = process.env.PORT || 4000;

const authRoutes = require('./src/routes/authRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes');
const internalNoteRoutes = require('./src/routes/internalNoteRoutes');
const importRoutes = require('./src/routes/importRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const laundryRoutes = require('./src/routes/laundryRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const storageRoutes = require('./src/routes/storageRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');
const whatsappRoutes = require('./src/routes/whatsappRoutes');

const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');
const logger = require('./src/middleware/loggerMiddleware');

app.use(logger);
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/internal-notes', internalNoteRoutes);
app.use('/api/import', importRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from KEMET Core API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Core API listening on port ${port}`);
});
