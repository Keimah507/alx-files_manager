const { MongoClient } = require('mongodb');

const {
    DB_HOST = 'localhost',
    DB_PORT = 27017,
    DB_DATABASE = 'files_manager',
} = process.env;

class DBClient {
    constructor() {
        const uri = `mongodb://${DB_HOST}:${DB_PORT}/`;
        const client = new MongoClient(uri, {
            useUnifiedTopology: true,
        });

        client.connect((error) => {
            if (error) {
                console.error(`Error connnecting to MongoDB: ${error}`);
                return;
            }
            console.log('Connected to MongoDB');
            this.db = client.db(DB_DATABASE);
        });
    }

    isAlive() {
        return !!this.db;
    }

    async nbUsers() {
        return this.db.collection('users').countDocuments(); 
    }

    async nbFiles() {
        return this.db.collection('files').countDocuments();
    }
}

const dbClient = new DBClient();
module.exports = dbClient;
