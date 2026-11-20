import { useEffect, useState } from "react";
import { CartPage, CheckoutPage } from "./components/pages/CartCheckoutPages";
import { CustomizePage } from "./components/pages/CustomizePage";
import { HomePage } from "./components/pages/HomePage";
import { MenuPage } from "./components/pages/MenuPage";
import {
  PaymentPage,
  SuccessPage,
} from "./components/pages/PaymentSuccessPages";
import { TrackPage } from "./components/pages/TrackPage";
import {
  initializeOrder,
  createLocalDemoOrder,
  verifyOrder,
} from "./services/orders";
import type {
  CustomerDetails,
  PlateSize,
  Protein,
  RiceType,
  Screen,
} from "./types";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [rice, setRice] = useState<RiceType>("Jollof Rice");
  const [plate, setPlate] = useState<PlateSize>("Medium");
  const [protein, setProtein] = useState<Protein>("Chicken");
  const [quantity, setQuantity] = useState(10);
  const [orderId, setOrderId] = useState("DMK-20251120-0042");
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: "Stephen Obiuwu",
    phone: "08012345678",
    email: "stephen@example.com",
    address: "123 Main Street, Abuja",
    deliveryDate: "Nov 20, 2025 · 12:00 PM",
    specialInstructions: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return;

    verifyOrder(reference)
      .then((order) => {
        setOrderId(order.orderId);
        setScreen("success");
      })
      .catch(() => setScreen("payment"));
  }, []);

  const handlePay = async () => {
    const demoOrder = await createLocalDemoOrder(customer);
    const result = await initializeOrder(demoOrder);
    setOrderId(result.orderId);
    window.location.assign(result.authorizationUrl);
  };

  return (
    <main
      className="min-h-screen bg-[#fff6ec] font-sans text-[#2a201b] min-[700px]:bg-[#fffdfa]"
    >
      {screen === "home" && (
        <HomePage
          screen={screen}
          onNavigate={setScreen}
          onSelectRice={setRice}
        />
      )}
      {screen === "menu" && (
        <MenuPage
          onNavigate={setScreen}
          onSelectRice={setRice}
        />
      )}
      {screen === "customize" && (
        <CustomizePage
          rice={rice}
          plate={plate}
          protein={protein}
          quantity={quantity}
          onNavigate={setScreen}
          onRiceChange={setRice}
          onPlateChange={setPlate}
          onProteinChange={setProtein}
          onQuantityChange={setQuantity}
        />
      )}
      {screen === "cart" && (
        <CartPage
          rice={rice}
          plate={plate}
          quantity={quantity}
          onNavigate={setScreen}
        />
      )}
      {screen === "checkout" && (
        <CheckoutPage
          customer={customer}
          onCustomerChange={setCustomer}
          onNavigate={setScreen}
        />
      )}
      {screen === "payment" && (
        <PaymentPage onNavigate={setScreen} onPay={handlePay} />
      )}
      {screen === "success" && (
        <SuccessPage orderId={orderId} onNavigate={setScreen} />
      )}
      {screen === "track" && (
        <TrackPage screen={screen} onNavigate={setScreen} />
      )}
    </main>
  );
}

export default App;
