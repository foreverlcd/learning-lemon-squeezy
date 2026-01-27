import { lemonSqueezyApiInstance } from "@/utils/axios";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const reqData = await req.json();

    if (!reqData?.productId) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const response = await lemonSqueezyApiInstance.post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              user_id: "123", // Example custom data
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMON_SQUEEZY_STORE_ID!.toString(),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: reqData.productId.toString(),
            },
          },
        },
      },
    });

    const checkoutUrl = response.data.data.attributes.url;

    
    console.log(response.data);
    
    return Response.json({ checkoutUrl }, { status: 200 });
    
} catch (error) {
    console.error("Error creating checkout:", error);
    Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
