// server.js - Archivo principal de la API
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const helmet = require('helmet');
const firebase = require('firebase-admin');
const cron = require('node-cron');

// Rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const deviceRoutes = require('./routes/devices');
const eventRoutes = require('./routes/events');
const notificationRoutes = require('./routes/notifications');

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Firebase para notificaciones push
const serviceAccount = require('./firebase-service-account.json');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Pool de conexiones MySQL
const pool = mysql.createPool(dbConfig);

// Middleware para acceder a la base de datos desde las rutas
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Notificaciones Push funcionando correctamente');
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Programador de tareas para enviar notificaciones pendientes
const notificationService = require('./services/notificationService');

// Ejecutar cada minuto para verificar si hay notificaciones pendientes
cron.schedule('* * * * *', async () => {
  try {
    await notificationService.sendPendingNotifications(pool);
  } catch (error) {
    console.error('Error al enviar notificaciones programadas:', error);
  }
});

module.exports = app;