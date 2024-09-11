import prisma from "@/utils/prisma";
import { Listing } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

async function createNewAd(adData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const newAd = await prisma.listing.create({
      data: adData,
    });
    return newAd;
  } catch (error: any) {
    console.error("Error creating new ad:", error);
    throw new Error(`Failed to create new ad: ${error.message}`);
  }
}

// POST '/api/listings/createNewListing'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session: Session | null = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const adData = {
      userId: user.id,
      ...req.body,
      price: parseInt(req.body.price, 10),
      location: req.body.location, // Add this line
    };

    console.log("Data from server", adData);

    const newAd = await createNewAd(adData);

    res.status(201).json(newAd);
  } catch (error: any) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
