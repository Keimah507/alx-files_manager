import { createClient } from 'redis';
const { promisify } = require('util');

class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on('error', (error) => {
            console.log(`error occured ${error}`);
        });
    }

    isAlive() {
        if(this.client.connected) {
            return true;
        } else {
            return false;
        }
    }

    async get(key) {
        const getAsync = promisify(this.client.get).bind(this.client);
        return await getAsync(key);
    }

    async set(key, value, duration) {
        const setAsync = promisify(this.client.set).bind(this.client);
        return await setAsync(key, value, 'EX', duration);
    }

    async del(key) {
        const delAsync = promisify(this.client.del).bind(this.client);
        return await delAsync(key);
    }
}

const redisClient =  new RedisClient();
module.exports = redisClient;
