const express = require("express");
const ctrl = require("../../controllers/auth");
const { validateBody } = require("../../middlewares");
const { schemas } = require("../../models/users");
const authenticate = require("../../middlewares/authenticate");

const router = express.Router();

router.post("/register", validateBody(schemas.authSchema), ctrl.register);

router.post("/login", validateBody(schemas.authSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.current);

router.patch(
  "/",
  authenticate,
  validateBody(schemas.updateSchema),
  ctrl.updateUser
);

module.exports = router;
