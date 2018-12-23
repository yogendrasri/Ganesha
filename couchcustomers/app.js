const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
    auth: {
        user: 'ganesha',
        password: 'ganesha'
    }
});

const dbName = 'customers';
const viewUrl = '_design/all_customers/_view/all';

couch.listDatabases().then(function(dbs){
    console.log(dbs);
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/',function(req, res){
   //res.send('working...'); 
   //res.render('index');
   couch.get(dbName,viewUrl).then(
       function(data, headers, status){
            console.log(data.data.rows);
            res.render('index',{
                customers:data.data.rows
            });
       },
       function(err){
           res.send(err);
       });   
});

app.post('/customer/add',function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    
    couch.uniqid().then(function(ids){
        const id = ids[0];
    couch.insert('customers',{
        _id:id,
        name: name,
        email: email
    }).then(
    function(data,headers,status){
        res.redirect('/');
    },
    function(err){
        res.send(err);
    });

    });

});

app.post('/customer/delete/:id',function(req,res){
    const id = req.params.id;
    const rev = req.body.rev;

    couch.del("customers",id,rev).then(
        function(data,headers,status){
            res.redirect('/');
        },
        function(err){
            res.send(err);
        });

});

app.listen(3000,function(){
    console.log('server started on port 3000');
});



