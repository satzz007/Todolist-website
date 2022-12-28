//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");

const _=require("lodash");

main().catch(err => console.log(err));

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function main(){
  await mongoose.connect("mongodb+srv://sathishkumar:9894Sathish@cluster0.wewe2xk.mongodb.net/todoDB");
  console.log("connected");

  const itemsSchema=new mongoose.Schema({
    name:String
  });

  const Item=mongoose.model("Item",itemsSchema);

  const item1=new Item({
    name:"Welcome to the todoList"
  });

  const item2=new Item({
    name:"Add the + to add the todoList"
  })

  const item3=new Item({
    name:"<== Click this to delete the todolist"
  })

  const defaultItems=[item1,item2,item3];

  const listSchema=new mongoose.Schema({
    name:String,
    items:[itemsSchema]
  })

  const List=mongoose.model("List",listSchema);



// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();


Item.find({},function(err,foundItem){

  if(foundItem.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Sucessfully inserted");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "today", newListItems: foundItem});
  }

})

});

app.post("/", function(req, res){
  const listName=req.body.list;
  const item4=new Item({
    name:req.body.newItem
  });
  if(listName==="today"){
   item4.save();
   res.redirect("/");
}else{
    List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item4);
    foundList.save();
    res.redirect("/"+listName)
  })
}

});

app.post("/delete",function(req,res){
  const checkboxid=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="today"){
    Item.findByIdAndRemove(checkboxid,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Sucessfully Deleted");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull :{_id:checkboxid},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    }})
  }

})

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  const list=new List({
    name:customListName,
    items:defaultItems
  });
  list.save();
  List.findOne({name:customListName},function(err,foundName){
    if(!err){
      if(!foundName){
          const list=new List({
            name:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle: foundName.name, newListItems: foundName.items})
      }
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

}
