import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import { toast } from "react-toastify";
import { FiMapPin, FiUser, FiPhone, FiMail, FiCreditCard } from "react-icons/fi";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const customerId = user?._id || user?.id;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=Address, 2=Payment
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    fullName: user?.name?.first_name
      ? `${user.name.first_name} ${user.name.last_name}`
      : "",
    email: user?.email || "",
    phone: user?.mobile?.number || "",
    addressLine: "",
    city: "",
    emirate: "",
    country: "UAE",
    zipCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("tabby");

  // ─────────────────────────────────────────────────
  // Redirect if not logged in
  // ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !customerId) {
      navigate("/user/login");
    }
  }, [token, customerId]);

  // ─────────────────────────────────────────────────
  // Fetch Cart
  // ─────────────────────────────────────────────────
  useEffect(() => {
    if (!customerId) return;
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(
          `/products/cart/get?customerId=${customerId}`
        );
        const items = res?.data?.items || res?.items || [];
        if (items.length === 0) {
          toast.error("Your cart is empty");
          navigate("/ecommerce/cart");
          return;
        }
        setCartItems(items);
      } catch {
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [customerId]);

  // ─────────────────────────────────────────────────
  // Total
  // ─────────────────────────────────────────────────
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  // ─────────────────────────────────────────────────
  // Address validation
  // ─────────────────────────────────────────────────
  const validateAddress = () => {
    const required = ["fullName", "email", "phone", "addressLine", "city", "emirate"];
    for (let field of required) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  // ─────────────────────────────────────────────────
  // Place Order
  // ─────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
  await apiService.post(
    `/products/cart/cod?customerId=${customerId}`,
    { address }
  );
  toast.success("Order placed! Pay on delivery. 🎉");
  navigate("/ecommerce/payment/success");
}

      if (paymentMethod === "tabby") {
        // Tabby integration
        const res = await apiService.post("/products/cart/tabby-session", {
          customerId,
          address,
          amount: totalPrice,
          currency: "AED",
          items: cartItems.map((item) => ({
            title: item.productId?.name || "Product",
            quantity: item.quantity,
            unit_price: item.price,
            category: item.productId?.category?.name || "General",
          })),
          buyer: {
            name: address.fullName,
            email: address.email,
            phone: address.phone,
          },
        });
        // Redirect to Tabby checkout URL
        const tabbyUrl = res?.data?.checkout_url || res?.checkout_url;
        if (tabbyUrl) {
          window.location.href = tabbyUrl;
        } else {
          toast.error("Failed to initialize Tabby payment");
        }
        return;
      }

      if (paymentMethod === "tamara") {
        // Tamara integration
        const res = await apiService.post("/products/cart/tamara-session", {
          customerId,
          address,
          amount: totalPrice,
          currency: "AED",
          items: cartItems.map((item) => ({
            name: item.productId?.name || "Product",
            quantity: item.quantity,
            unit_price: item.price,
            type: "Physical",
          })),
          consumer: {
            first_name: address.fullName.split(" ")[0],
            last_name: address.fullName.split(" ")[1] || "",
            email: address.email,
            phone_number: address.phone,
          },
          shipping_address: {
            first_name: address.fullName.split(" ")[0],
            last_name: address.fullName.split(" ")[1] || "",
            line1: address.addressLine,
            city: address.city,
            country_code: "AE",
          },
        });
        const tamaraUrl = res?.data?.checkout_url || res?.checkout_url;
        if (tamaraUrl) {
          window.location.href = tamaraUrl;
        } else {
          toast.error("Failed to initialize Tamara payment");
        }
        return;
      }

    } catch (err) {
      toast.error(err?.message || "Order placement failed");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/ecommerce/cart")}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium mb-4 
                       flex items-center gap-1"
          >
            ← Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 font-semibold text-sm
            ${step >= 1 ? "text-purple-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
              ${step >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              1
            </div>
            Delivery Address
          </div>
          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={`h-full bg-purple-600 transition-all duration-300
              ${step >= 2 ? "w-full" : "w-0"}`} />
          </div>
          <div className={`flex items-center gap-2 font-semibold text-sm
            ${step >= 2 ? "text-purple-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
              ${step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              2
            </div>
            Payment
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left — Form */}
          <div className="flex-1">

            {/* STEP 1 — Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiMapPin className="text-purple-600" /> Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
                                   focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
                                   focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="+971 50 000 0000"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl 
                                   focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                      />
                    </div>
                  </div>

                  {/* Address Line */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line *
                    </label>
                    <input
                      type="text"
                      value={address.addressLine}
                      onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                      placeholder="Building, Street, Area"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                                 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Dubai"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                                 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>

                  {/* Emirate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emirate *
                    </label>
                    <select
                      value={address.emirate}
                      onChange={(e) => setAddress({ ...address, emirate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                                 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    >
                      <option value="">Select Emirate</option>
                      <option>Dubai</option>
                      <option>Abu Dhabi</option>
                      <option>Sharjah</option>
                      <option>Ajman</option>
                      <option>Ras Al Khaimah</option>
                      <option>Fujairah</option>
                      <option>Umm Al Quwain</option>
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={address.country}
                      disabled
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl 
                                 bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>

                  {/* ZIP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP / PO Box
                    </label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      placeholder="00000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl 
                                 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    />
                  </div>

                </div>

                <button
                  onClick={() => {
                    if (validateAddress()) setStep(2);
                  }}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white 
                             font-bold py-4 rounded-xl transition duration-200"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 2 — Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiCreditCard className="text-purple-600" /> Payment Method
                </h2>

                <div className="space-y-4">

                  {/* Tabby */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition
                    ${paymentMethod === "tabby"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"}`}
                  >
                    <input
                      type="radio"
                      value="tabby"
                      checked={paymentMethod === "tabby"}
                      onChange={() => setPaymentMethod("tabby")}
                      className="accent-purple-600"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-16 h-10 bg-green-500 rounded-lg flex items-center 
                                      justify-center text-white font-bold text-lg">
                        tabby
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Tabby — Buy Now, Pay Later</p>
                        <p className="text-xs text-gray-500">Split into 4 payments, 0% interest</p>
                      </div>
                    </div>
                  </label>

                  {/* Tamara */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition
                    ${paymentMethod === "tamara"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"}`}
                  >
                    <input
                      type="radio"
                      value="tamara"
                      checked={paymentMethod === "tamara"}
                      onChange={() => setPaymentMethod("tamara")}
                      className="accent-purple-600"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-16 h-10 bg-black rounded-lg flex items-center 
                                      justify-center text-white font-bold text-sm">
                        tamara
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Tamara — Pay in 3</p>
                        <p className="text-xs text-gray-500">Split into 3 easy payments</p>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition
                    ${paymentMethod === "cod"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"}`}
                  >
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-purple-600"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-16 h-10 bg-yellow-400 rounded-lg flex items-center 
                                      justify-center text-gray-900 font-bold text-xs text-center px-1">
                        💵 COD
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when your order arrives</p>
                      </div>
                    </div>
                  </label>

                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 
                               font-semibold py-4 rounded-xl transition duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white 
                               font-bold py-4 rounded-xl transition duration-200
                               disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    {placing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent 
                                        rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order — AED ${totalPrice.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item) => {
                  const image =
                    item.productColorId?.photos?.[0] ||
                    item.productId?.images?.[0] ||
                    null;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {image ? (
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.productId?.name}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                        AED {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>AED {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 pt-2 
                                border-t border-gray-100 text-lg">
                  <span>Total</span>
                  <span className="text-purple-600">AED {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Address Summary — Step 2 pe dikhao */}
              {step === 2 && address.addressLine && (
                <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-1">
                    📍 Delivering to:
                  </p>
                  <p className="text-xs text-gray-600">
                    {address.fullName}, {address.addressLine},<br />
                    {address.city}, {address.emirate}, {address.country}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;