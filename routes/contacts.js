var express = require('express');
var router = express.Router();


router.get('/list', (req, res) => {
  res.render('contacts/list');
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
router.post('/save', (req, res) => {
  try {
    const { fName, lName, email, notes } = req.body;

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
module.exports = router;
