const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express()

app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-prachi:Test123@cluster0.xqrmkt9.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
	name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
	name: "Welcome to your ToDolist!!!"
});

const item2 = new Item({
	name: "Hit the + button to add new item"
});

const item3 = new Item({
	name: "<-- hit this to delete the item"
});

const defaultitems = [item1, item2, item3];

const listSchema = {
	name: String,
	items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {

	Item.find({}, function (error, foundItems) {
		if (foundItems.length === 0) {
			Item.insertMany(defaultitems, function (error) {
				if (error) {
					console.log(error);
				}
				else {
					console.log("successfully saved items to the DB.");
				}
			});
			res.redirect("/");
		} else {

			res.render("list", { listTitle: "Today", newListItems: foundItems });
		}

	});
});
app.get("/:customListName", function (req, res) {
	const customListName = _.capitalize(req.params.customListName);
	List.findOne({ name: customListName }, function (err, foundlist) {
		if (!err) {
			if (!foundlist) {
				//create a new list
				const list = new List({
					name: customListName,
					items: defaultitems
				});

				list.save();
				res.redirect("/" + customListName);
			} else {
				//show a existing list
				res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });
			}
		}
	});

});

app.post("/", function (req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName
	})

	if (listName === "Today") {
		item.save();
		res.redirect("/");
	} else {
		List.findOne({ name: listName }, function (err, foundlist) {
			foundlist.items.push(item);
			foundlist.save();
			res.redirect("/" + listName);
		})
	}

});
app.post("/delete", function (req, res) {
	const checkitemId = req.body.checkbox;
	const listName = req.body.listName;

	if (listName === "Today") {
		Item.findOneAndRemove(checkitemId, function (err) {
			if (!err) {
				console.log("Successfully deleted the item.");
				res.redirect("/");
			}
		})
    }else{
		List.findOneAndUpdate({name: listName},{$pull:{items : {_id: checkitemId}}},function(err,foundlist)
		{
			if(!err)
			{
				res.redirect("/" + listName);
			}
		})
	}
});



app.listen(3000, function () {
	console.log("Server started on 3000");
});










