import prisma from "@/utils/prisma";
import { Listing } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

async function createNewAd(adData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'> & { 
  userId: string, 
  files: { path: string }[],
  tags: string[],
  canDeliver: string | boolean
}) {
  try {
    const { userId, categoryId, files, tags, canDeliver, ...restAdData } = adData;
    const newAd = await prisma.listing.create({
      data: {
        ...restAdData,
        user: {
          connect: { id: userId }
        },
        category: {
          connect: { id: categoryId }
        },
        images: {
          create: files.map(file => ({ url: file.path }))
        },
        tags: {
          connect: tags.map(tagId => ({ id: tagId }))
        },
        canDeliver: typeof canDeliver === 'string' ? canDeliver === 'yes' : canDeliver,
      },
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
  ...req.body,
  price: parseInt(req.body.price, 10),
  userId: user.id,
  location: req.body.location || `${req.body.city}, ${req.body.province}`,
  tags: req.body.tags || [], // Ensure tags are passed, default to empty array if not present
};

console.log("Data from server", adData);
const newAd = await createNewAd(adData);
    res.status(201).json(newAd);
  } catch (error: any) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
