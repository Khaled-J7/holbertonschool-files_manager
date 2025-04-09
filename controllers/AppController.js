// controllers/AppController.js
import redisClient from "../utils/redis.mjs";
import dbClient from "../utils/db.mjs";

class AppController {
	/**
	 * Returns the status of Redis and MongoDB connections
	 * 
	 * This endpoint is useful for health checks and monitoring to verify
	 * if the application's core services are running properly.
	 * 
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @returns {Object} - JSON response with Redis and MongoDB status
	 */

	static getStatus(req, res) {
		const status = {
			redis: redisClient.isAlive(),
			db: dbClient.isAlive(),
		};

		return res.status(200).json(status);
	}

	/**
	 * Returns statistics about users and files in the database
	 * 
	 * This endpoint provides a quick overview of the database contents,
	 * reporting the number of users and files currently stored.
	 * 
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @returns {Object} - JSON response with user and file counts
   	*/

	static async getStats(req, res) {
		const stats = {
			users: await dbClient.nbUsers(),
			files: await dbClient.nbFiles(),
		};

		return res.status(200).json(stats);
	}
}

export default AppController;
