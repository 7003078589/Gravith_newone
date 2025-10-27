const express = require('express');
const router = express.Router();
const Site = require('../models/Site');

// GET /api/sites - Get all sites for organization
router.get('/', async (req, res) => {
  try {
    const { organization_id } = req.query;

    if (!organization_id) {
      return res.status(400).json({ success: false, error: 'Organization ID is required' });
    }

    const sites = await Site.findByOrganization(organization_id);
    res.json({ success: true, data: sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/sites/:id - Get site by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id);

    if (!site) {
      return res.status(404).json({ success: false, error: 'Site not found' });
    }

    res.json({ success: true, data: site });
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/sites - Create new site
router.post('/', async (req, res) => {
  try {
    const siteData = req.body;
    const site = await Site.create(siteData);
    res.status(201).json({ success: true, data: site });
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/sites/:id - Update site
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const site = await Site.update(id, updateData);

    if (!site) {
      return res.status(404).json({ success: false, error: 'Site not found' });
    }

    res.json({ success: true, data: site });
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/sites/:id - Delete site
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.delete(id);

    if (!site) {
      return res.status(404).json({ success: false, error: 'Site not found' });
    }

    res.json({ success: true, message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/sites/stats/:organization_id - Get site statistics
router.get('/stats/:organization_id', async (req, res) => {
  try {
    const { organization_id } = req.params;
    const stats = await Site.getSiteStats(organization_id);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching site stats:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
