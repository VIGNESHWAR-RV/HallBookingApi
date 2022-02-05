import { client } from "./index.js";

// function for reseting after customer's specified endTime
export async function reset_After_End_Time(hall,id) {
    return await client.db("userDB")
        .collection("Halls")
        .updateOne(
             { name: hall.name },
             { $pull: {"customerId":id}}  // to pull specific customer from array
             );
}

   //function for checking all available halls
   export async function check_Available_Halls() {
    return await client.db("userDB")
                       .collection("Halls")
                       .find({ customerId : {$exists:true,$size:0}})  // {$exists:true,$e:[]} - check for empty array
                       .toArray();
}

 //function for getting details of all booked halls
export async function getting_All_Booked_Halls() {
    return await client.db("userDB")
        .collection("Halls")
        .find({ customerId: {$exists:true,$ne:[]}}) // {$exists:true,$ne:[]} - check for non - empty array
        .toArray();
}

   //function to get all halls including both available and booked
export async function all_Halls() {
    return await client.db("userDB")
        .collection("Halls")
        .find({})
        .toArray();
}

    //function for creating new hall
export async function create_Hall(newHall) {
    return await client.db("userDB")
        .collection("Halls")
        .insertOne(newHall);
}

   //function to check if the hallName already exist while creating hall
export async function check_Existing_Hall_Name(newHall) {
    return await client.db("userDB")
        .collection("Halls")
        .findOne({ name: newHall.name });
}

  //function to book a hall
export async function booking_Hall(hallName, customerDetails) {

    const customer = {
        customerName: customerDetails.name,
        hallName:hallName.name,
        date: customerDetails.date,
        startTime: customerDetails.startTime,
        endTime: customerDetails.endTime}
   


      await client.db("userDB")
                  .collection("hallUsers")
                  .insertOne(customer);


    const customerId = await client.db("userDB")
                                   .collection("hallUsers")
                                   .findOne(customer)
                                   .porject({"_id": 1});

    const updatingInHall = await client.db("userDB")
                                       .collection("Halls")
                                       .updateOne({name:hallName.name},
                                               {$push:{customerId:customerId}}) //to push specific customerId to array
    return updatingInHall;
}

  //function to get current  booked customers 
  export async function booked_Customers() {

  let booked_Customers = [];

   const hall_Customers =  await client.db("userDB")
                                         .collection("Halls")
                                         .find({ customerId: {$exists:true,$ne:[]}})  //to find id of existing customers
                                         .project({customerId: 1})
                                         .toArray();

   hall_Customers.forEach(async(hall)=>{
       hall.forEach(async(id)=>{
           const customer = await client.db("userDB")
                                        .collection("hallUsers")
                                        .findOne({_id:id});
           booked_Customers.push(customer);
       });
   });

   return booked_Customers;
    
}

 //function to get details of booked hall 
// export async function get_Details_Of_Booked_Hall(hallName) {
//     return await client.db("userDB")
//         .collection("Halls")
//         .findOne({ name: hallName.name, hallAvail: "Booked" },
//             {
//                 projection: {
//                     "_id": 0,
//                     "customerName": 1,
//                     "date": 1,
//                     "startTime": 1,
//                     "endTime": 1
//                 }
//             });
// }
