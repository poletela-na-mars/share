import { body } from 'express-validator';

export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail().isLength({min: 5, max: 40}),
    body('password',
        `Пароль должен быть минимум 6 символов, содержать строчные(-ую) и заглавные(-ую) буквы/букву, цифры(-у).`)
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
        .isLength({max: 40}),
];

export const registerValidation = [
    ...loginValidation,
    body('fullName', 'Укажите корректное имя').isLength({min: 2, max: 40}).matches(/^[А-яЁё A-Za-z-\s]+$/),
    body('avatarUrl', 'Некорректная ссылка на аватар пользователя').optional().isURL(),
];

export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({min: 3, max: 100})
        .withMessage('Слишком короткий или длинный заголовок').isString(),
    body('text', 'Введите текст статьи').isLength({min: 3, max: 500})
        .withMessage('Слишком короткая или длинная статья').isString(),
    body('tags', 'Неверный формат тэгов').optional().isString(),
    body('imageUrl', 'Некорректная ссылка на изображение').optional().isString(),
];

//TODO -достаточно ли строгая валидация
