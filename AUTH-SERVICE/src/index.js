const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require('./config/databse')
const routes = require('./routes/v1/index')
const bodyParser=require('body-parser');
const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));


connectDB();
app.use(express.json());

app.use("/api/v1/auth", routes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("Auth Service Running");
});