const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/internal-notes', internalNoteRoutes);
app.use('/api/import', importRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roles', roleRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from KEMET Core API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Core API listening on port ${port}`);
});
