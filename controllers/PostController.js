import PostModel from '../models/Post.js';
import Upload from '../models/Upload.js';
import mongoose from 'mongoose';

const NUMBER_OF_VISIBLE_TAGS = 100;

const removeImage = async (oldImageUrl, res) => {
    try {
        const imageUrl = oldImageUrl;

        if (imageUrl) {
            Upload.findOneAndDelete({
                    fileName: imageUrl.replace('/uploads/', ''),
                },
                (err, doc) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            message: 'Не удалось удалить изображение',
                        });
                    }

                    if (!doc) {
                        return res.status(404).json({
                            message: 'Изображение не найдено',
                        });
                    }

                    return true;
                });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Не удалось удалить изображение',
        });
    }
};

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 }).limit(NUMBER_OF_VISIBLE_TAGS).exec();
        const tags = posts.flatMap((obj) => obj.tags).slice(0, NUMBER_OF_VISIBLE_TAGS);

        return res.json(tags);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Не удалось получить теги',
        });
    }
};

export const getAll = async (req, res) => {
    try {
        let sortQuery = {
            createdAt: -1,
        };
        let selectedTag;

        const reqSort = req.query.sort;

        switch (reqSort) {
            case 'new':
                break;
            case 'popular':
                sortQuery = {
                    viewsCount: -1,
                };
                break;
            case 'tag':
                selectedTag = {
                    tags: req.query.tag,
                };
                break;
        }

        let posts = await PostModel.find(selectedTag).sort(sortQuery).populate('user').exec();

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось получить статьи',
        });
    }
};

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        PostModel.findOneAndUpdate({
                _id: postId,
            },
            {
                $inc: { viewsCount: 1 }
            },
            {
                returnDocument: 'after',
            },
            (err, doc) => {
                if (!doc) {
                    return res.status(404).json({
                        message: 'Статья не найдена',
                    });
                }

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: 'Не удалось вернуть статью',
                    });
                }

                return res.json(doc);
            },
        ).populate('user');
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Не удалось получить статью',
        });
    }
};

export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        const removeImageSuccess = await removeImage(req.body.imageUrl, res);

        if (removeImageSuccess === true || removeImageSuccess === undefined) {
            await PostModel.findOneAndDelete({
                    _id: postId,
                },
                (err, doc) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            message: 'Не удалось удалить статью',
                        });
                    }

                    if (!doc) {
                        return res.status(404).json({
                            message: 'Статья не найдена',
                        });
                    }

                    return res.json({
                        success: true,
                    });
                });
        } else {
            return removeImageSuccess;
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Не удалось удалить статью',
        });
    }
};

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        });

        const post = await doc.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при создании статьи.\nПерезагрузите страницу и попробуйте снова.',
        });
    }
};

export const update = async (req, res) => {
    try {
        const postId = req.params.id;
        let removeImageSuccess;

        if (req.body.oldImageUrl) {
            removeImageSuccess = await removeImage(req.body.oldImageUrl, res);
        }

        if (removeImageSuccess === true || removeImageSuccess === undefined) {
            await PostModel.updateOne({
                    _id: postId,
                },
                {
                    title: req.body.title,
                    text: req.body.text,
                    imageUrl: req.body.imageUrl,
                    user: req.userId,
                    tags: req.body.tags,
                    wasEdited: new Date(),
                },
            );

            return res.json({
                success: true,
            });
        } else {
            return removeImageSuccess;
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Ошибка при обновлении статьи.\nПерезагрузите страницу и попробуйте снова.',
        });
    }
};

export const createComment = async (req, res) => {
    try {
        const postId = mongoose.Types.ObjectId(req.params.id);

        await PostModel.updateOne({
                _id: postId,
            },
            {
                $push: {
                    comments: {
                        author: req.body.author,
                        date: new Date(),
                        text: req.body.text,
                    },
                },
                $inc: { commentsCount: 1 },
                returnDocument: 'after',
            },
        );

        res.json({
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при создании комментария.\nПерезагрузите страницу и попробуйте снова.',
        });
    }
};
