import { lemonSqueezyApiInstance } from "@/utils/axios";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { getSession } = await import("@/lib/auth");
    const user = await getSession(req);
    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const reqData = await req.json();

    if (!reqData?.productId) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Create a pending order first
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: reqData.productId,
        status: "pending",
        tokensToGrant: 100, // Example: 100 tokens per purchase
      },
    });

    const response = await lemonSqueezyApiInstance.post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              user_id: user.id,
              order_id: order.id,
              tokens_to_grant: "100",
            },
          },
          product_options: {
            name: "100 Tokens",
            description: "Compra de 100 tokens para la demo",
            redirect_url: process.env.NEXT_PUBLIC_APP_URL + "?subscription=true" ||  "http://localhost:3000?subscription=true",
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
    const lemonOrderId = response.data.data.id;

    // Update order with Lemon Squeezy order ID
    await prisma.order.update({
      where: { id: order.id },
      data: { lemonOrderId },
    });

    return Response.json({ checkoutUrl }, { status: 200 });
    
  } catch (error: unknown) {
    console.error("Error creating checkout:", error);
    if (axios.isAxiosError(error) && error.response?.data) {
      console.error("Lemon Squeezy API error:", error.response.data);
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
