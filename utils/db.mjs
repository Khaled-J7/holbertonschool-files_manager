import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    
    const uri = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    
    // Initialize connection state
    this.connected = false;
    this.db = null;
    
    // Connect to MongoDB
    this.client.connect()
      .then(() => {
        this.connected = true;
        this.db = this.client.db(this.database);
      })
      .catch((error) => {
        console.error(`MongoDB connection error: ${error.message}`);
        this.connected = false;
      });
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;
    
    try {
      return await this.db.collection('users').countDocuments();
    } catch (error) {
      console.error(`Error counting users: ${error.message}`);
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;
    
    try {
      return await this.db.collection('files').countDocuments();
    } catch (error) {
      console.error(`Error counting files: ${error.message}`);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
