import mongoose from "mongoose";
import Category from "../models/Category.js";

//[GET] /api/category
export const getCategories = async (req, res, next) => {
    let limit = req.query["limit"];
    let frame = req.query["frame"];
    limit = limit ? (parseInt(limit) > 0 ? parseInt(limit) : 24) : 24;
    frame = frame ? (parseInt(frame) > 0 ? parseInt(frame) : 1) : 1;
    let offset = (frame - 1) * limit;
    try {
        let cats = await Category.find()
            .sort({ createdAt: "asc" })
            .skip(offset)
            .limit(limit);
        res.status(200).json({
            message: "Get categories successfully",
            data: cats,
        });
    } catch (e) {
        res.status(500);
        return next(new Error("Server Internal Error"));
    }
};

//[POST] /api/category/create
export const addCategory = async (req, res, next) => {
    const { name, description } = req.body;
    if (name.length < 1) {
        return res.status(400).json({
            status: false,
            message: "Name must not be null",
        });
    }
    if (!description) {
        description = "";
    }
    try {
        const cat = new Category({ name, description });
        await cat.save();
        return res.status(201).json({
            status: true,
            message: "Add category successfully",
        });
    } catch (e) {
        if (e.code == 11000) {
            return res
                .status(400)
                .json({ status: false, message: "Name already exists" });
        } else {
            res.status(500);
            return next(new Error(e.message));
        }
    }
};

//[DELETE] /api/category/delete
export const deleteCategory = async (req, res, next) => {
    let categoryId = req.body["categoryId"];
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
        try {
            let cat = await Category.findByIdAndRemove({
                _id: categoryId,
            }).exec();
            if (cat) {
                return res
                    .status(200)
                    .json({ status: true, message: "Deleted successfully" });
            } else {
                return res
                    .status(500)
                    .json({ status: 500, message: "Category not found" });
            }
        } catch (error) {
            return res
                .status(500)
                .json({ status: 500, message: "Server Internal Error" });
        }
    } else {
        return res
            .status(400)
            .json({ status: false, message: "Category ID is wrong" });
    }
};

export const updateCategory = async (req, res, next) => {
    const { categoryId, name, description } = req.body;
    let updateObj = {};
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
        if (name.length < 1) {
            return res.status(400).json({
                status: false,
                message: "Name must not be null",
            });
        } else {
            updateObj = { name: name };
        }
        if (description) {
            updateObj = { ...updateObj, description: description };
        }
        try {
            const catUpdate = await Category.findOneAndUpdate(
                { _id: categoryId },
                updateObj
            );
            if (catUpdate) {
                return res
                    .status(200)
                    .json({ status: true, message: "Updated successfully" });
            } else {
                return res
                    .status(400)
                    .json({ status: false, message: "Category not exists" });
            }
        } catch (e) {
            if (e.code == 11000) {
                return res
                    .status(400)
                    .json({ status: false, message: "Name already exists" });
            } else {
                return res
                    .status(500)
                    .json({ status: false, message: "Server Internal Error" });
            }
        }
    } else {
        return res
            .status(400)
            .json({ status: false, message: "Category ID is wrong" });
    }
};
