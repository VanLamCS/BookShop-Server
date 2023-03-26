import bcrypt from "bcryptjs";

const hashPassword = async (password, saltNumber = 10) => {
    const salt = await bcrypt.genSalt(saltNumber);
    let hashPass = await bcrypt.hash(password, salt);
    return hashPass;
};

export default hashPassword;
