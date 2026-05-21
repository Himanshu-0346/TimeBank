const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const http = require('http');
const compression = require('compression');

const connectDB = require('./config/db');
const socketUtils = require('./utils/sockets');
const { injectLocals } = require('./middleware/auth');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://himanshurana0124_db_user:himanshu1234@cluster0.wkaavm1.mongodb.net/?appName=Cluster0';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketUtils.init(server);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Custom Middleware
app.use(injectLocals);

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/requests', require('./routes/requests'));
app.use('/profile', require('./routes/profile'));
app.use('/rewards', require('./routes/rewards'));
app.use('/leaderboard', require('./routes/leaderboard'));
app.use('/notifications', require('./routes/notifications'));
app.use('/disputes', require('./routes/disputes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('error', { title: '404 - Not Found', message: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: '500 - Server Error', message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB(MONGO_URI);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
