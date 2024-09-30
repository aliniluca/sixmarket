import prisma from "@/utils/prisma";
import { Listing } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

async function CreateNewAd(adData: Listing) {
  try {
    const newAd = await prisma.listing.create({
      data: adData,
    });
    return newAd;
  } catch (error: any) {
    throw new Error(error);
  }
}
async function getUserListings(userId: string) {
  try {
    const listings = await prisma.listing.findMany({
      where: { userId },
      include: { images: true },
    });
    return listings;
  } catch (error: any) {
    throw new Error(error);
  }
}
// POST '/api/listings/'
export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: Session | null = await getServerSession(req, res, authOptions);

  if (session) {
    // GET '/api/listings/'
    if (req.method === "GET") {
      // @ts-expect-error - By default, session.user doesn't have ID. I added it using callbacks in `pages/api/auth/[...nextauth.ts]`
      const userId = session.user?.id;
      try {
        const userListings = await getUserListings(userId);
        res.status(200).json(userListings);
      } catch (error: any) {
        console.error("API error:", error);
        res.status(500).send({ error: error.message });
      }
    }
    // POST '/api/listings/'
    else if (req.method === "POST") {
      // ... (POST logic remains the same)
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end("Method Not Allowed");
    }
  } else {
    res.status(401).send("401 - Not Authorized");
  }
}
