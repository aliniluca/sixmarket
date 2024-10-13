import prisma from "@utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: true,
      images: true, // assuming images is an array of image objects
      category: true,
      favorites: true,
      tags: true,
      messages: true,
    },
  });

  // Check if listing has images and sanitize the images array
  if (listing?.images) {
    listing.images = listing.images.map(image => ({
      ...image,
      url: image.url || null, // Fallback if url is missing
    }));
  }

  return listing;
}

export default async function Handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const id: string = req.query.id as string;

    if (!id) {
      return res.status(400).send("Missing id parameter in the request.");
    }

    try {
      const listingInfo = await getListing(id);

      if (!listingInfo) {
        return res.status(404).json({ error: "Listing not found." });
      }

      return res.status(200).json(listingInfo);
    } catch (error) {
      return res.status(500).json({ message: "An error occurred.", error: error.message });
    }
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method not allowed. Use 'GET' instead.");
  }
}
