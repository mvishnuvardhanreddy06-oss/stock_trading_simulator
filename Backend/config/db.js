import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.DB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stock_trading_simulator";
  mongoose.set("strictQuery", true);
  const options = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000
  };

  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, options);
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`,
        err && err.message ? err.message : err);

      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`Retrying MongoDB connection in ${backoff}ms...`);
        await new Promise((res) => setTimeout(res, backoff));
        continue;
      }

      // last attempt failed
      console.error("MongoDB connection failed after retries:", err);
      if (uri.startsWith("mongodb+srv://")) {
        console.error("Atlas connection issue detected. Verify Atlas network access, user credentials, and that your environment allows outbound TLS on port 27017.");
      }
      throw err;
    }
  }
}
