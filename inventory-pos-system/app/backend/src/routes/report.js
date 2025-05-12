const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// GET /api/report/inventory - Inventory report with filters
router.get('/inventory', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'FINANCE'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { branchId, startDate, endDate, productId } = req.query;

    let whereClause = {};

    if (branchId) {
      whereClause.branchId = parseInt(branchId);
    }

    if (productId) {
      whereClause.productId = parseInt(productId);
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const inventories = await prisma.inventory.findMany({
      where: whereClause,
      include: {
        product: true,
        branch: true
      }
    });

    res.json(inventories);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/report/mutation - Mutation report (stock changes)
router.get('/mutation', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'FINANCE'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // For simplicity, returning all transactions as mutation report
    const transactions = await prisma.transaction.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        branch: true,
        user: true
      }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching mutation report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/report/waste - Waste report
router.get('/waste', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'FINANCE'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { branchId, startDate, endDate, productId } = req.query;

    let whereClause = {};

    if (branchId) {
      whereClause.branchId = parseInt(branchId);
    }

    if (productId) {
      whereClause.productId = parseInt(productId);
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const wasteLogs = await prisma.wasteLog.findMany({
      where: whereClause,
      include: {
        product: true,
        branch: true,
        user: true
      }
    });

    res.json(wasteLogs);
  } catch (error) {
    console.error('Error fetching waste report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
