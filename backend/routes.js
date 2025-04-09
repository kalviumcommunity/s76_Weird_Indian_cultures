const express = require('express');
const route = express.Router();
const { create, fetch, update, Delete, getItem , users,usercreatedby, } = require('./controller/ItemController');
const { login,signup} = require('./controller/Auth');


route.get('/fetch', fetch);

route.post('/create', create);

route.put('/update/:id', update);

route.delete('/delete/:id', Delete);


route.get('/fetch/:id', getItem);

route.get('/usercreatedby/:userId',usercreatedby);
route.get('/users',users);

route.post("/signup", signup);
route.post("/login", login);



module.exports = route;
