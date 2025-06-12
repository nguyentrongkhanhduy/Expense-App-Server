const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');

router.post('/get', getTransactions);
router.post('/create', createTransaction);
router.put('/:transactionId', updateTransaction);
router.post('/:transactionId', deleteTransaction);

module.exports = router;