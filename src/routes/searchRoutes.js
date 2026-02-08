const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

router.post('/search', async (req, res) => {
    try {
        let payload = req.body.payload.trim();
        let search = await Blog.find({ title: { $regex: new RegExp('^' + payload + '.*', 'i') } }).limit(10).exec();
        res.send({ payload: search });
    } catch (err) {
        res.status(500).send({ payload: [] });
    }
});

module.exports = router;
