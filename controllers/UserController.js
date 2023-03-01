import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import jwt from 'jsonwebtoken';
import { secretHashKey } from '../secretConfigs.js';

const sendTokenAndUserDataResp = (user, res) => {
    const token = jwt.sign({
            _id: user._id,
        },
        secretHashKey,
        {
            expiresIn: '30d',
        },
    );

    const { passwordHash, ...userData } = user._doc;

    return res.json({
        ...userData,
        token,
    });
};

export const register = async (req, res) => {
    try {
        const password = req.body.password;
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });

        const user = await doc.save();

        sendTokenAndUserDataResp(user, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось зарегистрировать пользователя',
        });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            });
        }

        sendTokenAndUserDataResp(user, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось авторизовать пользователя',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        const data = { ...userData };

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Нет доступа',
        });
    }
};
