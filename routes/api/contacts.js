const express = require("express");
const ctrls = require("../../controllers/contacts");
const { validateBody, isValidId } = require("../../middlewares");
const { schemas } = require("../../models/contact");
const authenticate = require("../../middlewares/authenticate");

const router = express.Router();

router.get("/", authenticate, ctrls.getAll);

router.get("/:contactId", authenticate, isValidId, ctrls.gebById);

router.post("/", authenticate, validateBody(schemas.addSchema), ctrls.add);

router.delete("/:contactId", authenticate, isValidId, ctrls.deleteById);

router.put(
  "/:contactId",
  authenticate,
  isValidId,
  validateBody(schemas.addSchema),
  ctrls.updateById
);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  validateBody(schemas.updateFavorite),
  ctrls.updateStatusContact
);

module.exports = router;
