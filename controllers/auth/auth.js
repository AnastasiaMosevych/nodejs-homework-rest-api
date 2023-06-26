const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require("path");
const fs = require('fs/promises');
const Jimp = require("jimp");
const avatar = require('gravatar');
const { User } = require('../../models/user');
const { HttpError, ctrlWrapper, sendEmail } = require('../../helpers');
const { SECRET_KEY, BASE_URL } = process.env;
const { nanoid } = require("nanoid");

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email already in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = avatar.url(User.email);
    const verificationToken = nanoid();
    
    const newUser = User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click to verify your email</a>`,
    }
    await sendEmail(verifyEmail);

    res.status(201).json({
        email: newUser.email,
        name: newUser.name, 
    })
}

const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params;
    const user = User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });
    
    res.status(200).json({
        message: "Verification successful"
    })
}

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email not found");
    }
    if (user.verify) {
        throw HttpError(400, "Verification has already been passed");
    }
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click to verify your email</a>`,
    }
    await sendEmail(verifyEmail);

    res.status(200).json({
        message: "Verification email sent"
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email or password invalid");
    }

    if (!user.verify) {
        throw HttpError(401, "Email not verified");
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
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    setAvatar: ctrlWrapper(setAvatar),
}