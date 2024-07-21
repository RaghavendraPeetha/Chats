const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  image: { type: String, default: '' },
  sender: { type: String, required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
