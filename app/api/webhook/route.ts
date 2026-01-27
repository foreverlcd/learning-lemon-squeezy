import crypto from "crypto";

export async function POST(req: Request) {
    try {
        // Verifica la firma del webhook
        const cloneReq = req.clone();
        const eventType = cloneReq.headers.get("X-Event-Name");
        const body = await req.json();

        // Verificar la firma del webhook
        // IMPORTANTE: aqui se hace la logica de verificacion de la firma sea correcta o no
        // para asegurar que el webhook proviene de Lemon Squeezy
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE || "";
        const hmac = crypto.createHmac("sha256", secret);
        
        const digest = Buffer.from(
            hmac.update(JSON.stringify(body)).digest("hex"), "utf8"
        );
        const signature = Buffer.from(req.headers.get("X-Signature") || "", "utf8");

        if (!crypto.timingSafeEqual(digest, signature)) {
            throw new Error("Invalid webhook signature");
        };
        console.log("Webhook received:", body);


        // Logica segun el tipo de evento
        // se puede reemplazar con la logica que se necesite
        // si se tiene una base de datos, se puede actualizar el estado del pedido, etc.
        if (eventType === "order.created") {
            const userId = body.meta.custom_data.userId;
            const isSuccessful = body.data.attributes.status === "paid";
        }

        Response.json({ message: "Webhook processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        Response.json({ message: "Error processing webhook" }, { status: 400 });
    };
}