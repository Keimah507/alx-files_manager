import express from 'express';
import Routes from './routes/index';

const app = express();
const port  = process.env.PORT || 5000;

app.use(express.json());
Routes(app);

app.listen(port, () => {
    console.log(`Server Listening on port ${port}`);
});

module.export = app;
