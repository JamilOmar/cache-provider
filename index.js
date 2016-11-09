const express = require('express')
const app = express()
var cache =  require('./lib/cache');
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
const cobject = new cache(options);
cobject.initialize();

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




app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})