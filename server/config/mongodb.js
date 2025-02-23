import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {dbName: 'MERN-Auth'})
  .then(() => {
    console.log('Database connected')
  })
  .catch((e) => {
    console.log(`Error while db ${e}`)
  })
}

export default connectDB;