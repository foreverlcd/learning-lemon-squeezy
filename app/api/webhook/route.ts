import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // Obtener el cuerpo RAW
        const rawBody = await req.text();
        const eventType = req.headers.get("X-Event-Name");
        const signatureHeader = req.headers.get("X-Signature") || "";
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE || "";

        if (!secret || !signatureHeader) {
            console.error("Missing webhook signature secret or signature header");
            return Response.json({ message: "Invalid webhook signature" }, { status: 400 });
        }

        // Calcular HMAC usando el cuerpo RAW
        const hmac = crypto.createHmac("sha256", secret);
        const digest = hmac.update(rawBody).digest("hex");

        const digestBuf = Buffer.from(digest, "hex");
        const signatureBuf = Buffer.from(signatureHeader, "hex");

        console.log("Webhook debug:");
        console.log("- Secret length:", secret.length);
        console.log("- Signature header:", signatureHeader);
        console.log("- Computed digest:", digest);
        console.log("- Raw body length:", rawBody.length);

        if (digestBuf.length !== signatureBuf.length) {
            console.error("Invalid webhook signature length");
            return Response.json({ message: "Invalid webhook signature" }, { status: 400 });
        }

        // Comparar la firma
        if (!crypto.timingSafeEqual(digestBuf, signatureBuf)) {
            console.error("Invalid webhook signature");
            return Response.json({ message: "Invalid webhook signature" }, { status: 400 });
        }

        // Parsear el body solo después de verificar la firma
        const body = JSON.parse(rawBody);
        const eventId = body.meta?.webhook_id || `${body.data?.id}-${body.meta?.event_name}`;

        if (!eventId) {
            console.error("Missing webhook_id in webhook");
            return Response.json({ message: "Missing webhook_id" }, { status: 400 });
        }

        // Idempotency: check if event already processed
        const existingEvent = await prisma.webhookEvent.findUnique({
            where: { eventId },
        });

        if (existingEvent?.processed) {
            console.log(`Event ${eventId} already processed`);
            return Response.json({ message: "Event already processed" }, { status: 200 });
        }

        // Mark event as processed
        await prisma.webhookEvent.upsert({
            where: { eventId },
            update: { processed: true },
            create: {
                eventId,
                eventType: eventType || 'unknown',
                processed: true,
            },
        });

        // Lógica según el tipo de evento
        if (eventType === "order_created") {
            const customData = body.meta?.custom_data;
            const userId = customData?.user_id;
            const orderId = customData?.order_id;
            const tokensToGrant = customData?.tokens_to_grant;
            const orderStatus = body.data?.attributes?.status;

            console.log(`Processing order_created: userId=${userId}, orderId=${orderId}, status=${orderStatus}, tokens=${tokensToGrant}`);

            if (userId && orderId && orderStatus === "paid") {
                // Find the order in our database
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                });

                if (order && order.status === "pending") {
                    // Update order status
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { status: "paid" },
                    });

                    // Add tokens to user
                    await prisma.tokenBalance.upsert({
                        where: { userId },
                        update: {
                            tokens: {
                                increment: parseInt(tokensToGrant) || 100,
                            },
                        },
                        create: {
                            userId,
                            tokens: parseInt(tokensToGrant) || 100,
                        },
                    });

                    console.log(`Successfully granted ${tokensToGrant || 100} tokens to user ${userId}`);
                } else if (order && order.status === "paid") {
                    console.log(`Order ${orderId} already processed`);
                } else {
                    console.log(`Order ${orderId} not found or invalid status`);
                }
            }
        }

        return Response.json({ message: "Webhook processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return Response.json({ message: "Error processing webhook" }, { status: 400 });
    }
}