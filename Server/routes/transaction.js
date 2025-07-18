const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, reassignCategory, deleteTransaction, uploadImageToStorage, removeImageFromStorage, updateImageInStorage, sendTestNotification } = require('../controllers/transactionController');

router.post('/get', getTransactions);
router.post('/create', createTransaction);
router.post('/reassign-category', reassignCategory);

router.post('/upload-image', uploadImageToStorage);
router.put('/update-image', updateImageInStorage);
router.post('/remove-image', removeImageFromStorage);

router.post('/send-test-notification', sendTestNotification);

router.put('/:transactionId', updateTransaction);
router.post('/:transactionId', deleteTransaction);

module.exports = router;