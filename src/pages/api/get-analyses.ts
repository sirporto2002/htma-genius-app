import { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../../lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const db = admin.firestore();

    // Get all analyses for this user, ordered by creation date (newest first)
    const snapshot = await db
      .collection("analyses")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const analyses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return res.status(200).json({ analyses });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return res.status(500).json({
      error: "Failed to fetch analyses",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
