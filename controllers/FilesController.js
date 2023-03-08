import redisClient from "../utils/redis":
import dbClient from "../utils/db";
import AuthController from "./AuthController";
import { ObjectId } from "mongodb";

const FOLDERPATH = process.env.FOLDERPATH || '/tmp/files_manager';

class FilesController {
    static async postUpload(req, res) {
        const userId = req.user.id
        try {
            const user = await redisClient.get(userId);
            const  { name, type, parentId, isPublic, data } = req.body;
            if (!name) {
                return res.status(400).json({error: "Missing name" });
            }
            const acceptedTypes = ['folder', 'file', 'image'];
            if (!type || acceptedTypes.includes(type)) {
                return res.status(400).json({error: "Missing type"});
            }
            if (!data || type != folder) {
                return res.status(400).json({error: "Missing data"});
            }
            if (parentId) {
                const file = await dbClient.db.collection('files').find({parentId: parentId})
                if (!file) {
                    return res.status(400).json({error: "Parent not found"});
                }
                if (file.type != folder) {
                    return res.status(400).json({error: "Parent is not a folder"});
                }
            }

                const userId = req.user._id;

                let localPath;
                if (type != 'folder') {
                    try {
                        await stat(FOLDERPATH);
                    } catch (err) {
                        await mkdir(FOLDERPATH, { recursive: true });
                    }
                }

                    const file = {
                        userId ; userId,
                        name: name,
                        type: type,
                        isPublic: Boolean(isPublic),
                        parentId: parentId ? ObjectId(parentId): null,
                        localPath: localPath || null,
                    };

                    const res = await.db.collection('files').insertOne(file);

                    const newFile = {
                        _id: res.insertedId,
                        userId: userId,
                        name: name,
                        type: type,
                        isPublic: Boolean(isPublic),
                        parentId: parentId || 0,
                        localPath: localPath || 0,
                    };

                    return res.status(200).json(newFile);

            fileQueue.add({ _id, userId });

        } catch (err) {
            return res.status(401).json({error: "unauthorized"});
        }
    }

    static async getShow(req, res) {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }

        const file = await dbClient.db.collection('files').find(userId);
        if (!file) {
            return res.status(404).json({error: "Not found"});
        }

        return res.json(file);
    }

    static async getIndex(req, res) {
        const userId = req.headers.authorization;
        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }

        const { parentId = 0, page = 0 } req.query;
        const limit = 20;
        const skip = page * limit;

        const pipeline = [
            {
                $match: {
                    userId = new ObjectId(userId),
                    parentId = new ObjectId(parentId),
                },
            },
            {
                $sort: { name: 1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ];

        try {

            const files = await dbClient.db('files_manager').collection('files').aggregate(pipeline).toArray();

            res.json(files);
        } catch {
            return res.status(500).json({error: "Internal server error"});
        }
    }

    static async putPublish(res, req) {
        const id = req.params;
        const userId = req.user.id;

        const file = dbClient.db.collection('files').findOne({_id: ObjectId(id), userId});


        if (!file) {
            return res.status(401).json({error: "Not found"});
        }

        const result = await dbClient.db.collection('files').updateOne(
            { _id: ObjectId(id), userId },
            { $set: { isPublic: true } }
        );

        return res.status(200).json(file);
    }

    static async putUnpublish(res, req) => {
        try {

            const id = req.params;
            const userId = req.user.id;

            const result = await clientDb.db.collection('files').findOneAndUpdate(
                { _id: ObjectId(id), userId },
                { $set: { isPublic: false } },
                { returnOriginal: false }
            );

            if (!result.value) {
                return status(404).json({error: "File not found"});
            }

            res.status(200).json(result.value);
        } catch (err) {
            return res.status(500).json({error: "Internal server error"});
    }
    }

    status async getFile(res, req) => {
        const id = req.params;
        const size = req.query;
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }

        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });

        if (!file) {
            return res.status(404).json({error: "Not found"});
        }

        if (!file.isPublic && (!userId || file.userId == userId)) {
            return res.status(404).json({error: "Not found"});
        }
        if (file.type === 'folder') {
            return res.status(400).json({error: "A folder does not have content"});
        }

        const localPath = path.join(process.env.FOLDER_PATH || '/tmp/files_manager',file.localPath);
        if (!fs.existsSync(localPath)) {
            return res.status(404).json({error: "Not found"});
        }

        const mimeType = mime.lookup(file.name);
        res.setHeader('Content-Type', mimeType);
        const stream = fs.createReadStream(localPath);
        stream.pipe(res);
    }
}
