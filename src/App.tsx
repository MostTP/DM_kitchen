"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AccountPage } from "./components/pages/AccountPage";
import { AdminPage } from "./components/pages/AdminPage";
import { AdminLoginPage } from "./components/pages/AdminLoginPage";
import { CartPage, CheckoutPage } from "./components/pages/CartCheckoutPages";
import { CustomizePage } from "./components/pages/CustomizePage";
import { HomePage } from "./components/pages/HomePage";
import { MenuPage } from "./components/pages/MenuPage";
import {
  PaymentPage,
  SuccessPage,
} from "./components/pages/PaymentSuccessPages";
import { buildCartItems, drinkItems, extraItems } from "./data/menu";
import { supabase } from "./lib/supabase";
import { getScreenFromPath, screenPaths } from "./lib/routes";
import {
  getAccountOrders,
  initializeOrder,
  createLocalDemoOrder,
  verifyOrder,
} from "./services/orders";
import type { AccountOrder } from "./services/orders";
import { PublicError, publicErrorMessage } from "./lib/errors";
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
  const [screen, setScreen] = useState<Screen>(() =>
    typeof window === "undefined" ? "home" : getScreenFromPath(window.location.pathname)
  );
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [accountResult, setAccountResult] = useState<{
    accessToken: string;
    refreshKey: number;
    orders: AccountOrder[];
    error: string;
  } | null>(null);
  const [refreshAccount, setRefreshAccount] = useState(0);
  const [rice, setRice] = useState<RiceType>("Jollof Rice");
  const [plate, setPlate] = useState<PlateSize>("Medium");
  const [proteinQuantities, setProteinQuantities] = useState<Record<Protein, number>>({
    Chicken: 10,
    Beef: 0,
  });
  const [extraQuantities, setExtraQuantities] = useState<Record<ExtraId, number>>({
    "extra-beef": 0,
    "extra-chicken": 0,
    "extra-plantain": 0,
    "extra-egg": 0,
  });
  const [drinkQuantities, setDrinkQuantities] = useState<Record<DrinkId, number>>({
    drink: 0,
    "table-water": 0,
  });
  const [orderId, setOrderId] = useState("");
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    deliveryDate: "",
    specialInstructions: "",
  });
  const activeScreen =
    !session && (screen === "checkout" || screen === "payment") ? "track" : screen;

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(() => {
      setScreen(getScreenFromPath(window.location.pathname));
    });
    const handlePopState = () => setScreen(getScreenFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      if (event === "SIGNED_IN") {
        const destination = sessionStorage.getItem("dmk-after-sign-in");
        sessionStorage.removeItem("dmk-after-sign-in");
        if (destination === "checkout" || destination === "track") {
          if (window.location.pathname !== screenPaths[destination]) {
            window.history.pushState({}, "", screenPaths[destination]);
          }
          setScreen(destination);
        }
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setAuthReady(true);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || session || (screen !== "checkout" && screen !== "payment")) return;
    sessionStorage.setItem("dmk-after-sign-in", "checkout");
    if (window.location.pathname !== screenPaths.track) {
      window.history.replaceState({}, "", screenPaths.track);
    }
  }, [authReady, screen, session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const refreshKey = refreshAccount;
    getAccountOrders(session.access_token)
      .then((result) => {
        if (active) setAccountResult({ ...result, accessToken: session.access_token, refreshKey, error: "" });
      })
      .catch((error: unknown) => {
        if (active) {
          setAccountResult({
            accessToken: session.access_token,
            refreshKey,
            orders: [],
            error: publicErrorMessage(error, "Unable to load your orders."),
          });
        }
      });
    return () => { active = false; };
  }, [session, refreshAccount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference || !session) return;

    verifyOrder(reference, session.access_token)
      .then((order) => {
        setOrderId(order.orderId);
        setRefreshAccount((current) => current + 1);
        setScreen("success");
      })
      .catch(() => setScreen("payment"));
  }, [session]);

  const cartItems = buildCartItems(rice, plate, proteinQuantities, extraQuantities, drinkQuantities);
  const subtotal = cartItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const orderTotal = subtotal + DELIVERY_FEE;

  const navigate = (nextScreen: Screen) => {
    if ((nextScreen === "checkout" || nextScreen === "payment") && !session) {
      sessionStorage.setItem("dmk-after-sign-in", "checkout");
      if (window.location.pathname !== screenPaths.track) {
        window.history.pushState({}, "", screenPaths.track);
      }
      setScreen("track");
      return;
    }
    if (nextScreen === "checkout" && session) {
      setCustomer((current) => ({
        ...current,
        fullName: current.fullName || String(session.user.user_metadata.full_name ?? ""),
      }));
    }
    if (window.location.pathname !== screenPaths[nextScreen]) {
      window.history.pushState({}, "", screenPaths[nextScreen]);
    }
    setScreen(nextScreen);
  };

  const handlePay = async () => {
    if (!session) throw new PublicError("Sign in to your account before placing an order.");
    const orderCustomer = { ...customer, email: session.user.email ?? customer.email };
    const demoOrder = await createLocalDemoOrder(orderCustomer, cartItems, DELIVERY_FEE);
    const result = await initializeOrder(demoOrder, session.access_token);
    setOrderId(result.orderId);
    window.location.assign(result.authorizationUrl);
  };

  return (
    <main
      className="min-h-screen bg-[#fff6ec] font-sans text-[#2a201b] min-[700px]:bg-[#fffdfa]"
    >
      {activeScreen === "home" && (
        <HomePage
          screen={activeScreen}
          onNavigate={navigate}
          onSelectRice={setRice}
          cartCount={cartCount}
        />
      )}
      {activeScreen === "menu" && (
        <MenuPage
          onNavigate={navigate}
          onSelectRice={setRice}
          cartCount={cartCount}
        />
      )}
      {activeScreen === "customize" && (
        <CustomizePage
          rice={rice}
          plate={plate}
          proteinQuantities={proteinQuantities}
          extraQuantities={extraQuantities}
          drinkQuantities={drinkQuantities}
          onNavigate={navigate}
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
      {activeScreen === "cart" && (
        <CartPage
          items={cartItems}
          deliveryFee={DELIVERY_FEE}
          onNavigate={navigate}
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
      {activeScreen === "checkout" && (
        <CheckoutPage
          customer={customer}
          receiptEmail={session?.user.email ?? ""}
          onCustomerChange={setCustomer}
          onNavigate={navigate}
        />
      )}
      {activeScreen === "payment" && (
        <PaymentPage total={orderTotal} onNavigate={navigate} onPay={handlePay} />
      )}
      {activeScreen === "success" && (
        <SuccessPage orderId={orderId} onNavigate={navigate} />
      )}
      {activeScreen === "track" && (
        <AccountPage
          session={session}
          orders={accountResult?.accessToken === session?.access_token ? accountResult?.orders ?? [] : []}
          loadingOrders={Boolean(
            session &&
            (accountResult?.accessToken !== session.access_token ||
              accountResult.refreshKey !== refreshAccount),
          )}
          accountError={accountResult?.accessToken === session?.access_token ? accountResult?.error ?? "" : ""}
          onNavigate={navigate}
          onRefresh={() => setRefreshAccount((current) => current + 1)}
          cartCount={cartCount}
        />
      )}
      {activeScreen === "admin" && (
        <AdminPage session={session} onNavigate={navigate} />
      )}
      {activeScreen === "admin-login" && (
        <AdminLoginPage onNavigate={navigate} />
      )}
    </main>
  );
}

export default App;
