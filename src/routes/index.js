import bookRoute from "./book.js";
import categoryRoute from "./category.js";
import userRoute from "./user.js";
import orderRoute from "./order.js";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
const swaggerSpec = YAML.load("./swagger.yaml");

const route = (app) => {
    app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    app.use("/api/user", userRoute);
    app.use("/api/book", bookRoute);
    app.use("/api/category", categoryRoute);
    app.use("/api/order", orderRoute);
};

export default route;
