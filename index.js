import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import { PostController, UserController } from './controllers/index.js';

import { adminPass } from './secretConfigs.js';

import { checkAuth, handleValidationErrors } from './utils/index.js';
import { loginValidation, postCreateValidation, registerValidation } from './validations.js';

mongoose.set('strictQuery', true);
mongoose.connect(`mongodb+srv://admin:${adminPass}@cluster0.2otrlsf.mongodb.net/blog-share?retryWrites=true&w=majority`)
    .then(() => console.log('DB ok'))
    .catch((err) => console.error('DB error', err));

const app = express();

//TODO -менять название файла. проверки расширений, ошибки
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({storage});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.get('/posts', PostController.getAll);
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
