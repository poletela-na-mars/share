import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'fs';

import { PostController, UserController } from './controllers/index.js';

import { checkAuth, handleValidationErrors } from './utils/index.js';
import { commentCreateValidation, fileFilter, postCreateValidation, registerValidation } from './validations.js';

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('DB OK'))
    .catch((err) => console.error('DB error', err));

const app = express();

// app.options('*', ((req, res) =>
//         res.sendStatus(200)
// ));
// app.options('*', cors());

// app.use(
//     helmet({
//         crossOriginResourcePolicy: false,
//         crossOriginEmbedderPolicy: false,
//     })
// );

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'https://share-frontend.vercel.app');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    },
});

const upload = multer({ storage, fileFilter: fileFilter });

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

app.post('/auth/login', handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);


app.get('/uploads', (req, res) => {
    let images = [];
    fs.readdir('./uploads/', (err, files) => {
        if (!err) {
            files.forEach(file => {
                images.push(file);
            })
            res.render('index', { images: images});
        } else {
            console.log(err);
        }
    });
});
app.post('/uploads', checkAuth, upload.single('image'), (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({
            message: req.fileValidationError,
        });
    }

    res.json({
        url: `/uploads/${req.file?.filename}`,
    });
});

app.get('/tags', PostController.getLastTags);
app.post('/posts/:id', checkAuth, commentCreateValidation, handleValidationErrors, PostController.createComment);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

const port = process.env.PORT || 4444;
app.listen(port, (err) => {
    if (err) {
        return console.error(err);
    }

    console.log('Server OK');
    console.log(`Server is running on ${port}`);
});
