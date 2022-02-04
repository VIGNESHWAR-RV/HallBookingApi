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



app.use(express.json()); //middleware
app.use(cors());

app.use("/",apiRoutes);

app.listen(port,console.log("Server Started at ",port));