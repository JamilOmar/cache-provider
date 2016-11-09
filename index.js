const express = require('express')
const app = express()
const cache =  require('./lib/cache');
const pubSub = require('./lib/pubSub');
const logger = {

error :function (error)
{
    console.log('error');
}


}
let options = {

connection : { "host":"127.0.0.1",
          "port":6379 
},

logger:logger,

type :"redis-provider"

};

let pubSubOptions = {

connection : { "host":"127.0.0.1",
          "port":6379 
},configuration:
    {
    subscriber :true
    },
logger:logger,
list :"list"
};

let pubSubOptionsPub = {

connection : { "host":"127.0.0.1",
          "port":6379 
},
configuration:
    {
    publisher :true
    },
logger:logger,
list :"list"
};

////test for cache 
var cobject = new cache(options);
var cpubSub = new pubSub(pubSubOptions);
var cpubSubPub = new pubSub(pubSubOptionsPub);

cobject.initialize();
/// test for pubSub
cpubSub.initialize();
cpubSubPub.initialize();
cpubSub.on("message",(channel,message)=>
{
    console.log(message);
})
cpubSub.on("subscribe",(channel,count)=>
{
    console.log(count);
})
app.get('/',  (req, res)=> {


 cobject.getCache(["ID","Jamil","INFO"], (err,data)=>
  {

      res.send(data);

  })


})
app.post('/insert',(req, res) => {
  cobject.saveCache(["ID","Jamil","INFO"],{name:"jamil", age:31}, (err,data)=>
  {

          res.send("success");

  })
})
app.post('/publish',(req, res) => {
    cpubSubPub.publish("using pubsub");
     res.send("using pubsub");
})




app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})