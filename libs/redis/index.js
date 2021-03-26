const { promisify } = require('util');
const index = require('redis');

class RedisClient extends index.RedisClient {
  constructor({ RedisConfig }) {
    super(RedisConfig);
  }

    separator = ':';

    getAsync = promisify(this.get);

    setAsync = promisify(this.set);

    keysAsync = promisify(this.keys);

    expireatAsync = promisify(this.expireat);

    delAsync = promisify(this.del);

    existsAsync = promisify(this.exists);

    hkeysAsync = promisify(this.hkeys);

    hsetAsync = promisify(this.hset);

    hgetAsync = promisify(this.hget);

    hgetallAsync = promisify(this.hgetall);

    zaddAsync = promisify(this.zadd);

    zcardAsync = promisify(this.zcard);

    scardAsync = promisify(this.scard);

    zremAsync = promisify(this.zrem);

    zrangeAsync = promisify(this.zrange);

    zpopminAsync = promisify(this.zpopmin);

    sismemberAsync = promisify(this.sismember);

    psubscribeAsync = promisify(this.psubscribe);
}

module.exports = RedisClient;
