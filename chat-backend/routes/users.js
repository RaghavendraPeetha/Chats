const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all conversations for the authenticated user
router.route('/').get(auth, async (req, res) => {
    try {
      const users = await User.find().select('-password -email'); // Exclude password and email from the response
      console.log(users)
      res.json(users); // Send users as JSON response
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;