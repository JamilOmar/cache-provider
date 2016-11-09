'use strict';

const redis = require('redis'),
assert = require('assert'),
 _ = require('lodash');

/**
 *
 * @Throws {Error} if the given the given router is not an Express JS router or one of the provided options
 * is not valid
 * @param {Object} options - List of connection information for Redis access.
 *
 * options:
 * {Object} options.connection - Connection string information for Redis.
 * {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 * {Array} options.configuration - Redis API configuration. Default: null
 *
 * @constructor
 */
class RedisProvider 
{
    constructor(options={})
    {
        
        this.client = null;
        if(options.configuration && options.configuration.maxTime)
            assert.ok(typeof options.configuration.maxTime === "number" && options.configuration.maxTime  >0, '`options.configuration` must define `maxTime` as a valid number');
        if (options.logger)
            assert.ok(_.isFunction(options.logger.error), '`options.logger` must define an `error` function');
        this.options = _.defaults(options, {
            logger: null,
            configuration: {},connection:{}   
        });
    };
    /**
     * @description Assigns all the connection and configuration information for the Redis provider for LabShare
     *
     * Throws an exception when:
     *   - Is unable to create a connection with Redis
     *   
     */
    initialize() {
        try {
            this.client = redis.createClient(this.options.connection);
        } catch (error) {
            error.message = 'Failed to stablish a connection with Redis: ' + error.message;
            this._handleError(error);
        }
    };    
    /**
     * @description Saves the serialized object in cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {object} [data] - The object for cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * @api
     */    
    saveCache(key,data, callback)
    {
        try 
        {
            //creating the object in redis
		    this.client.set(key, data, (error) =>{
			 callback(error,data);
		    });
            //if maxTime is set, setting expiracy to the object in redis
            if(this.options.configuration.maxTime)
            {
               this.client.expire(key, this.options.configuration.maxTime);   
            }
	    }
     catch(error) {

		return callback(error,null);
	}

    };
    /**
     * @description Gets the serialized object from cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * @api
     */    


    getCache(key, callback) {
	try {
		this.client.get(key, (error, reply)=> 
        {
				return callback(error,reply);
		});
	} catch(error) {

		return callback(error,null);
	}
};
    /**
     * @description Deletes object from cache
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * @api
     */    


    deleteCache(key, callback) {
	try {
		this.client.del(key, (error, reply)=> 
        {
				return callback(error,reply);
		});
	} catch(error) {

		return callback(error,null);
	}
};

    /**
     * @description Exception handler
     * @param {string} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * @api
     */   
  _handleError(error) {
        if (this.options.logger) {
            this.options.logger.error(error.stack || error.message || error);
            return;
        }
        throw error;
    };

}
module.exports = RedisProvider;