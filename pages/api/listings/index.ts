import prisma from "@/utils/prisma";
import { Listing } from '@prisma/client'; // If you are using Prisma
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

// POST '/api/listings/'
export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: Session | null = await getServerSession(req, res, authOptions);

  if (session) {
    // POST '/api/listings/'
    if (req.method === "POST") {
      try {
        const userId = session.user?.id;
        console.log(userId);
        
        // Additional logic for creating a listing can go here

        res.status(201);
      } catch (error: any) {
        console.error("API error:", error);
        res.status(500).send({ error: error.message });
      }
    } else {
      res.setHeader("Allow", "POST");
      res.status(405).end("Method Not Allowed");
    }
  } else {
    res.status(401).send("401 - Not Authorized");
  }
}
