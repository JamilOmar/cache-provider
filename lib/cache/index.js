'use strict';

const redisProvider = require('./providers/redis-provider'),
vasync = require('vasync'),
 _ = require('lodash'),
assert = require('assert'),
nodeSerialize = require('node-serialize');

/**
 *
 * @Throws {Error} if the given the given router is not an Express JS router or one of the provided options
 * is not valid
 *
 * @param {Object} options - conection type
 * options:
 * {Object} options.connection - Provider connection information
 * {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 * {String} options.type - Provider type
 * redis-provider : Data adapter for redis 
 *
 * @constructor
 */
class Cache 
{
    constructor(options={})
    {        
        this.provider = null;
        assert.ok(options.type != null&&options.type === "redis-provider", 'Only redis provider is enabled a this time');
        this.options = _.defaults(options, {
        logger: null,
        type: "redis-provider",
        connection: {
            },
           
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
             this.provider  = new redisProvider(this.options);
             this.provider.initialize();
        } catch (error) {
            error.message = 'Failed to setup the cache functionality: ' + error.message;
            this._handleError(error);
        }
    };  
    /**
     * @description Saves the serialized object in cache
     * @param {array} [objectID] - The unique ID used for cache the object.
     * @param {object} [data] - The object for cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * @api
     */    
    saveCache(objectID,data, callback)
    {
        try 
        {

            let key = this._createKey(objectID);
            //serialization of the object
            let objSerialize = nodeSerialize.serialize(data);
            assert(typeof objSerialize === "string");
            //creating the object in redis
            this.provider.saveCache(key, objSerialize, (error) =>{
                return callback(error,data);
            });
             

	    }
        catch(error) {
            this._handleError(error);  
	    }

    };
    /**
     * @description Gets the serialized object from cache
     * @param {array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * @api
     */    
    getCache(objectID, callback) {  
        try 
            {
                let key = this._createKey(objectID);
                //creating the object in redis
                this.provider.getCache(key, (error,reply) =>{
                    let data = null;
                    if(reply)
                    {
                        data = nodeSerialize.unserialize(reply); 
                    }
                return callback(error,data);
                });
	        }
        catch(error) 
        {
            this._handleError(error);  
	    }
	
};
    /**
     * @description Deletes the serialized object from cache
     * @param {array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * @api
     */    
    daleteCache(objectID, callback) {  
        try 
            {
                let key = this._createKey(objectID);
                //creating the object in redis
                this.provider.daleteCache(key, (error,reply) =>{
                return callback(error,reply);
                });
	        }
        catch(error) 
        {
            this._handleError(error);  
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
    /**
     * @description creates the cache unique id
     * @param {Array} [objectID] - Array for ID creation.
     */    
_createKey(objectID) {

    let key = "";
    assert(objectID != null);
    for(let _key of objectID)
    {
        key =(key)? key + ":" + _key : _key;   

    }
    return key;
        
};
}
module.exports = Cache;