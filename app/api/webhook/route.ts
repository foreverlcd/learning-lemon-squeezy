import crypto from "crypto";

export async function POST(req: Request) {
    try {
        // Leer el rawBody de la request (Next.js App Router en Vercel)
        const rawBody = await getRawBody(req);
        const eventType = req.headers.get("X-Event-Name") || req.headers.get("x-event-name");
        const signatureHeader = req.headers.get("X-Signature") || req.headers.get("x-signature") || "";
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE || "";

        // Calcular HMAC usando el cuerpo RAW
        const hmac = crypto.createHmac("sha256", secret);
        const digest = hmac.update(rawBody).digest("hex");

        // Logs para depuración
        console.log("digest:", digest);
        console.log("signatureHeader:", signatureHeader);

        // Comparar la firma
        if (!crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signatureHeader, "hex"))) {
            console.error("Invalid webhook signature");
            return Response.json({ message: "Invalid webhook signature" }, { status: 400 });
        }

        // Parsear el body solo después de verificar la firma
        const body = JSON.parse(rawBody.toString());
        console.log(body);

        // Lógica según el tipo de evento
        if (eventType === "order_created") {
            const userId = body.meta?.custom_data?.user_id;
            const isSuccessful = body.data?.attributes?.status === "paid";
            // ... lógica adicional ...
        }

        return Response.json({ message: "Webhook processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return Response.json({ message: "Error processing webhook" }, { status: 400 });
    }
}

// Utilidad para obtener el rawBody en Next.js App Router
async function getRawBody(req: Request): Promise<Buffer> {
    const reader = req.body?.getReader();
    if (!reader) return Buffer.from("");
    const chunks = [];
    let done = false;
    while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (value) chunks.push(value);
        done = doneReading;
    }
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}