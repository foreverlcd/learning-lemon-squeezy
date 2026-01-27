import crypto from "crypto";

export async function POST(req: Request) {
    try {
        // Obtener el cuerpo RAW
        const rawBody = await req.text();
        const eventType = req.headers.get("X-Event-Name");
        const signatureHeader = req.headers.get("X-Signature") || "";
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE || "";

        // Calcular HMAC usando el cuerpo RAW
        const hmac = crypto.createHmac("sha256", secret);
        const digest = hmac.update(rawBody).digest("hex");

        // Comparar la firma
        if (!crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signatureHeader, "hex"))) {
            console.error("Invalid webhook signature");
            return Response.json({ message: "Invalid webhook signature" }, { status: 400 });
        }

        // Parsear el body solo después de verificar la firma
        const body = JSON.parse(rawBody);
        console.log(body);

        // Lógica según el tipo de evento
        if (eventType === "order.created") {
            const userId = body.meta?.custom_data?.userId;
            const isSuccessful = body.data?.attributes?.status === "paid";
            // ... lógica adicional ...
        }

        return Response.json({ message: "Webhook processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return Response.json({ message: "Error processing webhook" }, { status: 400 });
    }
}   