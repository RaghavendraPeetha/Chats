const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const moment = require('moment-timezone');

router.route('/').get(auth, async (req, res) => {
  try {
    const messages = await Message.find().populate('user');
    const formattedMessages = messages.map(message => ({
      ...message._doc,
      createdAt: moment(message.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
    }));
    res.json(formattedMessages);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.route('/add').post(auth, async (req, res) => {
  try {
    const { content, image } = req.body;
    const user = req.user._id;
    const sender = req.user.username;

    const newMessage = new Message({ user, content, image, sender });

    await newMessage.save();
    res.json('Message added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
