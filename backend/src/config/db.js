import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/sanket_db';
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Native MongoDB connection omitted or unreachable: (${error.message}). Operating with in-memory fallback active.`);
  }
};
