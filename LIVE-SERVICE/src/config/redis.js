const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const pub = new Redis(process.env.REDIS_URL);
const sub = new Redis(process.env.REDIS_URL);

pub.on('connect', () => console.log('Redis publisher connected'));
sub.on('connect', () => console.log('Redis subscriber connected'));

pub.on('error', (e) => console.log('Redis publisher error', e));
sub.on('error', (e) => console.log('Redis subscriber error', e));

module.exports = { pub, sub };