'use strict';

const redis = require('redis'),
{EventEmitter} = require('events'),
assert = require('assert'),
 _ = require('lodash');

/**
 *
 * @Throws {Error} if the given the given router is not an Express JS router or one of the provided options
 * is not valid
 *
 * @param {Object} options - conection type
 * options:
 * {String} options.list - Name of the list for the subscription
 * {Object} options.connection - Redis connection information
 * {Object} options.configuration - Configuration for publishers and subscribers
 * {Bool} options.configuration.publisher - Enable publisher
 * {Bool} options.configuration.subscriber - Enable subscriber
 * {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 *
 * @constructor
 */
class PubSub  extends EventEmitter 
{

    constructor(options={})
    {   super();     
        this.client = null;
        assert.ok(_.isString(options.list), '`options.list`: `List name` is required');
        assert.ok(options.configuration.publisher|| options.configuration.subscriber, '`options.configuration`: a `publisher` or a `subscriber`  is required');
        assert.ok(!(options.configuration.publisher && options.configuration.subscriber), '`options.configuration`:`PubSub` can only be a `publisher` or a `subscriber`');
        if (options.logger)
            assert.ok(_.isFunction(options.logger.error), '`options.logger` must define an `error` function');
        this.options = _.defaults(options, {
            logger: null,
            connection:{},
            configuration:{}   
        });
        
    };
    /**
     * @description Assigns all the connection and configuration information for the creation of a pubsub model in LabShare
     *
     * Throws an exception when:
     *   - Is unable to create a connection with Redis
     *   
     */
    initialize() {
        try {
            this.client = redis.createClient(this.options.connection);
            if( this.options.configuration.subscriber)
            {
                this.client.on("subscribe", (channel, count)=>
                {
                    this.emit("subscribe",channel, count);
                });
                this.client.on("message",(channel, message )=>
                {
                    this.emit("message",channel, message);
                });

                this.client.on("unsubscribe", (channel, count)=>
                {
                    this.emit("unsubscribe",channel, count);
                });
                this.client.on("message_buffer",(channel, message )=>
                {
                    this.emit("message_buffer",channel, message);
                });
                this.client.subscribe(this.options.list);
            }

        } catch (error) {
            error.message = 'Failed to create the PubSub: ' + error.message;
            this._handleError(error);
        }
    };

    publish(message)
    {
        try {
            if(this.options.configuration.publisher)
            {
                this.client.publish(this.options.list, message);
            }
            return;

        } catch (error) {
            error.message = 'Failed to publish the message: ' + error.message;
            this._handleError(error);
        }

    };
    quit()
    {
        try {
        
            this.client.quit(); 
            return;

        } catch (error) {
            error.message = 'Failed to quit in the PubSub: ' + error.message;
            this._handleError(error);
        }

    };
    unsubscribe()
    {
    try {
        
            this.client.unsubscribe(); 
            return;

        } catch (error) {
            error.message = 'Failed to unsubscribe in the PubSub: ' + error.message;
            this._handleError(error);
        }
    } 

}
module.exports = PubSub;