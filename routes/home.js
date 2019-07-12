const express = require('express');
const router = express.Router();

router.get('/', (req, res) => { 

    res.send({ status: 'Its alive!' })
    
});

module.exports = router;