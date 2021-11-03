var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var ObjectId = require('mongodb').ObjectId;

module.exports = {
    addAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let adminData = { email: "rahulpr519@gmail.com", password: "123" }
            adminData.password = await bcrypt.hash(adminData.password, 10);
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                console.log(data);
                resolve(data.insertedId);
            })

        })

    },

    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failled");
                        resolve({ status: false })
                    }

                })
            } else {
                console.log("Also login failed");
                resolve({ status: false })
            }
        })
    }
}

