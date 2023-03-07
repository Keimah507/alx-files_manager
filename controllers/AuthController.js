import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { sha1, UsersController } from './UsersController';
import { v4 as uuidv4 } from 'uuid';
import redis from 'redis';

class AuthController {

    static async getConnect(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.set('WWW-Authenticate', 'Basic realm="User Visible Realm", charset="UTF-8"');
            res.status(401).json({Error: "Unauthorized"});
            return;
        }

        const base64Credentials = authHeader.slice("Basic ".length);
        const credentials = Buffer.from(base64Credentials, "base64").toString('ascii');
        const [ id, email, password ] = credentials.split(":");

        const user = await dbClient.db.collection('users').find({ email: email,  password: password });
        if (!user) {
            res.status(401).send({ error: "Unauthorized"});
            return;
        }

        const token = uuidv4();
        const key =`auth_${token}`;
        redisClient.setex(key, 84600, user.id);

        res.status(200).send({ token });
    }

    static async getDisconnect(req, res) {
        const token = req.headers["x-token"];
        if (!token) {
            res.status(401).json({ error: "Unauthorized"});
            return;
        }

        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        redisClient.del(key);
        res.status(204);
    }
}

module.exports = AuthController;

