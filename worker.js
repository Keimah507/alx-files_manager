import Bull from "bull;
import thumbnail from "image-thumbnail";
import dbClient from '/utils/db';

const fileQueue = new Bull('FileQueue');

fileQueue.process(async (job) => {
    const { userId, fileId } = job.data;

    if (!fileId) {
        throw new Error("Missing FileId");
    }

    if (!userId) {
        throw new Error("Missing userId");
    }

    const file = await clientDb.db.collection('files').find(userId);

    if (!file) {
        throw new Error("File not found");
    }

    const sizes = [ 500, 250, 100 ];

    for (let size of sizes) {
        const thumbnailName = `${name}_${size}`;

        const thumbnailBuffer = await thumbnail(`uploads/${file}.${type}`, { width: size });
    }
});
