const { User } = require("../models/users.js");
const bcrypt = require("bcryptjs");
const { HttpError, ctrlWrapper } = require("../helpers/index.js");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPwd = await bcrypt.hash(password, 10);

  const result = await User.create({ ...req.body, password: hashPwd });

  res.status(201).json({
    email: result.email,
    subscription: result.subscription,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(400, "Email or password is wrong");
  }

  const isMatchesPass = await bcrypt.compare(password, user.password);
  if (!isMatchesPass) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
  });
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { token: "" });
  res.status(204).json();
};

const current = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateUser = async (req, res) => {
  const { subscription } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { subscription },
    { new: true }
  );

  res.json({
    email: user.email,
    subscription: user.subscription,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateUser: ctrlWrapper(updateUser),
};
