import express from "express";
import { ObjectId } from "mongodb";
import { client } from "./index.js";
import { check_Available_Halls,
         getting_All_Booked_Halls, 
         get_Details_Of_Booking_Hall,
         all_Halls,
         booked_Customers,
         current_Customers,
         booking_Hall,
         check_Existing_Hall_Name, 
         create_Hall,
         reset_After_End_Time } from "./mongoDB_commands.js";

const route = express.Router();

function conversion_Into_TimeStamp(date=0,time=0){
    
    const offset = (-330/30)*0.5;
    let Time;
    if(date===0 && time===0){
       Time = Date.now();
   
    }else{
        Time = Date.parse(date + " " + time);
    }
    const timeStamp = Time - (offset*3600000);
    return timeStamp;

}

// endPoint for Available halls
route.get("/", async (request, response) => {

    const updation = await check_For_Current_Time();

    if(updation){
    const availHalls = await check_Available_Halls();

    return response.status(200).send({status:updation,result:availHalls});
    }

    return response.status(500).send("server unavailable");
});


//endPoint to check the details of hall to be booked
route.get("/bookHall/:name", async (request, response) => {

    const hallName = request.params;
    const customers = await get_Details_Of_Booking_Hall(hallName);

    const updation = await check_For_Current_Time();

    if(updation && customers){
         let customerIds = [];

         for(let customerId of customers.customerId){
              customerIds.push(ObjectId(customerId));
         }

         
         const currentCustomers = await current_Customers(customerIds);
         
        const previousCustomers = await client.db("userDB")
                                              .collection("hallUsers")
                                              .find({hallName:hallName,_id:{$nin:customerIds}})
                                              .toArray();

        return response.send({status:updation,result:{currentCustomers,previousCustomers}});
    }

    
});


//endPoint for ALL Rooms
route.get("/allHalls", async (request, response) => {

    const updation = await check_For_Current_Time();

    if(updation){
    const allHalls = await all_Halls();
    return response.send({status:updation,result:allHalls});
    }
    return response.status(500).send("server unavailable");
});

//endPoint for Customers
route.get("/customers", async (request, response) => {

    const updation = await check_For_Current_Time();

    const currentCustomers = await booked_Customers();

    
    if(updation && currentCustomers){
      const customers = await current_Customers(currentCustomers);
    
    return response.send({status:updation,result:customers});
    }

    return response.status(500).send("server unavailable");

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

    // customer's event - starting timeStamp
    const startTimeStamp = conversion_Into_TimeStamp(customerDetails.date,customerDetails.startTime);

    // customer's event - ending timeStamp
    const endTimeStamp = conversion_Into_TimeStamp(customerDetails.date,customerDetails.endTime);

    //checking whether the event duration is atleast one hour
    if (!(+endTimeStamp >= +startTimeStamp + 3600000)) {
        return response.status(400).send("shcedule must be atleast 1 hour");
    }


    // for current indian  timeStamp
    const indianTimeStamp = conversion_Into_TimeStamp();

      //checking if the schedule is upComing time 
    if (+startTimeStamp > +indianTimeStamp) {
        
        //checking for customers who registered on the same day and same hall
        const customerCheck = {date:customerDetails.date,hallName:hallName.name}

        const existingCustomerOnDate = await client.db("userDB")
                                             .collection("hallUsers")
                                             .find(customerCheck)
                                             .toArray();

        // checking time of customers existing on same date and hall  
        if(existingCustomerOnDate){
          
        // since in-between time in schedule also should be checked ,but date and time is in string , so can't check directly 
          const existingCustomer = existing_Date_Time_Check(existingCustomerOnDate, startTimeStamp, endTimeStamp);
         
          if(existingCustomer === "yes"){
        
            //sending registered already if already exist
              return response.status(400).send("registered already in particular time");
           
            }
        
        }
    
        const customer = {...customerDetails, hallName:hallName.name};
        const booking = await booking_Hall(customer);

        return response.send(booking);
    }

  

    return response.status(400).send("date or time not in the upComing days");
});

const check_For_Current_Time = async () => {


    const BookedHalls = await getting_All_Booked_Halls();

    if (BookedHalls) {

        BookedHalls.forEach(async(hall) => {

              const customerIds_Of_Each_Hall = hall.customerId;
      

             customerIds_Of_Each_Hall.forEach( async(id)=>{

                    const customer = await client.db("userDB")
                                                 .collection("hallUsers")
                                                 .findOne({"_id":ObjectId(id)});
    
                if(customer){

                    const indianCurrentTimeStamp = conversion_Into_TimeStamp();
        
                    const customerEndTimeStamp = conversion_Into_TimeStamp(customer.date,customer.endTime);

                    if (+customerEndTimeStamp < +indianCurrentTimeStamp) {
                           await reset_After_End_Time(hall,id);
                    }
                 }
           });
        });
    }
    return "updated";
};


 function existing_Date_Time_Check(existingCustomerOnDate, startTimeStamp, endTimeStamp) {

    for(let customer of existingCustomerOnDate){


        const existingCustomerStartingTimeStamp = conversion_Into_TimeStamp(customer.date,customer.startTime);
        
        const existingCustomerEndingTimeStamp = conversion_Into_TimeStamp(customer.date,customer.endTime);
 
        if((startTimeStamp >= existingCustomerStartingTimeStamp
                               &&
            startTimeStamp <= existingCustomerEndingTimeStamp)
            
                                ||
    
            (endTimeStamp >= existingCustomerStartingTimeStamp
                                &&
             endTimeStamp <= existingCustomerEndingTimeStamp)){

            return "yes";

        }
    }
    return "no";
}


export const apiRoutes = route;



