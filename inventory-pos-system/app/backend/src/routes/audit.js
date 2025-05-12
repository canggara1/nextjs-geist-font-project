const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// GET /api/audit - Get audit trails
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const audits = await prisma.auditTrail.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(audits);
  } catch (error) {
    console.error('Error fetching audit trails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
