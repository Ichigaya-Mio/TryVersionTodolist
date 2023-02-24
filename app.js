//jshint esversion:6



const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");
const app = express();
require("dotenv").config();

mongoose.set('strictQuery', false);

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');



mongoose.set('strictQuery', true);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//与云端服务器连接 connect to mongodb server
const connectDB = async () => {
  try{
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected: ${conn.connection.host}');
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
}


//mongoose.connect("mongodb+srv://Nskgcst:Icgylovesaaya1027!@cluster0.amrnehf.mongodb.net/todolistDB");


//本地连接
//mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


const itemSchema = new mongoose.Schema({
  name: String
});


const Item = mongoose.model("Item", itemSchema);


const item1 = new Item ({
  name: "Gun"
});

const item2 = new Item ({
  name: "Takina"
});

const item3 = new Item ({
  name: "Chisato"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema] 
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Insert successfully!");
        }
      });

      res.redirect("/");
    } else {

      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }

  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();

    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, result){
      result.items.push(newItem);
      result.save(() => res.redirect("/" + listName));

    });
  }
 
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Delete target successfully.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, result){
        if(!err){
          res.redirect("/" + listName);
        }
    });
  }

});


app.get("/:listNameTag", function(req, res){
  const customListName = lodash.capitalize(req.params.listNameTag);

  List.findOne({name: customListName}, function(err, result){
    if(!err){
      if(!result){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save(() => res.redirect('/' + customListName));
      } else{
        res.render("list", {listTitle: result.name , newListItems: result.items});
      }
    }
  });

});



app.get("/about", function(req, res){
  res.render("about");
});


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on port ${PORT}");
  });  
  
});

