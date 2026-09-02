import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";

dotenv.config();

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME;

if (!apiKey) {
  throw new Error("PINECONE_API_KEY is missing from backend/.env");
}

if (!indexName) {
  throw new Error("PINECONE_INDEX_NAME is missing from backend/.env");
}

const pinecone = new Pinecone({
  apiKey,
});

export function getPineconeIndex() {
  const validIndexName = process.env.PINECONE_INDEX_NAME;

  if (!validIndexName) {
    throw new Error("PINECONE_INDEX_NAME is missing from backend/.env");
  }

  return pinecone.index(validIndexName);
}

export async function listPineconeIndexes() {
  return await pinecone.listIndexes();
}