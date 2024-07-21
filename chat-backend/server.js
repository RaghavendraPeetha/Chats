const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3004', // Frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

const authRouter = require('./routes/auth');
const conversationsRouter = require('./routes/conversations');
const messagesRouter = require('./routes/messages');
const usersRouter = require('./routes/users');

app.use('/auth', authRouter);
app.use('/conversations', conversationsRouter);
app.use('/messages', messagesRouter);
app.use('/users', usersRouter);

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
