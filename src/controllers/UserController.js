import User from "../models/User.js";
import { uploadImage } from "../utils/firebaseUpload.js";
import genToken from "../utils/genToken.js";
import hashPassword from "../utils/hashPassword.js";

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const validatePhone = (phone) => {
    return phone.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/);
};

// [GET] /api/users
export const getAllUsers = async (req, res, next) => {
    User.find({})
        .then((users) => res.status(201).json(users))
        .catch(next);
};

//[POST] /api/user
export const registerUser = async (req, res, next) => {
    const { name, email, password, phone, confirmPassword } = req.body;
    if (!name || !email || !password || !phone || !confirmPassword) {
        res.status(400);
        return next(new Error("You must fill in all information"));
    }

    if (!validateEmail(email)) {
        res.status(400);
        return next(new Error("Email is not valid"));
    }

    if (!validatePhone(phone)) {
        res.status(400);
        return next(new Error("Phone number is not valid"));
    }

    if (password !== confirmPassword) {
        res.status(400);
        return next(new Error("Password and confirm password do not match"));
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400);
        return next(new Error("Email has already existed!"));
    }
    const checkPhone = await User.findOne({ phone: phone });

    if (checkPhone) {
        res.status(400);
        return next(new Error("Phone number has already existed"));
    }

    const user = new User({ name, email, password, phone });
    user.save()
        .then((user) => {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                token: genToken(user._id),
            });
        })
        .catch(next);
};

//[POST] /api/user/login
export const authUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        return next(new Error("You must fill email and password"));
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            token: genToken(user._id),
        });
    } else {
        res.status(401);
        return next(new Error("Invalid email or password !"));
    }
};

//[PATCH] /api/user/update
export const updateProfile = async (req, res, next) => {
    let userId = req.user._id;
    const { name, phone, address } = req.body;
    let updateObj = {};
    if (phone) {
        if (validatePhone(phone)) {
            updateObj = { ...updateObj, phone: phone };
        } else {
            res.status(400);
            return next(new Error("Phone number is not valid"));
        }
    }
    if (address) {
        if (address.length < 1000) {
            updateObj = { ...updateObj, address: address };
        } else {
            res.status(400);
            return next(
                new Error("Address length must be less than 1000 characters")
            );
        }
    }
    if (name) {
        if (name.length >= 6 && name.length <= 50) {
            updateObj = { ...updateObj, name: name };
        } else {
            res.status(400);
            return next(new Error("Length of name must be in range [6, 50]"));
        }
    }
    if (Object.keys(updateObj).length == 0) {
        res.status(400);
        return next(new Error("Nothing changes"));
    }
    try {
        let user = await User.findOneAndUpdate({ _id: userId }, updateObj, {
            new: true,
        });
        res.status(200).json({ message: "Update successfully", user: user });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

//[PATCH] /api/user/update-password
export const updatePassword = async (req, res, next) => {
    let userId = req.user._id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        res.status(400);
        return next(new Error("All fields must be filled"));
    }
    if (newPassword.length < 8) {
        res.status(400);
        return next(new Error("Passwrod length must be greater than 7"));
    }
    if (newPassword !== confirmNewPassword) {
        res.status(400);
        return next(new Error("Password and Confirm Password do not match"));
    }
    let user = await User.findOne({ _id: userId });
    if (user && (await user.matchPassword(oldPassword))) {
        let hashPass = await hashPassword(newPassword);
        User.findOneAndUpdate(
            { _id: userId },
            { password: hashPass },
            { new: false },
            (error) => {
                if (error) {
                    res.status(500);
                    return next(
                        new Error("Update password has Internal error")
                    );
                } else {
                    res.status(200).json({
                        message: "Update password successfully",
                    });
                }
            }
        );
    } else {
        res.status(400);
        return next(new Error("Old password is wrong"));
    }
};

//[PATCH] /api/user/update-avatar
export const updateAvatar = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const file = req.file;
        const avatar = await uploadImage(file);
        User.findOneAndUpdate(
            { _id: userId },
            { avatar: avatar.url },
            { new: true },
            (error, user) => {
                if (error) {
                    return res
                        .status(400)
                        .json({ status: false, message: "Update failed" });
                } else {
                    return res
                        .status(200)
                        .json({
                            status: true,
                            message: "Update successfully",
                            avatar: avatar.url,
                        });
                }
            }
        );
    } catch (error) {
        res.status(400);
        return next(new Error(error.message));
    }
};

//[POST] /api/user/create-admin
export const createAdminAccount = async (req, res, next) => {
    const { name, email, password, avatar, phone, confirmPassword } = req.body;
    let role = "admin";
    if (!name || !email || !password || !phone || !confirmPassword) {
        res.status(400);
        return next(new Error("You must fill in all information"));
    }

    if (!validateEmail(email)) {
        res.status(400);
        return next(new Error("Email is not valid"));
    }

    if (!validatePhone(phone)) {
        res.status(400);
        return next(new Error("Phone number is not valid"));
    }

    if (password !== confirmPassword) {
        res.status(400);
        return next(new Error("Password does not match"));
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400);
        return next(new Error("Email has already existed!"));
    }
    const checkPhone = await User.findOne({ phone: phone });

    if (checkPhone) {
        res.status(400);
        return next(new Error("Phone number has already existed"));
    }

    const user = new User({ name, email, password, avatar, phone, role });
    user.save()
        .then((user) => {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                token: genToken(user._id),
            });
        })
        .catch(next);
};
