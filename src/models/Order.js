import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Book",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered"],
            default: "Pending",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;
