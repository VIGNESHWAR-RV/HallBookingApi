import express from "express";
import { check_Available_Halls,
         getting_All_Booked_Halls, 
         all_Halls,
         booking_Hall,
         check_Existing_Hall_Name, 
         create_Hall,
         reset_After_End_Time } from "./mongoDB_commands.js";

const route = express.Router();


// endPoint for Available halls
route.get("/", async (request, response) => {

    await check_For_Current_Time();

    const availHalls = await check_Available_Halls();

    return response.status(200).send(availHalls);
});

// //endPoint to check if the hall is booked 
// route.get("/bookHall/:name", async (request, response) => {

//     const hallName = request.params;
//     const HallBooked = await get_Details_Of_Booked_Hall(hallName);

//     return response.send(HallBooked);
// });


//endPoint for ALL Rooms
route.get("/allHalls", async (request, response) => {

    await check_For_Current_Time();

    const allHalls = await all_Halls();
    return response.send(allHalls);
});

//endPoint for Customers
route.get("/customers", async (request, response) => {

    await check_For_Current_Time();

    const currentCustomers = await getting_All_Booked_Halls();
    return response.send(currentCustomers);


});

//endPoint for Creating new Hall
route.post("/createHall", async (request, response) => {

    const newHall = request.body;

    const existingHallName = await check_Existing_Hall_Name(newHall);

    if (existingHallName) {
        return response.status(400).send("HallName already Exists");
    }

    const createHall = await create_Hall(newHall);
    return response.send(createHall);

});

//endPoint for Booking Halls
route.post("/bookHall/:name", async (request, response) => {
    const hallName = request.params;
    const customerDetails = request.body;

    const currentTimeStamp = Date.now();
    const offset = (new Date().getTimezoneOffset()/30)*0.5;
    const indianTimeStamp = currentTimeStamp - (offset*3600000);
    


    const startTime = Date.parse(customerDetails.date + " " + customerDetails.startTime);
    const endTime = Date.parse(customerDetails.date + " " + customerDetails.endTime);


    if (+startTime > +indianTimeStamp && +endTime >= +startTime + 3600000) {

        const booking = await booking_Hall(hallName, customerDetails);

        return response.send(booking);
    }

    if (!(+endTime >= +startTime + 3600000)) {
        return response.status(400).send("shcedule must be atleast 1 hour");
    }

    return response.status(400).send("date or time is not valid");
});

const check_For_Current_Time = async () => {


    const BookedHalls = await getting_All_Booked_Halls();

    if (BookedHalls) {
        BookedHalls.forEach(async (hall) => {
            const currentTimeStamp = Date.now();
            const offset = (new Date().getTimezoneOffset()/30)*0.5;
            const indianTimeStamp = currentTimeStamp - (offset*3600000);

            const EndTime = Date.parse(hall.date + " " + hall.endTime);

            if (+EndTime < +indianTimeStamp) {
                const reset = await reset_After_End_Time(hall);

                return reset;
            }
        });
    }
};


export const apiRoutes = route;


