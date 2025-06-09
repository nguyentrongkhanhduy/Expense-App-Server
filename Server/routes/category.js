const express = require('express');
const router = express.Router();
const { getCategories, createCategory, createInitialCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.post('/get', getCategories);
router.post('/create', createCategory);
router.post('/initial', createInitialCategories);
router.put('/:categoryId', updateCategory);
router.delete('/:categoryId', deleteCategory);

module.exports = router;