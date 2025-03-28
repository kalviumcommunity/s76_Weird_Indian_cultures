const express = require('express');
const route = express.Router();
const { create, fetch, update, Delete, getItem } = require('./controller/ItemController');


route.get('/fetch', fetch);

route.post('/create', create);

route.put('/update/:id', update);

route.delete('/delete/:id', Delete);


route.get('/fetch/:id', getItem);

module.exports = route;
