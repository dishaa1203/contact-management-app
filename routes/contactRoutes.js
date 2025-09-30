const express = require("express");
const router = express.Router();
const {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");
const validateToken = require("../middleware/validateTokenHandler");

// All routes below require a valid token
router.use(validateToken);

// ===== Routes =====

// GET all contacts (for logged-in user)
// POST new contact (for logged-in user)
router.route("/")
  .get(getContacts)
  .post(createContact);

// GET single contact by ID (must belong to logged-in user)
// PUT update contact by ID
// DELETE contact by ID
router.route("/:id")
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
