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
import { buildCartItems, drinkItems, extraItems } from "./data/menu";
import {
  initializeOrder,
  createLocalDemoOrder,
  verifyOrder,
} from "./services/orders";
import type {
  CustomerDetails,
  DrinkId,
  ExtraId,
  PlateSize,
  Protein,
  RiceType,
  Screen,
  CartItem,
} from "./types";

const DELIVERY_FEE = 1000;

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [rice, setRice] = useState<RiceType>("Jollof Rice");
  const [plate, setPlate] = useState<PlateSize>("Medium");
  const [proteinQuantities, setProteinQuantities] = useState<Record<Protein, number>>({
    Chicken: 10,
    Beef: 0,
  });
  const [extraQuantities, setExtraQuantities] = useState<Record<ExtraId, number>>({
    "extra-beef": 0,
    "extra-chicken": 0,
  });
  const [drinkQuantities, setDrinkQuantities] = useState<Record<DrinkId, number>>({
    pepsi: 0,
  });
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

  const cartItems = buildCartItems(rice, plate, proteinQuantities, extraQuantities, drinkQuantities);
  const subtotal = cartItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const orderTotal = subtotal + DELIVERY_FEE;

  const handlePay = async () => {
    const demoOrder = await createLocalDemoOrder(customer, cartItems, DELIVERY_FEE);
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
          cartCount={cartCount}
        />
      )}
      {screen === "menu" && (
        <MenuPage
          onNavigate={setScreen}
          onSelectRice={setRice}
          cartCount={cartCount}
        />
      )}
      {screen === "customize" && (
        <CustomizePage
          rice={rice}
          plate={plate}
          proteinQuantities={proteinQuantities}
          extraQuantities={extraQuantities}
          drinkQuantities={drinkQuantities}
          onNavigate={setScreen}
          onPlateChange={setPlate}
          onProteinQuantityChange={(protein, quantity) =>
            setProteinQuantities((current) => ({ ...current, [protein]: quantity }))
          }
          onExtraQuantityChange={(id, quantity) =>
            setExtraQuantities((current) => ({ ...current, [id]: quantity }))
          }
          onDrinkQuantityChange={(id, quantity) =>
            setDrinkQuantities((current) => ({ ...current, [id]: quantity }))
          }
          cartCount={cartCount}
        />
      )}
      {screen === "cart" && (
        <CartPage
          items={cartItems}
          deliveryFee={DELIVERY_FEE}
          onNavigate={setScreen}
          onItemQuantityChange={(item: CartItem, quantity: number) => {
            if (item.id === "rice-chicken" || item.id === "rice-beef") {
              const protein = item.id === "rice-chicken" ? "Chicken" : "Beef";
              setProteinQuantities((current) => ({ ...current, [protein]: quantity }));
              return;
            }
            const extra = extraItems.find((candidate) => candidate.id === item.id);
            if (extra) {
              setExtraQuantities((current) => ({ ...current, [extra.id]: quantity }));
              return;
            }
            const drink = drinkItems.find((candidate) => candidate.id === item.id);
            if (drink) setDrinkQuantities((current) => ({ ...current, [drink.id]: quantity }));
          }}
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
        <PaymentPage total={orderTotal} onNavigate={setScreen} onPay={handlePay} />
      )}
      {screen === "success" && (
        <SuccessPage orderId={orderId} onNavigate={setScreen} />
      )}
      {screen === "track" && (
        <TrackPage screen={screen} onNavigate={setScreen} cartCount={cartCount} />
      )}
    </main>
  );
}

export default App;
