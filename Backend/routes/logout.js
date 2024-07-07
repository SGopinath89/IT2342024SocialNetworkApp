const express = require('express');
const router = express.Router();


const {verifyToken} = require('../Security/autho');

router.post('/logout', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Successfully logged out' });
});

module.exports = router;

