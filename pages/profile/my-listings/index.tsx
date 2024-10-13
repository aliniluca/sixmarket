import HeadingSection from "@/components/layout/heading/HeadingSection";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import MyListingsTable from "@/components/tables/listings/MyListingsTable";
import { NextPageWithLayout } from "@/pages/page";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Image, Listing, Message } from "@prisma/client";
import { GetServerSideProps } from "next";
import Head from "next/head";

interface IMyListingsPageProps {
  listingsWithImages: (Pick<Listing, "id" | "name" | "price" | "views"> & {
    images: Image[];
    messages: Pick<Message, "id">[];
  })[];
}

// Fetching data server-side
export const getServerSideProps: GetServerSideProps = async (context: any) => {
  return requireAuthentication(context, async (session: any) => {
    const listingsWithImages: (Pick<
      Listing,
      "id" | "name" | "price" | "views"
    > & {
      images: Image[];
      messages: Pick<Message, "id">[];
    })[] = await prisma.listing.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        views: true,
        images: {
          take: 1,
        },
        messages: {
          select: {
            id: true,
          },
        },
      },
    });

    // Ensure each listing has an image URL or handle missing URLs
    const sanitizedListings = listingsWithImages.map((listing) => ({
      ...listing,
      images: listing.images.map((image) => ({
        ...image,
        url: image.url || null, // Set null if url is missing
      })),
    }));

    return {
      props: {
        listingsWithImages: JSON.parse(JSON.stringify(sanitizedListings)),
      },
    };
  });
};

// Main component for rendering the My Listings page
const MyListingsPage: NextPageWithLayout<IMyListingsPageProps> = ({
  listingsWithImages,
}) => {
  return (
    <>
      <Head>
        <title>{`My Listings | Marketplace`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="description" content="View and edit your listings." />
        <meta property="og:title" content={`My Listings | Marketplace`} />
        <meta property="og:description" content="View and edit your listings." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Marketplace" />
      </Head>

      <HeadingSection
        title="My listings"
        description={`You have ${listingsWithImages.length} active listings`}
      />

      <section>
        {/* Listings table */}
        <MyListingsTable listingsWithImages={listingsWithImages} />
      </section>
    </>
  );
};

// Wrap the page in the Primary Layout
MyListingsPage.getLayout = (page) => <PrimaryLayout>{page}</PrimaryLayout>;

export default MyListingsPage;
