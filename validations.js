import { body } from 'express-validator';

export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail().isLength({ min: 5, max: 40 }).withMessage('Неверный формат почты'),
    body('password',
        'Пароль должен быть минимум 6 символов, содержать строчные(-ую) и заглавные(-ую) буквы/букву, цифры(-у).')
        .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
            returnScore: false,
            pointsPerUnique: 1,
            pointsPerRepeat: 0.5,
            pointsForContainingLower: 10,
            pointsForContainingUpper: 10,
            pointsForContainingNumber: 10,
            pointsForContainingSymbol: 10,
        })
        .isLength({ max: 40 })
        .withMessage(
            'Пароль должен быть минимум 6 символов, содержать строчные(-ую) и заглавные(-ую) буквы/букву, цифры(-у).'),
    body('fullName', 'Укажите корректное имя').isLength({ min: 2, max: 40 }).matches(/^[А-яЁёA-Za-z]+ [А-яЁёA-Za-z]+$/)
        .withMessage('Слишком короткое/длинное или некорректное имя'),
    body('avatarUrl', 'Некорректная ссылка на аватар пользователя').optional().isURL(),
];

export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({ min: 3, max: 100 })
        .withMessage('Слишком короткий или длинный заголовок').isString(),
    body('text', 'Введите текст статьи').isLength({ min: 3, max: 500 })
        .withMessage('Слишком короткая или длинная статья').isString(),
    // body('tags', 'Неверный формат тегов').optional().isString().matches(/(([#-_+*."'`;:№$%^&]{0,2}[А-яЁёA-Za-z\d]{1,20}[#-_+*."'`;:№$%^&]{0,2})\s*,*\s*)+/),
    body('tags', 'Неверный формат тегов').optional(),
    body('imageUrl', 'Некорректная ссылка на изображение').optional().isString(),
];

export const commentCreateValidation = [
    body('text', 'Введите текст комментария').isLength({ min: 1, max: 100 })
        .withMessage('Слишком короткий или длинный комментарий').isString(),
];

export const fileFilter = (req, file, cb) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const minSize = 5 * 1024;
    let errorMsg;

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
        errorMsg = 'Недопустимый формат изображения.';
        req.fileValidationError = errorMsg;
        return cb(null, false, new Error(errorMsg));
    }

    const reFileName = /^[А-яёЁ a-zA-Z0-9_-]{1,80}\.[a-zA-Z]{1,8}$/;
    if (!reFileName.test(file.originalname)) {
        errorMsg = 'Недопустимое имя или расширение файла.';
        req.fileValidationError = errorMsg;
        return cb(null, false, new Error(errorMsg));
    }

    if (file.size >= maxSize || file.size <= minSize) {
        errorMsg = 'Изображение слишком большое или слишком маленькое.';
        req.fileValidationError = errorMsg;
        return cb(null, false, new Error(errorMsg));
    }

    cb(null, true);
};
