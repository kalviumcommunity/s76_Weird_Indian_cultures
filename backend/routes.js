const express = require("express");
const route = express.Router();
const { create, fetch, update, Delete, getItem, users, usercreatedby } = require("./sql_controller/S_ItemController");
const { login, signup , logout} = require("./sql_controller/S_auth");

const authenticate =require('./middleware/authMiddleware')

route.get("/fetch", authenticate, fetch);

route.post("/create", authenticate, create);

route.put("/update/:id", authenticate, update);

route.delete("/delete/:id", authenticate, Delete);

route.get("/fetch/:id", authenticate, getItem);

route.get("/usercreatedby/:userId", authenticate, usercreatedby);
route.get("/users", authenticate, users);

route.post("/signup", signup);
route.post("/login", login);

route.post('/logout', logout);

module.exports = route;
