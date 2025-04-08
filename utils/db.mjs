import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.db = null;
    this.connected = false;

    // Try to connect
    this.connect().catch(() => {
      // Silently handle connection error
      this.connected = false;
    });
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.database);
      this.connected = true;
      return true;
    } catch (err) {
      this.connected = false;
      return false;
    }
  }

  // Modified: Returns a boolean directly, not a Promise
  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (this.db === null) {
      const connectionSuccess = await this.connect();
      if (!connectionSuccess) return 0; // Return 0 if connection fails
    }

    try {
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (err) {
      return 0;
    }
  }

  async nbFiles() {
    if (this.db === null) {
      const connectionSuccess = await this.connect();
      if (!connectionSuccess) return 0; // Return 0 if connection fails
    }

    try {
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (err) {
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
