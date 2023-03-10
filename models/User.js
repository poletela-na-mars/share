import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        avatarUrl: String
    },
    {
        timestamps: true,
    },
);

UserSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.passwordHash;
    delete obj.email;
    return obj;
};

export default mongoose.model('User', UserSchema);
