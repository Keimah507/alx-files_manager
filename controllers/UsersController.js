const sha1 = require('sha1');
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import AuthController from './AuthController';
import { dbClient, ObjectID} from '../utils/db';


class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({error: "Missing email"});
        }
        if (!password) {
            return res.status(400).json({error: "Missing Password"});
        }
        

        const userExists = await dbClient.db.users.findOne({ email: email });

        if (userExists) {
            return res.status(400).json({error: "Already exist"});
        }

        const hashedPw = sha1(password);
        const id = new ObjectID();
        const user = {
            email,
            password: hashedPw,
            _id : id,
        };

        await dbClient.db.users.insertOne(user);
            return res.status(200).json({
                id: user.id,
                email: user.email,
            });
    }

    static async getUser(req, res) {
        const token = req.header('X-token');

        const userId = await redisClient.get(key);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const user = await dbClient.getUser(userId);
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            return res.json({ id: user._id, email: user.email });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
module.exports = UsersController;
