const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction, uploadImageToStorage, removeImageFromStorage, updateImageInStorage } = require('../controllers/transactionController');

router.post('/get', getTransactions);
router.post('/create', createTransaction);
router.put('/:transactionId', updateTransaction);
router.post('/:transactionId', deleteTransaction);
router.post('/upload-image', uploadImageToStorage);
router.put('/update-image', updateImageInStorage);
router.post('/remove-image', removeImageFromStorage);

module.exports = router;