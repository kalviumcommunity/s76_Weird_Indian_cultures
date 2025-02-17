const express = require('express');
const route = express.Router();
const ItemController = require('./controller/ItemController');

const { create, fetch, update, Delete } = ItemController;

route.get('/fetch', fetch);
route.post('/create', create);
route.put('/update/:id', update);
route.delete('/delete/:id', Delete);

module.exports = route;