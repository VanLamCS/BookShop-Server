import jwt from "jsonwebtoken";
const genToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};
export default genToken;
