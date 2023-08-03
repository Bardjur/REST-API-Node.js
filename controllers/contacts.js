const contacts = require("../models/contacts");
const { HttpError, ctrlWrapper } = require("../helpers");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

const getAll = async (req, res, next) => {
  const data = await contacts.listContacts();
  res.json(data);
};

const gebById = async (req, res, next) => {
  const { contactId } = req.params;
  const data = await contacts.getContactById(contactId);
  if (!data) {
    throw HttpError(404, "Not found");
  }
  res.json(data);
};

const add = async (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    throw HttpError(400, error.message);
  }

  const data = await contacts.addContact(req.body);
  res.status(201).json(data);
};

const deleteById = async (req, res, next) => {
  const { contactId } = req.params;
  const data = await contacts.removeContact(contactId);

  if (!data) {
    throw HttpError(404, "Not found");
  }

  res.json({ message: "contact deleted" });
};

const updateById = async (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    throw HttpError(400, error.message);
  }

  const { contactId } = req.params;
  const data = await contacts.updateContact(contactId, req.body);

  if (!data) {
    throw HttpError(404, "Not found");
  }

  res.json(data);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  gebById: ctrlWrapper(gebById),
  add: ctrlWrapper(add),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
};
