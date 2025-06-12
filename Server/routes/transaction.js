const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction, uploadImageToStorage, removeImageFromStorage } = require('../controllers/transactionController');

router.post('/get', getTransactions);
router.post('/create', createTransaction);
router.put('/:transactionId', updateTransaction);
router.post('/:transactionId', deleteTransaction);
router.post('/upload', uploadImageToStorage);
router.post('/remove', removeImageFromStorage);


module.exports = router;