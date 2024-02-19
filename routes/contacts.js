var express = require('express');
var router = express.Router();
const contactsJSON = require('../crud.js');
const Contact = require('../models/contacts');
const sanitizeHtml = require('sanitize-html');


function validateContactData(data) {
  const { firstName, lastName, emailAddress } = data;

  // Check for non-empty, non-numeric first name and last name
  const isNonEmptyString = value => typeof value === 'string' && value.trim() !== '';
  const containsOnlyLetters = value => /^[A-Za-z]+$/.test(value);

  const isNonNumericFirstName = isNonEmptyString(firstName) && containsOnlyLetters(firstName);
  const isNonNumericLastName = isNonEmptyString(lastName) && containsOnlyLetters(lastName);

  // Check for valid email address using a simple regex pattern
  const isInvalidEmail = emailAddress && !/^\S+@\S+\.\S+$/.test(emailAddress);

  // Return true if all validations pass
  return isNonNumericFirstName && isNonNumericLastName && !isInvalidEmail;
}

// Sanitize user input
function sanitizeContactData(data) {
  return {
    fName: sanitizeHtml(data.fName.trim(), { allowedTags: [], allowedAttributes: {} }),
    lName: sanitizeHtml(data.lName.trim(), { allowedTags: [], allowedAttributes: {} }),
    emailAddress: sanitizeHtml(data.emailAddress.trim(), { allowedTags: [], allowedAttributes: {} }),
    notes: sanitizeHtml(data.notes.trim(), { allowedTags: ['b', 'i', 'em', 'strong', 'a'], allowedAttributes: { 'a': ['href'] } }),
  };
}

router.get('/list', (req, res) => {
  try {
    const contacts = contactsJSON.getAllContacts();
    res.render('contacts/list', { contacts, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/add', (req, res) => {
  res.render('contacts/add');
});
router.get('/edit', (req, res) => {
  res.render('contacts/add');
});
router.get('/view', (req, res) => {
  res.render('contacts/view');
});

// Route to handle creating a new contact
router.post('/', (req, res) => {
  try {
    const { fName, lName, email, notes } = req.body;
    console.log(fName)
    // Validate the form data
    if (!validateContactData(req.body)) {
      // Display error message and render the form again
      const contacts = contactsRepository.getAllContacts();
      return res.render('contacts/new', { errorMessage: 'Please fill in all required fields.', contacts, layout: 'layout' });
    }

    // Sanitize user input
    const sanitizedData = sanitizeContactData(req.body);

    const newContact = new Contact(sanitizedData.fName, sanitizedData.lName, sanitizedData.email, sanitizedData.notes);

    // Attempt to create the contact
    const createdContact = contactsRepository.createContact(newContact);

    if (!createdContact) {
      // Handle the case where the contact creation fails
      return res.status(500).send('Failed to create contact');
    }

    res.redirect('/contacts');
  } catch (error) {
    // Handle unexpected errors
    console.error('Error creating contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const contact = contactsRepository.getContactById(id);

    if (!contact) {
      // Handle the case where the contact is not found
      res.status(404).send('Contact not found');
      return;
    }
    // Format createdAt and updatedAt dates for better readability
    const formattedContact = {
      ...contact,
      createdAt: new Date(contact.createdAt).toLocaleString(),
      updatedAt: new Date(contact.updatedAt).toLocaleString(),
    };
    res.render('contacts/show', { contact: formattedContact, layout: 'layout' });
    } catch (error) {
      console.error('Error retrieving contact:', error);
      res.status(500).send('Internal Server Error');
    }
});

// Route to handle viewing a dynamically generated contact
router.get('/generated/:id', (req, res) => {
  try {
    // Get the dynamically generated ID from the URL
    const dynamicId = req.params.id;

    // Logic to fetch the dynamically generated contact
    const generatedContact = contactsRepository.getContactById(dynamicId);

    if (!generatedContact) {
      // Handle the case where the contact is not found
      res.status(404).send('Generated Contact not found');
      return;
    }

    res.render('contacts/show', { contact: generatedContact, layout: 'layout' });
  } catch (error) {
    console.error('Error retrieving generated contact:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
