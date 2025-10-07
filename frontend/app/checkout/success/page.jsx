  "use client";

  import { useEffect, useContext, useState } from "react";
  import { CartContext } from "../../context/CartContext";
  import { useSearchParams, useRouter } from "next/navigation";
  import axios from "axios";

  export default function Success() {
    const { clearCart } = useContext(CartContext);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);

    useEffect(() => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setError("No session ID found in URL.");
        setLoading(false);
        return;
      }

      const confirmOrder = async () => {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/confirm`,
            { sessionId }
          );

          if (res.data?.order) {
            setOrder(res.data.order);
            clearCart(); // clear cart after successful order
          } else {
            setError(res.data?.error || "Failed to confirm order");
          }
        } catch (err) {
          console.error("Error confirming order:", err.response?.data || err.message);
          setError(err.response?.data?.error || "Error confirming order");
        } finally {
          setLoading(false);
        }
      };

      confirmOrder();
    }, [searchParams, clearCart]);

    if (loading) return <p className="p-6">Processing your order...</p>;

    if (error)
      return (
        <div className="p-6 text-red-500">
          <h1 className="text-2xl font-bold">Oops!</h1>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => router.push("/")}
          >
            Go Home
          </button>
        </div>
      );

    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="mb-4">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }
