import express from "express";
import dotenv from "dotenv";
import {MongoClient} from "mongodb";
import cors from "cors";
import {apiRoutes} from "./routes.js";

dotenv.config();

export const app = express();


const port = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function createConnection(){
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("mongo is connected");
    return client;
}
export const client = await createConnection();

// const time =  (Date.now());
// const offset = (new Date().getTimezoneOffset()/30)*0.5;
// const indianTime = time - (offset*3600000);
// const currentTime = new Date(indianTime);
// console.log(currentTime.toISOString().split("T")[0]);
//console.log(Date.parse("2022-02-12 23:59:59"),(Date.parse("2022-02-13 00:00:00")));


app.use(express.json()); //middleware
app.use(cors());

app.use("/",apiRoutes);

app.listen(port,console.log("Server Started at ",port));