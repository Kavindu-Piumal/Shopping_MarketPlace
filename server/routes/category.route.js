import express from 'express';

const router = express.Router();

// Example route: GET /api/category/
router.get('/', (req, res) => {
  res.json({ message: 'Category route is working!' });
});

export default router;

