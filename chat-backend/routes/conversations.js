const router = require('express').Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const moment = require('moment-timezone');

// Get all conversations for the authenticated user
router.route('/').get(auth, async (req, res) => {
  try {
    console.log("Getting all conversations...");

    // Find all conversations where the authenticated user is a participant
    const conversations = await Conversation.find({ participants: req.user._id }).populate('participants');

    res.json(conversations); // Send the conversations as JSON response
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(400).json('Error: ' + err.message); // Send an error response
  }
});


// Add a new conversation
router.route('/add').post(auth, async (req, res) => {
  try {
    console.log("conversations route is running....");

    const recipientId = req.body.participants[1]; // Assuming the field is 'name' in req.body
    const recipient = await User.findOne({ _id: recipientId });
    //console.log(req.body)
    if (!recipient) {
      return res.status(404).json('Recipient user not found');
    }

    const participants = req.body.participants;
    const newConversation = new Conversation({ participants });

    await newConversation.save();
    
    // Fetch the newly created conversation from the database
    const savedConversation = await Conversation.findById(newConversation._id).populate('participants', 'username');

    // Check if the conversation was saved successfully
    if (!savedConversation) {
      return res.status(404).json({ error: 'Failed to save conversation' });
    }

    // Return the saved conversation object with its _id
    res.status(200).json(savedConversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(400).json('Error: ' + err.message); // Send an error response
  }
});


// DELETE a new conversation -- /conversations/:id
router.route('/:id').delete(auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the conversation by id and delete it
    const deletedConversation = await Conversation.findByIdAndDelete(id);

    if (!deletedConversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Optionally, you might want to handle additional logic here, such as notifying participants

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get conversation details by ID
router.route('/:id').get(auth, async (req, res) => {
  console.log(">>>>>>>")
  try {
    const conversationId = req.params.id;
    console.log('Fetching conversation:', conversationId);

    // Example: Populate participants with usernames
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'username');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific conversation
router.route('/:id/messages').get(auth, (req, res) => {
  Message.find({ conversation: req.params.id }).populate('user')
    .then(messages => {
      messages = messages.map(message => ({
        ...message._doc,
        createdAt: moment(message.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
      }));
      res.json(messages);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});


// Add a new message to a conversation
router.route('/:id/messages/add').post(auth, (req, res) => {
  const user = req.user._id;
  const content = req.body.content;
  const image = req.body.image || '';
  const sender = req.user.username;
  const conversation = req.params.id;

  const newMessage = new Message({ user, content, image, sender, conversation });

  newMessage.save()
    .then(message => {
      return Conversation.findByIdAndUpdate(conversation, { $push: { messages: message._id } });
    })
    .then(() => res.json('Message added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
