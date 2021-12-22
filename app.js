const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")
const app = express()
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
mongoose.connect("mongodb+srv://admin-dashrath:Amazon111@cluster0.ojygj.mongodb.net/todolistDB1")

const itemsSchema = {
    name : String
}
const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item({
    name:'Welcome to to-do-list.'
})
const item2 = new Item({
    name:'Hit the + button to add a new Item.'
})
const item3 = new Item({
    name:'<-- Hit this to delete an Item .'
})

const defaultItems_arr=[item1,item2,item3]

const listSchema = {
    name:String,
    items:[itemsSchema]
}

const List = mongoose.model("List",listSchema)

app.get("/",function(req,res){
    Item.find(function(err,results){
        if (results.length===0){
        Item.insertMany(defaultItems_arr,function(err){
            if(err){console.log(err)}
            else{
                console.log("Successfuly Done")
            }
         })
        res.redirect("/")
        }
        else{
        if(err){
            console.log(err)
        }else{
            // console.log(results)
            res.render("list",{listTitle:'Today',newArrayItem:results})
        }
        }
    })
  
    
})

app.post("/",function(req,res){
    const itemName = req.body.newItem
    const listName = req.body.list_
    const item4   = new Item({
        name:itemName
    })
    if(listName==='Today'){
        item4.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item4)
            foundList.save()
            res.redirect("/"+listName)
        })
       
    }
    
    
})
app.post("/delete",function(req,res){
    // console.log(req.body.del_checkbox)
    const checkedItemId = req.body.del_checkbox
    const listName = req.body.listName
    if(listName==='Today'){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err)
            }
        })
        res.redirect("/")
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
   
})



app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName) 
   
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            List.findOneAndDelete({name:"favicon.ico"},function(err){
                if(err){
                    console.log(err)
                }
            })
            if(!foundList){
                // Create a new list.
                const list = new List({
                    name:customListName,
                    items:defaultItems_arr
                })
                list.save()
                res.redirect("/"+customListName)
            }else{
                res.render("list",{listTitle:foundList.name,newArrayItem:foundList.items})
               
            }
            
        }
    })
   
    
  
})

let port = process.env.PORT;
if (port == null || port== " "){
    port = 3000
}
app.listen(port,function(){
    console.log("Server is spinning at port 3000")
})