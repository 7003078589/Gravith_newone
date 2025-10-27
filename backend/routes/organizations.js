const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');

// GET /api/organizations - Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.getAll();
    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/organizations/:id - Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, data: organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/organizations - Create new organization
router.post('/', async (req, res) => {
  try {
    const organizationData = req.body;
    const organization = await Organization.create(organizationData);
    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/organizations/:id - Update organization
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const organization = await Organization.update(id, updateData);

    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, data: organization });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/organizations/:id - Delete organization
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.delete(id);

    if (!organization) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
