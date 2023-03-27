import bookRoute from "./book.js";
import categoryRoute from "./category.js";
import userRoute from "./user.js";
import orderRoute from "./order.js";
// import swaggerUI from "swagger-ui-express";
// import swaggerSpec from "../api/config.js";

const route = (app) => {
    // app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    app.use("/api/user", userRoute);
    app.use("/api/book", bookRoute);
    app.use("/api/category", categoryRoute);
    app.use("/api/order", orderRoute);
};

export default route;
