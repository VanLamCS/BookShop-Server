import User from "../models/User.js";
import genToken from "../config/genToken.js";

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validatePhone = (phone) => {
  return phone.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/);
};

// [GET] /api/users
export const getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(201).json(users))
    .catch(next);
};

//[POST] /api/user
export const registerUser = async (req, res, next) => {
  const { name, email, password, avatar, phone, role } = req.body;
  console.log(req.body)
  if (!name || !email || !password || !phone) {
    res.status(400);
    next(new Error("You must fill in all information"));
  }

  if (!validateEmail(email)) {
    res.status(400);
    next(new Error("Email is not valid"));
  }

  if (!validatePhone(phone)) {
    res.status(400);
    next(new Error("Phone number is not valid"));
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    next(new Error("Email has already existed!"));
  }
  const checkPhone = await User.findOne({ phone: phone });

  if (checkPhone) {
    res.status(400);
    next(new Error("Phone number has already existed"));
  }

  const user = new User({ name, email, password, avatar, phone, role });
  user
    .save()
    .then((user) => {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        token: genToken(user._id),
      });
    })
    .catch(next);
};

//[POST] /api/user/login
export const authUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    next(new Error("You must fill email and password"));
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: genToken(user._id),
    });
  } else {
    res.status(401);
    next(new Error("Invalid email or password !"));
  }
};
