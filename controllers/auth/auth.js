const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require("path");
const fs = require('fs/promises');
const Jimp = require("jimp");
const avatar = require('gravatar');
const { User } = require('../../models/user');
const { HttpError, ctrlWrapper } = require('../../helpers');
const { SECRET_KEY } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email already in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = avatar.url(User.email);
    const newUser = User.create({ ...req.body, password: hashPassword, avatarURL });
    res.status(201).json({
        email: newUser.email,
        name: newUser.name, 
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email or password invalid");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid");
    }

    const payload = {
        id: user._id,
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
    await User.findByIdAndUpdate(user._id, {token});
    res.json({
        token,
    })
}

const getCurrent = async (req, res) => {
    const { email, name } = req.user;
    res.json({
        email,
        name,
    })
}

const logout = async(req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});

    res.json({
        message: "Logout success"
    })
}

const avatarsDir = path.join(process.cwd(), 'public', 'avatars');

const setAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const resizedAvatar = Jimp.read(tempUpload)
        .then((avatarImage) => {
            return avatarImage
                .resize(250, 250)
                .write(avatarURL)

        }).catch((error) => {
        console.log(error.message)
        });
    const filename = `${_id}_${originalname}`; 
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { resizedAvatar });

    res.json({
        avatarURL
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    setAvatar: ctrlWrapper(setAvatar),
}