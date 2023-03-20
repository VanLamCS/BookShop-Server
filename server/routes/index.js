import bookRoute from "./book.js";
import categoryRoute from "./category.js";
import userRoute from "./user.js";

const route = (app) => {
    app.use("/api/user", userRoute);
    app.use("/api/book", bookRoute);
    app.use("/api/category", categoryRoute);
};

export default route;
