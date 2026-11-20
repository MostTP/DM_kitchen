import { useState } from 'react'
import './App.css'

type Screen = 'home' | 'menu' | 'customize' | 'cart' | 'checkout' | 'payment' | 'success' | 'track'

const riceImage = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85'
const foodImage = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=85'

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    cart: <><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.8a2 2 0 001.9-1.4L21 7H6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 7-7 8-7s7 2 8 7"/></>,
    back: <path d="M15 18l-6-6 6-6"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
    trash: <><path d="M3 6h18M8 6V3h8v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
    truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    bag: <><path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [rice, setRice] = useState('Jollof Rice')
  const [plate, setPlate] = useState('Medium')
  const [protein, setProtein] = useState('Chicken')
  const [quantity, setQuantity] = useState(10)
  const [cartQty] = useState(10)

  const renderHeader = ({ title, back = true }: { title?: string; back?: boolean }) => (
    <header className="app-header">
      {back ? <button className="icon-button" onClick={() => setScreen(screen === 'customize' ? 'menu' : screen === 'cart' ? 'menu' : 'home')}><Icon name="back" /></button> : <div className="brand-mark">D<span>✦</span></div>}
      {title && <h2>{title}</h2>}
      {back ? <button className="icon-button muted"><Icon name="search" /></button> : <button className="icon-button"><Icon name="menu" /></button>}
      <nav className="desktop-nav" aria-label="Main navigation">
        <button onClick={() => setScreen('home')}>Home</button>
        <button onClick={() => setScreen('menu')}>Our Menu</button>
        <button onClick={() => setScreen('track')}>Track Order</button>
        <button className="desktop-cart" onClick={() => setScreen('cart')}><Icon name="cart" /> Cart</button>
      </nav>
    </header>
  )

  const renderBottomNav = () => (
    <nav className="bottom-nav">
      <button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}><Icon name="home"/><span>Home</span></button>
      <button className={screen === 'menu' || screen === 'customize' ? 'active' : ''} onClick={() => setScreen('menu')}><Icon name="menu"/><span>Menu</span></button>
      <button className="nav-cart" onClick={() => setScreen('cart')}><span className="cart-badge">2</span><Icon name="cart"/><span>Cart</span></button>
      <button onClick={() => setScreen('track')}><Icon name="user"/><span>Account</span></button>
    </nav>
  )

  return (
    <main className="app-shell">
      {screen === 'home' && (
        <div className="screen home-screen">
          <header className="home-header">
            <div className="brand"><div className="brand-crown">♛</div><div><strong>DMK</strong><small>De_Mayor Kitchen</small></div></div>
            <nav className="desktop-nav" aria-label="Main navigation">
              <button className="active" onClick={() => setScreen('home')}>Home</button>
              <button onClick={() => setScreen('menu')}>Our Menu</button>
              <button onClick={() => setScreen('track')}>Track Order</button>
              <button className="desktop-cart" onClick={() => setScreen('cart')}><Icon name="cart" /> Cart</button>
            </nav>
            <button className="icon-button"><Icon name="menu" /></button>
          </header>
          <section className="hero-card">
            <div className="hero-copy"><p>Delicious. Fresh. Satisfying.</p><h1>De_Mayor<br/><b>Kitchen</b></h1><span>Your favourite meals,<br/>made with love</span><button onClick={() => setScreen('menu')}>Order Now <b>→</b></button></div>
          </section>
          <section className="menu-section">
            <div className="section-heading"><div><span className="eyebrow">FRESH FROM OUR KITCHEN</span><h2>Our Menu</h2><p>Choose from our delicious rice packages</p></div><button className="text-link" onClick={() => setScreen('menu')}>View full menu <b>→</b></button></div>
            <div className="featured-grid">
              <article className="food-card" onClick={() => setScreen('customize')}><img src={riceImage} alt="Jollof rice"/><h3>Jollof Rice</h3><p>Classic Nigerian jollof rice.</p><strong>From ₦2,500</strong><button>+</button></article>
              <article className="food-card" onClick={() => setScreen('customize')}><img src={foodImage} alt="Mixed rice"/><h3>Mixed Rice</h3><p>A perfect blend of jollof and fried rice.</p><strong>From ₦2,500</strong><button>+</button></article>
            </div>
          </section>
          <section className="why-dmk">
            <div><span className="why-icon">✦</span><strong>Made fresh daily</strong><small>Cooked with care, just for you.</small></div>
            <div><span className="why-icon">⌁</span><strong>Easy delivery</strong><small>Good food, brought to your door.</small></div>
            <div><span className="why-icon">♡</span><strong>Made for sharing</strong><small>Perfect for family and events.</small></div>
          </section>
          <section className="bulk-banner"><div className="truck-art"><Icon name="truck" size={34}/></div><div><strong>Feeding a crowd?</strong><span>Make your next gathering delicious.</span><small>Bulk orders for 50+ plates</small></div><button onClick={() => setScreen('menu')}>Plan your order <b>→</b></button></section>
          {renderBottomNav()}
        </div>
      )}

      {screen === 'menu' && (
        <div className="screen">
          {renderHeader({ title: 'Our Menu' })}
          <div className="menu-tabs"><button className="active">Rice Packages</button><button>Extras</button><button>Drinks</button></div>
          <section className="menu-list">
            <article className="menu-item" onClick={() => { setRice('Jollof Rice'); setScreen('customize') }}><img src={riceImage} alt="Jollof rice"/><div><h3>Jollof Rice</h3><p>Classic Nigerian jollof rice.</p><strong>From ₦2,500</strong></div><button>+</button></article>
            <article className="menu-item" onClick={() => { setRice('Mixed Rice'); setScreen('customize') }}><img src={foodImage} alt="Mixed rice"/><div><h3>Mixed Rice</h3><p>A perfect blend of jollof and fried rice.</p><strong>From ₦2,500</strong></div><button>+</button></article>
          </section>
          {renderBottomNav()}
        </div>
      )}

      {screen === 'customize' && (
        <div className="screen customize-screen">
          {renderHeader({ title: 'Customise Order' })}
          <div className="custom-scroll">
            <section className="step-block"><h3><b>1.</b> Choose Rice Type</h3><div className="rice-options"><button className={rice === 'Jollof Rice' ? 'selected' : ''} onClick={() => setRice('Jollof Rice')}><img src={riceImage} alt=""/><strong>Jollof Rice</strong></button><button className={rice === 'Mixed Rice' ? 'selected' : ''} onClick={() => setRice('Mixed Rice')}><img src={foodImage} alt=""/><strong>Mixed Rice</strong></button></div></section>
            <section className="step-block"><h3><b>2.</b> Select Plate Size</h3><div className="plate-options"><button className={plate === 'Medium' ? 'selected' : ''} onClick={() => setPlate('Medium')}><img src={riceImage} alt=""/><strong>Medium Plate</strong><span>₦2,500</span></button><button className={plate === 'Big' ? 'selected' : ''} onClick={() => setPlate('Big')}><img src={foodImage} alt=""/><strong>Big Plate</strong><span>₦3,500</span></button></div></section>
            <section className="step-block"><h3><b>3.</b> Choose Protein</h3><div className="protein-row"><div className="protein-icon">🍗</div><div><strong>{protein}</strong><small>Quantity: {quantity}</small></div><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity-1))}>−</button><b>{quantity}</b><button onClick={() => setQuantity(quantity+1)}>+</button></div></div><div className="protein-row"><div className="protein-icon">🥩</div><div><strong>Beef</strong><small>Quantity: {quantity}</small></div><div className="quantity"><button onClick={() => setProtein('Beef')}>−</button><b>{protein === 'Beef' ? quantity : 0}</b><button onClick={() => setProtein('Beef')}>+</button></div></div></section>
          </div>
          <button className="primary-fixed" onClick={() => setScreen('cart')}>Add to Cart <b>→</b></button>
        </div>
      )}

      {screen === 'cart' && (
        <div className="screen">{renderHeader({ title: 'Your Cart' })}<div className="cart-list"><div className="cart-item"><img src={riceImage} alt=""/><div><strong>{rice}</strong><small>{plate} Plate<br/>Chicken · {cartQty} plates</small><b>₦25,000</b></div><button className="trash"><Icon name="trash" size={17}/></button></div><div className="cart-item"><img src={riceImage} alt=""/><div><strong>{rice}</strong><small>{plate} Plate<br/>Beef · {cartQty} plates</small><b>₦25,000</b></div><button className="trash"><Icon name="trash" size={17}/></button></div><div className="cart-item"><div className="drink-can">🥤</div><div><strong>Pepsi</strong><small>10 units</small><b>₦4,000</b></div><button className="trash"><Icon name="trash" size={17}/></button></div></div><div className="cart-summary"><div><span>Subtotal</span><strong>₦54,000</strong></div><div><span>Delivery Fee</span><strong>₦1,000</strong></div><div className="total-row"><span>Total</span><b>₦55,000</b></div></div><button className="primary-fixed" onClick={() => setScreen('checkout')}>Proceed to Checkout <b>→</b></button></div>
      )}

      {screen === 'checkout' && (
        <div className="screen">{renderHeader({ title: 'Checkout' })}<form className="checkout-form"><div className="delivery-toggle"><button type="button" className="active"><Icon name="truck"/> Delivery</button><button type="button"><Icon name="bag"/> Collection</button></div><h3>Customer Details</h3><label>Full Name<input defaultValue="Stephen Obiuwu"/></label><div className="field-icon"><span>☎</span><label>Phone Number<input defaultValue="08012345678"/></label></div><div className="field-icon"><span>✉</span><label>Email Address<input defaultValue="stephen@example.com"/></label></div><div className="field-icon"><span>⌖</span><label>Delivery Address<input defaultValue="123 Main Street, Abuja"/></label></div><div className="field-icon"><span>▣</span><label>Date & Time<input defaultValue="Nov 20, 2025 · 12:00 PM"/></label></div><label>Special Instructions (Optional)<textarea placeholder="Ring the bell, please." /></label></form><button className="primary-fixed" onClick={() => setScreen('payment')}>Continue to Payment <b>→</b></button></div>
      )}

      {screen === 'payment' && (
        <div className="screen">{renderHeader({ title: 'Payment' })}<div className="payment-amount"><span>Amount to Pay</span><strong>₦55,000</strong></div><h3 className="payment-title">Choose Payment Method</h3><div className="payment-methods"><button className="selected"><span className="pay-icon">◉</span><strong>Card Payment</strong><span className="visa">VISA</span><span className="radio">✓</span></button><button><span className="pay-icon">▥</span><strong>Bank Transfer</strong></button><button><span className="pay-icon">◉</span><strong>Pay with Paystack</strong></button></div><div className="secure-note">🔒 Your payment is secure and encrypted</div><button className="primary-fixed" onClick={() => setScreen('success')}>Pay Now <b>→</b></button></div>
      )}

      {screen === 'success' && (
        <div className="screen success-screen">{renderHeader({ back: false })}<div className="success-content"><div className="confetti">✦ • ✦ • ✦</div><div className="success-mark">✓</div><h1>Order Placed<br/>Successfully!</h1><p>Your Order ID is:</p><strong className="order-id">DMK-20251120-0042</strong><div className="qr-code"><div className="qr-inner">▦</div></div><small>Scan this QR code</small><button className="primary" onClick={() => setScreen('track')}>Track My Order <b>→</b></button><button className="home-link" onClick={() => setScreen('home')}>Back to Home</button></div></div>
      )}

      {screen === 'track' && (
        <div className="screen">{renderHeader({ title: 'Track Your Order' })}<div className="tracking-search"><input defaultValue="Enter Order ID (e.g. DMK-20251120-0042)"/><button><Icon name="search"/></button></div><div className="track-status"><div className="track-head"><span><b>✓</b></span><span><b>✓</b></span><span><b>✓</b></span><span></span></div><div className="track-labels"><div><strong>Order ID<br/>Received</strong></div><div><strong>Confirmed</strong></div><div><strong>Preparing<br/>Your Order</strong></div><div><strong>Out for<br/>Delivery</strong></div></div></div><div className="rider-card"><div className="rider-art">🛵</div><strong>Order is being prepared!</strong><p>We’ll notify you once it’s out for delivery.</p></div>{renderBottomNav()}</div>
      )}
    </main>
  )
}

export default App
