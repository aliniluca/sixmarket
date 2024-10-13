import prisma from "@/utils/prisma";
import { Listing } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

// Function to create a new ad
async function CreateNewAd(adData: Listing) {
  try {
    const newAd = await prisma.listing.create({
      data: adData,
    });
    return newAd;
  } catch (error: any) {
    console.error("Error creating new ad:", error);
    throw new Error(error);
  }
}

// Function to get user listings
async function getUserListings(userId: string) {
  try {
    const listings = await prisma.listing.findMany({
      where: { userId },
      include: { images: true },
    });

    // Sanitize images in listings to avoid issues with missing URLs
    const sanitizedListings = listings.map(listing => ({
      ...listing,
      images: listing.images.map(image => ({
        ...image,
        url: image.url || null,  // Ensure URL is not undefined
      })),
    }));

    return sanitizedListings;
  } catch (error: any) {
    console.error("Error fetching user listings:", error);
    throw new Error(error);
  }
}

// Handler for the API route
export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get session to check if the user is authenticated
    const session: Session | null = await getServerSession(req, res, authOptions);

    if (!session) {
      // If no session, return 401 Unauthorized
      return res.status(401).json({ error: "401 - Not Authorized" });
    }

    // Retrieve user ID from session
    // @ts-expect-error - By default, session.user doesn't have ID, added it using callbacks in next-auth
    const userId = session.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing in session." });
    }

    // Handle GET requests
    if (req.method === "GET") {
      try {
        // Fetch the user's listings
        const userListings = await getUserListings(userId);
        res.status(200).json(userListings);
      } catch (error: any) {
        console.error("API error:", error);
        res.status(500).json({ error: error.message });
      }
    }
    // Handle POST requests (create new listing)
    else if (req.method === "POST") {
      // You can implement the logic for POST requests here (creating a new listing)
      // Example placeholder:
      res.status(501).json({ message: "POST method not implemented yet." });
    } 
    // If method is neither GET nor POST, return Method Not Allowed
    else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error: any) {
    console.error("Unexpected error in handler:", error);
    res.status(500).json({ error: error.message });
  }
}
