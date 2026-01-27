"use client";

import axios from "axios";

const buyProduct1 = async () => {
  try {
    const response = await axios.post("/api/purchaseProduct", {
      productId: "1253426",
    });

    console.log ("Purchase response:", response.data);

    window.open(response.data.checkoutUrl, "_blank");


  } catch (error) {
    console.error("Error purchasing product:", error);
    alert("Failed to initiate purchase. Please try again later.");
  }
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <button onClick={buyProduct1} className="p-3 border border-white">
          Buy Product 1
        </button>
      </main>
    </div>
  );
}
