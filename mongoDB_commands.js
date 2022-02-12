
import { ObjectId } from "mongodb";
import { client } from "./index.js";

// function for reseting after customer's specified endTime
export async function reset_After_End_Time(hall, date, id) {

    const remove_id = await client.db("userDB")
        .collection("Halls")
        .updateOne(
            { name: hall, "customers.date": date },
            { $pull: { "customers.$.customerId": id } }  // to pull specific customer from array
        );


    return remove_id;
}
export async function delete_Old_Date(deadline) {
    return client.db("userDB")
        .collection("Halls")
        .updateMany({},
            {
                $pull: {
                    customers: {
                        date_DeadLine: { $lt: deadline }
                    }
                }
            });


}
//function for checking all available halls
export async function check_Available_Halls() {
    return await client.db("userDB")
        .collection("Halls")
        .find({ customers: { $exists: true, $size: 0 } })  // {$exists:true,$e:[]} - check for empty array
        .toArray();
}

//function for getting details of all booked halls
export async function getting_All_Booked_Halls(date) {
    return await client.db("userDB")
        .collection("Halls")
        .find({ customers: { $exists: true, $ne: [] }, "customers.date": date }) // {$exists:true,$ne:[]} - check for non - empty array
        .project({ _id: 0, "customers.customerId.$": 1 })
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
export async function booking_Hall(customer, date_DeadLine) {

    await client.db("userDB")
        .collection("hallUsers")
        .insertOne(customer);


    const customerId = await client.db("userDB")
        .collection("hallUsers")
        .findOne(customer,
            { projection: { "_id": 1 } });

    const customerStringId = customerId._id.toString();

    const dateCheck = await client.db("userDB")
        .collection("Halls")
        .findOne({
            name: customer.hallName,
            "customers.date": customer.date
        });

    if (dateCheck) {
        const updatingInHall = await client.db("userDB")
            .collection("Halls")
            .updateOne({ name: customer.hallName, "customers.date": customer.date },
                { $push: { "customers.$.customerId": customerStringId } }) //to push specific customerId to array

        return updatingInHall;
    } else {

        const customerObject = {
            date: customer.date, date_DeadLine,
            customerId: [customerStringId]
        };

        const updatingInHall = await client.db("userDB")
            .collection("Halls")
            .updateOne({ name: customer.hallName },
                { $push: { customers: customerObject } })     //to push specific customerId to array
        return updatingInHall;
    }




}

//function to get current  booked customers id
export async function booked_Customers() {

    let booked_CustomersId = [];
    const hall_Customers = await client.db("userDB")
        .collection("Halls")
        .find({ customers: { $exists: true, $ne: [] } })  //to find id of existing customers
        .project({ _id: 0, customers: 1 })
        .toArray();

    if (hall_Customers) {
        hall_Customers.forEach((hall) => {
            hall.customers.forEach((date) => {
                date.customerId.forEach((id) => {
                    booked_CustomersId.push(ObjectId(id));
                });
            });
        });
    }
    return booked_CustomersId;

}
// function to get customer details from customerId
export async function current_Customers(currentCustomers) {
    return await client.db("userDB")
        .collection("hallUsers")
        .find({ _id: { $in: currentCustomers } })
        .toArray();
}

//function to get details of booking hall 
export async function get_Details_Of_Booking_Hall(hallName) {
    return await client.db("userDB")
        .collection("Halls")
        .findOne({ name: hallName.name },
            {
                projection: {
                    "_id": 0,
                    "customers": 1
                }
            });
}
