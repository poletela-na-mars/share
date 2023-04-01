import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import helmet from 'helmet';
import cors from 'cors';

import { PostController, UserController } from './controllers/index.js';
import Upload from './models/Upload.js';

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
const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//     destination: (_, __, cb) => {
//         if (!fs.existsSync(path.resolve(process.cwd(), 'uploads'))) {
//             fs.mkdirSync(path.resolve(process.cwd(), 'uploads'));
//         }
//         cb(null, path.resolve(process.cwd(), 'uploads'));
//     },
//     filename: (req, file, cb) => {
//         let extArray = file.mimetype.split("/");
//         let extension = extArray[extArray.length - 1];
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
//     },
// });

const upload = multer({ storage, fileFilter: fileFilter });

app.use(express.json());
app.use(cors());

// app.use('/uploads', express.static('uploads'));

app.post('/auth/login', handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

// app.get('/uploads', (req, res) => {
//     let images = [];
//     fs.readdir(path.resolve(process.cwd(), 'uploads'), (err, files) => {
//         if (!err) {
//             files.forEach(file => {
//                 images.push(file);
//             })
//             res.json({ images: images });
//         } else {
//             console.log(err);
//         }
//     });
// });

app.get('/uploads/:imageUrl', async (req, res) => {
    try {
        const imageUrl = req.params.imageUrl;

        Upload.findOne({
                fileName: imageUrl,
            },
            (err, doc) => {
                if (!doc) {
                    return res.status(404).json({
                        message: 'Изображение не найдено',
                    });
                }

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: 'Не удалось вернуть изображение',
                    });
                }

                // res.contentType(doc.file.contentType);
                res.json(doc);
            },
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось получить изображение',
        });
    }
});
app.post('/uploads', checkAuth, upload.single('image'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({
                message: req.fileValidationError,
            });
        }

        console.log(req.file);
        console.log(req.file.filename);

        let extArray = req.file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let imageUploadObject = {
            file: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            fileName: `${req.file.fieldname}-${uniqueSuffix}.${extension}`,
            // fileName: req.file.filename,
        };
        const uploadObject = new Upload(imageUploadObject);
        const uploadProcess = await uploadObject.save();

        res.json(uploadProcess);
        // res.json({
        //     url: `/uploads/${req.file?.filename}`,
        // });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось загрузить изображение',
        });
    }
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
