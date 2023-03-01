import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            unique: true,
        },
        tags: {
            type: Array,
            default: [],
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        imageUrl: String,
        wasEdited: {
            type: Date,
            default: '',
        },
        comments: [
            {
                author: {
                    type: String,
                    required: true,
                },
                date: {
                    type: Date,
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
            }
        ],
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Post', PostSchema);
