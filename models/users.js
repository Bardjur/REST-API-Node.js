const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../middlewares");

const regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: regEmail,
      unique: true,
      required: [true, "Set email"],
    },
    password: {
      type: String,
      minLength: [6, "password must be at least 6 characters long"],
      required: [true, "Set password"],
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: "",
    },
    avatarURL: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

const authSchema = Joi.object({
  email: Joi.string().pattern(regEmail).required(),
  password: Joi.string().min(6).required(),
});

const updateSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business"),
});

const schemas = {
  authSchema,
  updateSchema,
};

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
