import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    let token;
    if (
        req.header("Authorization") &&
        req.header("Authorization").startsWith("Bearer")
    ) {
        token = req.header("Authorization").split(" ")[1];

        if (!token) {
            res.status(401);
            return next(new Error("You are not authenticated"));
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
            if (err) {
                res.status(403);
                return next(err);
            }

            req.user = await User.findById(decoded.userId).select("-password");

            next();
        });
    }

    if (!token) {
        res.status(401);
        return next(new Error("You are not authenticated"));
    }
};

export const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user.role != "admin") {
        res.status(403);
        return next(
            new Error("Your account don't have permissions to do this action")
        );
    }
    next();
};
