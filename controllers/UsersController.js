// controllers/UsersController.js
import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  /**
   * Creates a new user in the database
   * 
   * This endpoint handles user registration with validation for required fields
   * and uniqueness checks for email. Passwords are securely hashed using SHA1.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with user data or error message
   */
  static async postNew(req, res) {
    // Extract user data from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if user already exists
    try {
      const existingUser = await dbClient.db.collection('users').findOne({ email });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Create new user with hashed password
      const hashedPassword = sha1(password);
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      // Return new user data
      return res.status(201).json({
        id: result.insertedId.toString(),
        email,
      });
    } catch (error) {
      console.error('Error creating user:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
