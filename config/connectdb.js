import mongoose from "mongoose";
const dbConn = async (DATABASE_URL)=>{
    try {
        const dbOption = {dbName: "schoolApi"}
        await mongoose.connect(DATABASE_URL, dbOption)
        console.log('connection success ful');
    } catch (error) {
        console.log(error);
    }
}

export default dbConn;