const {
  update,
  create,
  fetch,
  Delete,
  getItem,
  users,
  usercreatedby,
  likeItem,
  saveItem,
  addComment,
  getComments
} = require('./sql_controller/S_ItemController');

const { signup, login, logout } = require('./sql_controller/S_auth');

const express = require('express');
const route = express.Router();
const authenticate = require('./middleware/authmiddleware');
const upload = require('./middleware/multer'); // ⬅️ Import multer config

// 🔐 Auth routes
route.post('/login', login);
route.post('/signup', signup);
route.post('/logout', authenticate, logout);

// 📌 Item CRUD (with file upload for create and update)
route.post(
  '/create',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  create
);

route.get('/fetch', fetch);
route.get('/fetch/:id', authenticate, getItem);

// For update, also allow files (optional)
route.put(
  '/update/:id',
  authenticate,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  update
);

route.delete('/delete/:id', authenticate, Delete);

// 🙋 User-related
route.get('/users', users);
route.get('/usercreatedby/:userId', usercreatedby);

// ❤️ Like / Save / Comment
route.put('/like/:id', likeItem);
route.post('/save', saveItem);
route.post('/comment', addComment);
route.get('/comments/:itemId', getComments);

module.exports = route;