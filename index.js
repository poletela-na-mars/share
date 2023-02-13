import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import helmet from 'helmet';
import cors from 'cors';

import { PostController, UserController } from './controllers/index.js';

import { adminPass } from './secretConfigs.js';

import { checkAuth, handleValidationErrors } from './utils/index.js';
import { loginValidation, postCreateValidation, registerValidation, fileFilter } from './validations.js';

mongoose.set('strictQuery', true);
mongoose.connect(`mongodb+srv://admin:${adminPass}@cluster0.2otrlsf.mongodb.net/blog-share?retryWrites=true&w=majority`)
    .then(() => console.log('DB OK'))
    .catch((err) => console.error('DB error', err));

const app = express();
// app.use(helmet());
// app.use(
//     helmet({
//         crossOriginEmbedderPolicy: false,
//     })
// );

app.use(
    helmet({
        crossOriginResourcePolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    },
});

const upload = multer({storage, fileFilter: fileFilter});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({
            message: req.fileValidationError,
        });
    }

    res.json({
        url: `/uploads/${req.file.filename}`,
    });
});

app.get('/tags', PostController.getLastTags);


app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.listen(4444, (err) => {
    if (err) {
        return console.error(err);
    }

    console.log('Server OK');
});
