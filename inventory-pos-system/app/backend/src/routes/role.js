const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// POST /api/roles - Create a new role
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { name, permissions } = req.body;
    if (!name || !permissions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const role = await prisma.role.create({
      data: {
        name,
        permissions: JSON.stringify(permissions),
        createdAt: new Date()
      }
    });

    res.status(201).json({ message: 'Role created', role });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/roles/:id/permissions - Update role permissions
router.put('/:id/permissions', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const id = parseInt(req.params.id);
    const { permissions } = req.body;
    if (!permissions) {
      return res.status(400).json({ error: 'Missing permissions' });
    }

    const role = await prisma.role.update({
      where: { id },
      data: { permissions: JSON.stringify(permissions) }
    });

    res.json({ message: 'Role permissions updated', role });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/roles - Get all roles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const roles = await prisma.role.findMany();
    // Parse permissions JSON string to object
    const parsedRoles = roles.map(role => ({
      ...role,
      permissions: JSON.parse(role.permissions)
    }));

    res.json(parsedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
