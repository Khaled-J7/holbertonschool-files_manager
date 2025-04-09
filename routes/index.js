// routes/index.js
import express from "express";
import AppController from "../controllers/AppController";
import UsersController from '../controllers/UsersController';

// Create Router instance
const router = express.Router();

// Define APIs Endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User routes
router.post('/users', UsersController.postNew);

export default router;