const express = require('express');
const { application, json } = require('express');
const router = express.Router();

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

router.get('/', function (req, res, next) {
    const loadLogList = async () => {
        res.header('Content-Type', 'application/json; charset=utf-8')
        res.send(await redis.lrange('log_list', 0, -1));
    }
    loadLogList()
});

router.get('/:key', function (req, res, next) {
    const loadLog = async () => {
        res.header('Content-Type', 'application/json; charset=utf-8')
        res.send(await redis.get(req.params.key));
    }
    loadLog()
});

module.exports = router;