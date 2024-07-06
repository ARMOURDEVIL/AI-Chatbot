const {initializeApp, applicationDefault, cert} = require('firebase-admin/app');
const {getFirestore, Timestamp, FieldValue, Filter} = require('firebase-admin/firestore');

// get API-key from config.json
var serviceAccount = require("./config.json").firestore;

var admin = require("firebase-admin");
const timers = require("node:timers");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

// Add a table; tested
async function addTable(amount_of_seats, table_number, is_outside) {
    try {
        const docRef = db.collection("tables").doc(String(table_number));

        await docRef.set({
            amount_of_seats: amount_of_seats,
            number: String(table_number),
            is_outside: is_outside
        });
        return "Table added successfully";
    } catch (error) {
        return "Error adding table: " + String(error);
    }
}

// add User
async function addUser(id, name, password, is_admin) {
    try {
        await db.collection('users').doc(String(id)).set({
            id: String(id),
            name: name,
            password: password,
            is_admin: is_admin
        });
        return "User added successfully";
    } catch (error) {
        return "Error adding user: " + String(error);
    }
}

// add Reservation
async function addReservation(tableRef, time_slot, userRef) {
    try {
        const reservation = await db.collection('reservations').add({
            table: tableRef,
            time_slot: time_slot,
            user: userRef
        });
        return "Reservation added successfully with ID: " + String(reservation.id);
    } catch (error) {
        return "Error adding reservation: " + String(error);
    }
}

// update Table
async function updateTable(number, amount_of_seats, is_outside) {
    try {
        await db.collection('tables').doc(String(number)).update({
            amount_of_seats: amount_of_seats,
            is_outside: is_outside
        });
        return `Table ${number} updated successfully`;
    } catch (error) {
        return "Error updating table: " + String(error);
    }
}

// update User
async function updateUser(id, name, password, is_admin) {
    try {
        await db.collection('users').doc(String(id)).update({
            name: name,
            password: password,
            is_admin: is_admin
        });
        return "User updated successfully";
    } catch (error) {
        return "Error updating user: " + String(error);
    }
}

// update Reservation
async function updateReservation(reservationId, tableRef, time_slot, userRef) {
    try {
        await db.collection('reservations').doc(reservationId).update({
            table: tableRef,
            time_slot: time_slot,
            user: userRef
        });
        return "Reservation updated successfully";
    } catch (error) {
        return "Error updating reservation: " + String(error);
    }
}

// delete Table
async function deleteTable(number) {
    try {
        await db.collection('tables').doc(String(number)).delete();
        return `Table ${String(number)} deleted successfully`;
    } catch (error) {
        return "Error deleting table: " + String(error);
    }
}

// delete User
async function deleteUser(id) {
    try {
        await db.collection('users').doc(String(id)).delete();
        return `User ${String(id)} deleted successfully`;
    } catch (error) {
        return "Error deleting user: " + String(error);
    }
}

// delete Reservation
async function deleteReservation(reservationId) {
    try {
        await db.collection('reservations').doc(String(reservationId)).delete();
        return `Reservation ${String(reservationId)} deleted successfully`;
    } catch (error) {
        return "Error deleting reservation: " + String(error);
    }
}

// get table info by ID
async function getTableById(tableId) {
    try {
        const tableDoc = await db.collection('tables').doc(String(tableId)).get();
        if (tableDoc.exists) {
            // console.log(`Table data: `, tableDoc.data());
            return "Table data: " + String(tableDoc.data());
        } else {
            // console.log(`No table found with ID: ${tableId}`);
            return "This table does not exist";
        }
    } catch (error) {
        return `Error getting table with ID ${tableId}: ` + String(error);
    }
}

// get user info by their ID
async function getUserById(userId) {
    try {
        const userDoc = await db.collection('users').doc(String(userId)).get();
        if (userDoc.exists) {
            // console.log(`User data: `, userDoc.data());
            return `User data: ` + String(userDoc.data());
        } else {
            // console.log(`No user found with ID: ${userId}`);
            return "This user does not exist";
        }
    } catch (error) {
        return `Error getting user with ID ${userId}: ` + String(error);
    }
}

// get reservation info by ID
async function getReservationById(reservationId) {
    try {
        const reservationDoc = await db.collection('reservations').doc(String(reservationId)).get();
        if (reservationDoc.exists) {
            // console.log(`Reservation data: `, reservationDoc.data());
            return `Reservation data: ` + String(reservationDoc.data());
        } else {
            // console.log(`No reservation found with ID: ${reservationId}`);
            return "This reservation does not exist";
        }
    } catch (error) {
        return `Error getting reservation with ID ${reservationId}: ` + String(error);
    }
}


// authenticate user
async function checkUserPassword(userId, userPassword) {
    try {
        const userDoc = await db.collection('users').doc(String(userId)).get();
        if (userDoc.exists) {
            if (userDoc.data().password !== String(userPassword)) {
                return "Access denied: wrong password.";
            } else {
                return "Success! Now User is logged in."
            }
        } else {
            return "Access denied: This user does not exist.";
        }
    } catch (error) {
        return `Error getting user with ID ${userId}: ` + String(error);
    }
}

// get a list of free tables for some


// we will use them in the logic-service
module.exports = {
    addTable,
    addUser,
    addReservation,
    updateTable,
    updateUser,
    updateReservation,
    deleteTable,
    deleteUser,
    deleteReservation,
    getTableById,
    getUserById,
    getReservationById,
    checkUserPassword,
};

