// routes/index.js
import express from "express";
import AppController from "../controllers/AppController";

// Create Router instance
const router = express.Router();

// Define APIs Endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;