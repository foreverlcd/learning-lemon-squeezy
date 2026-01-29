# Demo de Pagos Únicos con Lemon Squeezy

Proyecto Next.js que implementa un flujo completo de pagos únicos con Lemon Squeezy, incluyendo autenticación, base de datos y webhooks.

## Características

- ✅ Login simple por email
- ✅ Base de datos con Prisma (SQLite)
- ✅ Página de compra de tokens
- ✅ Checkout de Lemon Squeezy
- ✅ Webhook con verificación de firma
- ✅ Idempotencia en webhooks
- ✅ Redirección post-pago
- ✅ Suma automática de tokens

## Setup

1. Instalar dependencias:
```bash
pnpm install
```


2. Configurar variables de entorno en `.env.public` (ejemplo real) -> .env + variables reales:
```env
LEMON_SQUEEZY_API_KEY=mi-clave-api-segura
LEMON_SQUEEZY_STORE_ID=id-de-mi-tienda
LEMON_SQUEEZY_WEBHOOK_SIGNATURE=mi-clave-de-webhook-seguro
NEXT+PUBLIC_APP_URL=https://mi-link-de-produccion.com
```

3. Inicializar base de datos:
```bash
pnpm db:push
pnpm db:generate
```

4. Iniciar desarrollo:
```bash
pnpm dev
```


## Redireccionamiento en Lemon Squeezy

Al crear el checkout, puedes definir la URL de redirección usando el parámetro `redirect_url` en `product_options`:

```js
product_options: {
	name: "100 Tokens",
	description: "Compra de 100 tokens para la demo",
	redirect_url: process.env.NEXT_PUBLIC_APP_URL + "/success" ||  "http://localhost:3000/success",
},
```

Esto hará que, tras el pago, el usuario sea enviado automáticamente a la URL que definas.

---
## Flujo

1. **Login**: Usuario ingresa email → se crea sesión
2. **Compra**: Usuario hace clic en "Comprar Tokens" → se crea Order pendiente → se redirige a Lemon Squeezy
3. **Pago**: Usuario paga en Lemon Squeezy → webhook llega a `/api/webhook`
4. **Webhook**: Verifica firma → actualiza Order a "paid" → suma tokens al usuario (idempotente)
5. **Redirección**: Usuario vuelve a `/success` donde ve tokens actualizados

## Endpoints

- `POST /api/auth/login` - Login por email
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/purchaseProduct` - Crear checkout
- `POST /api/webhook` - Webhook de Lemon Squeezy

## Páginas

- `/` - Home (login o dashboard)
- `/login` - Login
- `/payment` - Página de compra
- `/success` - Página de éxito post-pago

## Base de Datos

- `User` - Usuarios
- `TokenBalance` - Balance de tokens por usuario
- `Order` - Órdenes de compra
- `WebhookEvent` - Eventos procesados (idempotencia)

## Notas

- Los tokens se suman únicamente cuando el webhook confirma pago (`status: "paid"`)
- El webhook es idempotente: eventos duplicados no suman tokens dos veces
- La sesión es simple (cookie con user.id) para demo; producción usar JWT seguro
