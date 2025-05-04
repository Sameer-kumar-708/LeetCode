const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-12870.crce182.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 12870,
  },
});

module.exports = redisClient;
