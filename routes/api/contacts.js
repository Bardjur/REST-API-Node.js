const express = require("express");
const ctrls = require("../../controllers/contacts");

const router = express.Router();

router.get("/", ctrls.getAll);

router.get("/:contactId", ctrls.gebById);

router.post("/", ctrls.add);

router.delete("/:contactId", ctrls.deleteById);

router.put("/:contactId", ctrls.updateById);

module.exports = router;
