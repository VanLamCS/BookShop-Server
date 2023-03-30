import mongoose from "mongoose";
import Order from "../models/Order.js";
import Book from "../models/Book.js";

export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user._id;
        // Check data
        const { items } = req.body;
        if (items && Array.isArray(items)) {
            for (let i in items) {
                if (
                    !mongoose.Types.ObjectId.isValid(items[i].productId) ||
                    parseInt(items[i].quantity) <= 0
                ) {
                    return res
                        .status(400)
                        .json({ status: false, message: "Data Error" });
                }
            }
        }
        const productIds = items.map((item) => item.productId);
        const products = await Book.find({
            _id: { $in: productIds },
        });
        const missingProducts = productIds.filter(
            (id) => !products.find((p) => p._id.equals(id))
        );
        if (missingProducts > 0) {
            return res.status(404).json({
                status: false,
                message: `Products not found: ${missingProducts.join(", ")}`,
            });
        }
        // Check quantity in stock
        let checkStock = true;
        for (let i = 0; i < items.length; i++) {
            const book = await Book.findById(items[i].productId);
            if (book.quantity < parseInt(items[i].quantity)) {
                checkStock = false;
                break;
            }
        }
        if (!checkStock) {
            return res.status(400).json({
                status: false,
                message: "Not enough books in stock",
            });
        }
        const itemsWithCost = await Promise.all(
            items.map(async (item) => {
                const book = await Book.findById(item.productId);
                const cost = item.quantity * book.price;
                // Update books in stock
                book.quantity = book.quantity - parseInt(item.quantity);
                await book.save();
                return {
                    product: book._id,
                    quantity: item.quantity,
                    cost: cost,
                };
            })
        );
        const totalCost = itemsWithCost.reduce(
            (acc, item) => acc + item.cost,
            0
        );
        const order = new Order({
            customer: userId,
            items: itemsWithCost,
            totalCost: totalCost,
        });
        await (
            await order.save()
        ).populate(
            "items.product",
            "_id name publisher author price description"
        );
        res.status(201).json({ status: true, order: order });
    } catch (error) {
        res.status(400);
        return next(new Error(`Error: ${error.message}`));
    }
};

export const updateStatus = async (req, res, next) => {
    let { orderId, status } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (
            ![
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "pending",
                "processing",
                "shipped",
                "delivered",
            ].includes(status)
        ) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid status" });
        }
        status = status.charAt(0).toUpperCase() + status.slice(1);
        if (!order) {
            return res
                .status(404)
                .json({ status: false, message: "Order not found" });
        }
        order.status = status;
        await order.save();
        return res.status(200).json({
            status: true,
            message: "Update order status successfully",
        });
    } catch (error) {
        res.status(400);
        return next(new Error(err.message));
    }
};
