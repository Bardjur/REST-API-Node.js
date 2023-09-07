const { User } = require("../models/users.js");
const bcrypt = require("bcryptjs");
const { HttpError, ctrlWrapper } = require("../helpers/index.js");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
const sendMail = require("../helpers/sendEmail.js");

const { SECRET_KEY, DOMAIN } = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPwd = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  await sendMail({
    to: email,
    subject: "confirm email",
    //html: `<a target="_blank" href="${DOMAIN}/api/users/verify/${verificationToken}"> Please confirm your email</a>`,
    text: `Please confirm your email: ${DOMAIN}/api/users/verify/${verificationToken}`,
  }).catch((err) => {
    throw HttpError(err.status, err.message);
  });

  const result = await User.create({
    ...req.body,
    password: hashPwd,
    verificationToken,
    avatarURL,
  });

  res.status(201).json({
    email: result.email,
    subscription: result.subscription,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({ message: "Verification successful" });
};

const repeatVerify = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  sendMail({
    to: user.email,
    subject: "confirm email",
    //html: `<a target="_blank" href="${DOMAIN}/api/users/verify/${verificationToken}"> Please confirm your email</a>`,
    text: `Please confirm your email: ${DOMAIN}/api/users/verify/${user.verificationToken}`,
  });

  res.json({ message: "Verification email sent" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(400, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "You need to verify");
  }

  const isMatchesPass = await bcrypt.compare(password, user.password);
  if (!isMatchesPass) {
    throw HttpError(401, "Email or password is wrong");
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

const updateAvatar = async (req, res) => {
  const { path: tempUpload, originalname } = req.file;
  const fileName = `${req.user.id}-${originalname}`;
  const resultUpload = path.join(avatarsDir, fileName);

  const avatar = await Jimp.read(tempUpload);
  await avatar.resize(250, 250).write(tempUpload);

  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join("avatars", fileName);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatarURL },
    { new: true }
  );

  res.json({
    avatarURL: user.avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  verify: ctrlWrapper(verify),
  repeatVerify: ctrlWrapper(repeatVerify),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateUser: ctrlWrapper(updateUser),
  updateAvatar: ctrlWrapper(updateAvatar),
};
