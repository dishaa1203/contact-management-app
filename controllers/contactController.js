const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");

// @desc Get all contacts
// @route GET /api/contacts
// @access Private
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user_id: req.user.id });
  res.status(200).json({
    message: "Contacts fetched successfully",
    count: contacts.length,
    data: contacts,
  });
});

// @desc Create new contact
// @route POST /api/contacts
// @access Private
const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  if (!/^[0-9]{10}$/.test(req.body.phone)) {
  res.status(400);
  throw new Error("Invalid phone number. Must be exactly 10 digits.");
}


  const contact = await Contact.create({
    name,
    email,
    phone,
    user_id: req.user.id,
  });

  res.status(201).json({
    message: "Contact created successfully",
    data: contact,
  });
});

// @desc Get single contact
// @route GET /api/contacts/:id
// @access Private
const getContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid contact ID");
  }

  const contact = await Contact.findById(id);

  if (!contact || contact.user_id.toString() !== req.user.id) {
    res.status(404);
    throw new Error("Contact not found or access denied");
  }

  res.status(200).json({
    message: "Contact fetched successfully",
    data: contact,
  });
});

// @desc Update contact
// @route PUT /api/contacts/:id
// @access Private
const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid contact ID");
  }

  const contact = await Contact.findById(id);

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("You do not have permission to update this contact");
  }
  if (!/^[0-9]{10}$/.test(req.body.phone)) {
  res.status(400);
  throw new Error("Invalid phone number. Must be exactly 10 digits.");
}


  const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Contact updated successfully",
    data: updatedContact,
  });
});

// @desc Delete contact
// @route DELETE /api/contacts/:id
// @access Private
const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid contact ID");
  }

  const contact = await Contact.findById(id);

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("You do not have permission to delete this contact");
  }

  await contact.deleteOne();

  res.status(200).json({
    message: "Contact deleted successfully",
    data: contact,
  });
});

module.exports = {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
};
