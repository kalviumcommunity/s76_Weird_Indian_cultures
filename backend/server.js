require('dotenv').config(); 

const express = require('express');
const app = express();
const port = process.env.PORT ;
// const dotenv =require("dotenv");
const {connectDatabase, getConnection} = require('./database');
const cors = require('cors');
app.use(cors());


app.use(express.json());

app.use('/api/item', require('./routes'));    
app.get('/ping', (req, res) => {
    res.send('Pong!');
});

connectDatabase();

app.get('/',(req,res)=>{
    console.log('connected')
    res.send(getConnection());
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
