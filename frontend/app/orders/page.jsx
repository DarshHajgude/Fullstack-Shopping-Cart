"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const statusClass = (s) => {
  switch ((s || '').toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'shipped': return 'bg-blue-100 text-blue-800';
    case 'delivered': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push('/login?redirect=/orders');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (loading) return <p className="p-6">Loading orders…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  if (!orders.length) return <p className="p-6">No orders found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border rounded p-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold">Order ID: <span className="font-mono text-sm">{order._id}</span></p>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`px-2 py-1 text-sm rounded ${statusClass(order.status)}`}>{order.status}</span>
                  <span className="text-sm text-gray-600">Total: {currency.format(order.totalAmount || 0)}</span>
                  <span className="text-sm text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</span>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Products</h4>
                  <ul className="space-y-3">
                    {order.products.map((p) => {
                      const prod = p.product || {};
                      const name = prod?.name || prod || 'Unknown product';
                      const img = prod?.images?.[0] || prod?.image || '/public/file.svg';
                      const unit = typeof prod?.price === 'number' ? currency.format(prod.price) : '—';
                      const subtotal = (typeof prod?.price === 'number') ? currency.format((prod.price || 0) * (p.quantity || 1)) : '—';
                      return (
                        <li key={p._id || p.product} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={img} alt={name} width={64} height={48} className="object-cover rounded" />
                            <div>
                              <div className="font-medium">{name}</div>
                              <div className="text-sm text-gray-500">{unit} × {p.quantity}</div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-700 font-semibold">{subtotal}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="w-64 shrink-0 ml-4 text-sm text-gray-700">
                <p className="mb-2">Payment ID:</p>
                <pre className="bg-gray-100 p-2 rounded text-xs break-words">{order.paymentId || '—'}</pre>
                <div className="mt-3">
                  <p>Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                  {order.paidAt && <p>Paid: {new Date(order.paidAt).toLocaleString()}</p>}
                  {order.packedAt && <p>Packed: {new Date(order.packedAt).toLocaleString()}</p>}
                  {order.dispatchedAt && <p>Dispatched: {new Date(order.dispatchedAt).toLocaleString()}</p>}
                  {order.deliveredAt && <p>Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
