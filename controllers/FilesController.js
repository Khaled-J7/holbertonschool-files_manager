// controllers/FilesController.js
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  /**
   * Uploads a new file or creates a new folder
   * 
   * This endpoint handles the creation of three types of items:
   * 1. Folders - organizational units in the database
   * 2. Files - text or binary files stored on disk
   * 3. Images - specialized files specifically marked as images
   * 
   * Files and images are stored both in the database (metadata)
   * and on disk (content), while folders exist only in the database.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with new file data or error message
   */
  static async postUpload(req, res) {
    // Retrieve the token from request headers
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user ID from Redis using token
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract file information from request body
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    // Validate file type
    const acceptedTypes = ['folder', 'file', 'image'];
    if (!type || !acceptedTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    // Validate data for file and image types
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    // If parentId is provided, verify parent exists and is a folder
    if (parentId !== 0) {
      let parent;
      try {
        parent = await dbClient.db.collection('files').findOne({
          _id: ObjectId(parentId),
        });
      } catch (error) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Create the file document for the database
    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
    };

    // If it's a folder, simply save to database
    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      // Return the new folder information
      return res.status(201).json({
        id: result.insertedId.toString(),
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    }

    // For files and images, store the content on disk
    // Get the storage folder path
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    
    // Create the storage folder if it doesn't exist
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    } catch (error) {
      console.error(`Error creating folder: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Generate a unique filename
    const filename = uuidv4();
    const localPath = path.join(folderPath, filename);

    // Decode and save the file
    try {
      // Decode the Base64 data
      const fileContent = Buffer.from(data, 'base64');
      // Write the file to disk
      fs.writeFileSync(localPath, fileContent);
    } catch (error) {
      console.error(`Error saving file: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Add the local path to the file document and save to database
    fileDocument.localPath = localPath;
    const result = await dbClient.db.collection('files').insertOne(fileDocument);

    // Return the new file information (without localPath)
    return res.status(201).json({
      id: result.insertedId.toString(),
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }
}

export default FilesController;
