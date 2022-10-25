const express= require("express");
const bodyParser= require("body-parser");
const ejs= require("ejs");
const mongoose= require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app= express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

var userProfile, index;

const userSchema= new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    books: [{name:String,author:String}]
});

mongoose.connect("mongodb://localhost:27017/booksDB");

const User = mongoose.model('User', userSchema);

app.get("/",function(req,res){
  res.render("home",{msg:""});
});

app.get("/sign in",function(req,res){
    res.render("sign in",{text:""});
});

app.get("/login",function(req,res){
    res.render("login",{text:""});
});

app.get("/book",function(req,res){
    res.render("book");
});

app.post("/sign in",function(req,res){
    User.findOne({username: req.body.username},function(err,doc){
        if(doc===null){
            if(req.body.password===req.body.cpassword){
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    var user= new User({
                        name: req.body.name,
                        username: req.body.username,
                        password: hash
                      });
                      user.save();
                });                
                res.render("home",{msg:"registration complete!"});
              }else{
                res.render("register",{text:"Passwords don't match!"});
              }
        }else{
            res.render("register",{text:"Username already exists"});
        }
    });
});

app.post("/login",function(req,res){
    User.findOne({username: req.body.username},function(err,doc){
        if(doc != null){
            bcrypt.compare(req.body.password, doc.password, function(err, result) {
                result == true;
                if(result===true){
                    res.render("profile",{name: doc.name,books: doc.books});
                    userProfile= doc.username;
                }else{
                    res.render("login",{loginMsg: "Incorrect Password!"});
                }
            });
        }else{
            res.render("login",{loginMsg: "Incorrect Username!"});
        }
    });
});

app.post("/add",function(req,res){
    User.findOne({username: userProfile},function(err,doc){
       var obj={};
       obj.name= req.body.name;
       obj.author= req.body.author;
       doc.books.push(obj);
       doc.save();
    res.render("profile",{name: doc.name, books: doc.books});
    });
});

app.post("/update",function(req,res){
    if(req.body.action==="update"){
        User.findOne({username: userProfile},function(err,doc){
           index= req.body.index;
            res.render("update");
        });
    }else{
        User.findOne({username: userProfile},function(err,doc){
           doc.books.splice(req.body.index,1);
           doc.save();
           res.render("profile",{name: doc.name, books: doc.books});
         });
    }
});

app.post("/change",function(req,res){
    User.findOne({username: userProfile},function(err,doc){
        var obj={};
        obj.name= req.body.name;
        obj.author= req.body.author;
        doc.books.splice(index, 1, obj);
        doc.save();
        res.render("profile",{name: doc.name, books: doc.books});
     });
});

app.listen(3000,function(){
  console.log("Server started at port 3000");
});
