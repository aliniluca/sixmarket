import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
  if (session) {
    // POST '/api/listings/'
    if (req.method === "POST") {
      console.log("sdfs");
      // @ts-expect-error - By default, session.user doesn't have ID. I added it using callbacks in `pages/api/auth/[...nextauth.ts]`
      const userId = session.user?.id;
      console.log(userId);
      try {
        // const adData = {
        //     userId,
        //     ...req.body,
        //     price: parseInt(req.body.price, 10),
        // };
        // console.log("Data from server", adData);
        // const newAd = await CreateNewAd(adData);
        const userId = session.user?.id;
        console.log(userId);
        
        // Additional logic for creating a listing can go here

        res.status(201);
      } catch (error: any) {
        console.error("API error:", error); // Add this line to log the error
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
