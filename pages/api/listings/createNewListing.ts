import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

async function createNewAd(adData: {
  userId: string;
  name: string;
  description: string;
  condition: string;
  price: number;
  location: string;
  tags: string[];
  canDeliver: boolean;
  categoryId: string;
  files: { path: string }[];
}) {
  const { userId, categoryId, files, tags, ...listingData } = adData;
  
  return await prisma.listing.create({
    data: {
      name: listingData.name,
      description: listingData.description,
      condition: listingData.condition,
      price: listingData.price,
      location: listingData.location,
      canDeliver: listingData.canDeliver,
      user: { connect: { id: userId } },
      category: { connect: { id: categoryId } },
      images: { create: files.map(file => ({ url: file.path })) },
      tags: { connect: tags.map(tagId => ({ id: tagId })) },
    },
  });
}

// POST '/api/listings/createNewListing'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: Session | null = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { streetAddress, city, province, postalCode, ...restBody } = req.body;

    const adData = {
      ...req.body,
      userId: user.id,
      price: parseInt(restBody.price, 10),
      location: `${streetAddress}, ${city}, ${province} ${postalCode}`,
      canDeliver: restBody.canDeliver === 'yes',
    };

    console.log("Data from server", adData);
    const newAd = await createNewAd(adData);

    res.status(201).json(newAd);
  } catch (error: any) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message });
  }
}
