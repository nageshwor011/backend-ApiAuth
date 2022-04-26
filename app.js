import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors'
import dbConn from './config/connectdb.js'

import userRoot from './routes/userRoot.js';


 const app = express();
 
 //database url
const DATABASE_URL = process.env.DATABASE_URL

 //accessing the port from the .env file PORT is variable
//  const port = process.env.PORT || 8000;
const port = process.env.PORT || 8000;

//cors polocy to fix front connection errors
app.use(cors())

//stablishing the connection
 dbConn(DATABASE_URL)

//using middleware for json
app.use(express.json())

app.use("/api/user", userRoot)

app.get('/', (req, resp)=>{
    resp.send('hello server');
})



 app.listen(port, ()=>{
     console.log(`server is running at port ${port}`);
 })