const express = require('express');
const app = express();
const router = require('./router');

app.use('/users', router);

app.get('/', (req, res) => {
  res.status(200).send('Wecome to Todo List API !');
});

module.exports = app;
