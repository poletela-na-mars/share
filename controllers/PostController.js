import PostModel from '../models/Post.js';

//TODO: -нужно ли оставить свойство user в response?
//TODO: -убрать passwordHash
//TODO: -!удалять фотки из uploads при удалении/редактировании статьи

export const getLastTags = async (req, res) => {
    try {
        const NUMBER_OF_VISIBLE_TAGS = 100;
        const posts = await PostModel.find().limit(NUMBER_OF_VISIBLE_TAGS).exec();

        const tags = posts.flatMap((obj) => obj.tags).slice(0, NUMBER_OF_VISIBLE_TAGS);

        // posts.forEach((post) => {
        //     post.user.passwordHash = '';
        // });

        res.json(tags);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось получить теги',
        });
    }
};

export const getAll = async (req, res) => {
    try {
        let sortQuery;

        console.log(req.query.sort);

        if (req.query.sort === 'new') {
            sortQuery = {
                createdAt: -1,
            }
        } else if (req.query.sort === 'popular') {
            sortQuery = {
                viewsCount: -1,
            }
        }
        const posts = await PostModel.find().sort(sortQuery).populate('user').exec();

        // posts.forEach((post) => {
        //     post.user.passwordHash = '';
        // });

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
                $inc: {viewsCount: 1}
            },
            {
                returnDocument: 'after',
            },
            (err, doc) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: 'Не удалось вернуть статью',
                    });
                }

                if (!doc) {
                    return res.status(404).json({
                        message: 'Статья не найдена',
                    });
                }

                // doc.user.passwordHash = '';
                res.json(doc);
            },
        ).populate('user');
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось получить статью',
        });
    }
};

export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        PostModel.findOneAndDelete({
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

                res.json({
                    success: true,
                });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({
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
            message: 'Не удалось создать статью',
        });
    }
};

export const update = async (req, res) => {
    try {
        const postId = req.params.id;

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

        res.json({
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось обновить статью',
        });
    }
};
