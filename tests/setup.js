import {MongoMemoryServer} from "mongodb-memory-server" ;
import mongoose from "mongoose";
import request from "supertest" ;
import jwt from 'jsonwebtoken' ;
import app from "../app";
import './helpers.js'; // Import to ensure global functions are available

let mongo;

beforeAll(async () => {
    // creating a instance of mongo db storage in memory 
    // then connecting to it , before running any test , this
    // function runs before any code inside our testing side of
    // of code

    mongo = await MongoMemoryServer.create() ;
    const mongoUri = mongo.getUri() ;
    await mongoose.connect(mongoUri) ;

    // Initialize test accounts for use in tests
    try {
        await global.createAccountsTobeUsed();
    } catch (error) {
        console.warn('Note: Test accounts creation optional for some tests:', error.message);
    }

}, 100000)


beforeEach(async () => {
    const collections = await mongoose.connection.db?.collections() ;
    // we might have a array of collections or undefiend so 
    // we typecheck and we loop on the colelctions we have and
    // we delete the collection
    if (collections?.length) {
        await Promise.all(collections.map(async (collection) => {
            await collection.deleteMany() ;
        }))
    }
})

afterAll(async () => {
    // we have to stop the mongo db instance in the memory after
    // we are finished with the testing
    await mongo.stop() ; // stops the mongo db insctance
    await mongoose.connection.close() ; // ends the mongoose connection 
})

