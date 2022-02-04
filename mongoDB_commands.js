import { client } from "./index.js";

// function for reseting after customer's specified endTime
export async function reset_After_End_Time(hall) {
    return await client.db("userDB")
        .collection("Halls")
        .updateOne({ name: hall.name },
            [{ $set: { hallAvail: "Available" } },
            {
                $unset: ["customerName",
                    "date",
                    "startTime",
                    "endTime"
                ]
            }]);
}

   //function for checking all available halls
   export async function check_Available_Halls() {
    return await client.db("userDB")
        .collection("Halls")
        .find({ hallAvail: "Available" })
        .toArray();
}

 //function for getting details of all booked halls
export async function getting_All_Booked_Halls() {
    return await client.db("userDB")
        .collection("Halls")
        .find({ hallAvail: "Booked" })
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

   //function to check if the hallName already exist
export async function check_Existing_Hall_Name(newHall) {
    return await client.db("userDB")
        .collection("Halls")
        .findOne({ name: newHall.name });
}

  //function to book a hall
export async function booking_Hall(hallName, customerDetails) {
    return await client.db("userDB").collection("Halls")
        .updateOne({ name: hallName.name },
            {
                $set: {
                    hallAvail: "Booked",
                    customerName: customerDetails.name,
                    date: customerDetails.date,
                    startTime: customerDetails.startTime,
                    endTime: customerDetails.endTime
                }
            });
}

//   //function to get current  booked customers 
//   export async function booked_Customers() {
//     return await client.db("userDB")
//         .collection("Halls")
//         .find({ hallAvail: "Booked" })
//         .project({ _id: 0, customerName: 1, name: 1, date: 1, startTime: 1, endTime: 1 })
//         .toArray();
// }

//  //function to get details of booked hall 
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
