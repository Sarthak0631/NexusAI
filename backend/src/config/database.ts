import mongoose from "mongoose";

export async function connectDatabase(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error(
      "MONGODB_URI is not defined. Add it to backend/.env before starting."
    );
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error("MongoDB connection failed:", message);

    // Atlas answers a non-whitelisted IP by aborting the TLS handshake with
    // alert 80, which surfaces here as an opaque SSL error. Name the real
    // cause so this is not mistaken for a certificate problem.
    if (message.includes("SSL alert number 80")) {
      console.error(
        "This IP is very likely missing from the Atlas access list. " +
          "Add it under Atlas > Network Access, then restart the server."
      );
    }

    console.error(
      "Server will start anyway; routes that need the database will fail until it connects."
    );

    return false;
  }
}