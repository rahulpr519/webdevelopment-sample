var db = require('../config/connection')
var collection=require('../config/collections')
var ObjectId=require('mongodb').ObjectId;
const { response } = require('express');
const { promise, reject } = require('bcrypt/promises');
const async = require('hbs/lib/async');


module.exports = {
    addProduct: (product, callback) => {

        db.get().collection('product').insertOne(product).then(function (data) {
            
            console.log(data);
            callback(data.insertedId)
        });


    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(prodId)}).then((response)=>{
                resolve(response)
            })

        })
    },

    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Category:proDetails.Category,
                    Price:proDetails.Price,
                    Description:proDetails.Description
                }
            }).then((response)=>{
                resolve()
            })
        })
    },

    getCategories:()=>{
        return new Promise(async(resolve,reject)=>{
            let category =await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            if(category){
                console.log(category);
                resolve(category)
            }else{
                reject('null collection')
            }
        })
    },
    addNewCategory:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne({category:category}).then((response)=>{
                if(response){
                    resolve(true)
                }else{
                    reject('category not added')
                }
            })
        })
    }
}