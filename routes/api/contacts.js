const express = require("express");
const ctrls = require("../../controllers/contacts");
const { validateBody, isValidId } = require("../../middlewares");
const { schemas } = require("../../models/contact");


const router = express.Router();

router.get("/", ctrls.getAll);

router.get("/:contactId", isValidId, ctrls.gebById);

router.post("/", validateBody(schemas.addSchema), ctrls.add);

router.delete("/:contactId", isValidId, ctrls.deleteById);

router.put("/:contactId", isValidId, validateBody(schemas.addSchema), ctrls.updateById);

router.patch("/:contactId/favorite", isValidId, validateBody(schemas.updateFavorite), ctrls.updateStatusContact);

module.exports = router;
