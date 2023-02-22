import userRoute from "./user.js";

const route = (app) => {
  app.use("/api", userRoute);
};

export default route;
