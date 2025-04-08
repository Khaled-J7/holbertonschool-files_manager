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
    
    // Try to connect immediately
    this.connectToMongo().catch((error) => {
      console.error('Initial MongoDB connection failed:', error.message);
    });
  }

  async connectToMongo() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.database);
      this.connected = true;
      return true;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  isAlive() {
    // Return boolean directly, not a Promise
    return this.connected;
  }

  async nbUsers() {
    if (!this.isAlive()) {
      return 0;
    }
    try {
      const count = await this.db.collection('users').countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error.message);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) {
      return 0;
    }
    try {
      const count = await this.db.collection('files').countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error.message);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
