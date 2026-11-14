import React, { useState } from 'react';
import './landing.css';

const tools = [
  { icon: 'fa-cash-register', title: 'Point of sale', text: 'Record sales, take payments and issue receipts.' },
  { icon: 'fa-boxes-stacked', title: 'Products and stock', text: 'Organise products, prices and stock levels.' },
  { icon: 'fa-users', title: 'Customers', text: 'Keep customer records and track outstanding balances.' },
  { icon: 'fa-chart-column', title: 'Reports and expenses', text: 'Review business performance, costs and profit.' }
];

const plans = [
  { name: 'Basic', price: '40,000', period: 'per month', description: 'For small shops', items: ['Up to 300 products', 'Up to 300 customers', '90 days of reports'] },
  { name: 'Premium', price: '60,000', period: 'per month', description: 'For growing businesses', items: ['Unlimited products and customers', 'All-time reports', 'Business analytics'], featured: true },
  { name: 'Ultra', price: '600,000', period: 'per year', description: 'Annual Premium access', items: ['Everything in Premium', '12 months of access', 'Priority support'] }
];

function Brand() {
  return <a className="mz-brand" href="/" aria-label="Mauzobora home"><span className="mz-brand-mark">M</span><span className="mz-brand-name">mauzobora<small>SHOP MANAGEMENT</small></span></a>;
}

function ArrowLink({ href = '/app', children }) {
  return <a className="mz-arrow-link" href={href}>{children}<i className="fa-solid fa-arrow-right" aria-hidden="true" /></a>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return <div className="mz-site">
    <div className="mz-utility"><div className="mz-container"><span>Shop management for businesses in Tanzania</span><a href="https://wa.me/255621658007" target="_blank" rel="noreferrer"><i className="fa-brands fa-whatsapp" /> Contact support</a></div></div>
    <header className="mz-header">
      <div className="mz-container mz-header-inner">
        <Brand />
        <button className="mz-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i className={menuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} /></button>
        <nav className={menuOpen ? 'mz-nav mz-nav-open' : 'mz-nav'} aria-label="Main navigation">
          <a href="#overview" onClick={closeMenu}>Overview</a>
          <a href="#tools" onClick={closeMenu}>Tools</a>
          <a href="#pricing" onClick={closeMenu}>Pricing</a>
          <a href="#support" onClick={closeMenu}>Support</a>
          <a className="mz-nav-login" href="/app" onClick={closeMenu}>Sign in</a>
          <a className="mz-nav-start" href="/app" onClick={closeMenu}>Create account</a>
        </nav>
      </div>
    </header>

    <main>
      <section className="mz-hero" id="overview">
        <div className="mz-container mz-hero-inner">
          <div className="mz-breadcrumb"><span>Home</span><i className="fa-solid fa-chevron-right" /><b>Mauzobora</b></div>
          <div className="mz-hero-grid">
            <div className="mz-hero-copy">
              <span className="mz-eyebrow">A CLEARER WAY TO RUN YOUR SHOP</span>
              <h1>Manage your shop<br /><strong>with confidence.</strong></h1>
              <p>Keep sales, products, customers, expenses and reports together in one easy-to-use workspace.</p>
              <div className="mz-hero-actions"><a className="mz-primary-button" href="/app">Get started <i className="fa-solid fa-arrow-right" /></a><a className="mz-text-link" href="#tools">Explore features</a></div>
              <div className="mz-assurance"><i className="fa-solid fa-circle-check" /> Create an account and preview your dashboard for free.</div>
            </div>
            <aside className="mz-quick-panel" aria-label="Quick access">
              <div className="mz-panel-heading"><span>QUICK ACCESS</span><h2>What would you like to do?</h2></div>
              <a href="/app"><span className="mz-quick-icon"><i className="fa-solid fa-cart-shopping" /></span><span><b>Open your workspace</b><small>Go to your shop dashboard</small></span><i className="fa-solid fa-arrow-up-right-from-square mz-quick-arrow" /></a>
              <a href="#tools"><span className="mz-quick-icon"><i className="fa-solid fa-list-check" /></span><span><b>Explore shop tools</b><small>See what you can manage</small></span><i className="fa-solid fa-chevron-right mz-quick-arrow" /></a>
              <a href="#pricing"><span className="mz-quick-icon"><i className="fa-solid fa-tags" /></span><span><b>View plans and pricing</b><small>Find the right plan for your shop</small></span><i className="fa-solid fa-chevron-right mz-quick-arrow" /></a>
              <a href="https://wa.me/255621658007" target="_blank" rel="noreferrer"><span className="mz-quick-icon"><i className="fa-regular fa-circle-question" /></span><span><b>Get help</b><small>Talk to our support team</small></span><i className="fa-solid fa-arrow-up-right-from-square mz-quick-arrow" /></a>
            </aside>
          </div>
        </div>
      </section>

      <section className="mz-tools-section" id="tools">
        <div className="mz-container">
          <div className="mz-section-heading"><div><span className="mz-eyebrow">SHOP MANAGEMENT</span><h2>Explore Mauzobora</h2></div><p>Practical tools for the everyday work of running a business.</p></div>
          <div className="mz-tools-grid">{tools.map((tool, index) => <a className="mz-tool-card" href="/app" key={tool.title}><span className="mz-tool-number">0{index + 1}</span><span className="mz-tool-icon"><i className={'fa-solid ' + tool.icon} /></span><h3>{tool.title}</h3><p>{tool.text}</p><span className="mz-card-link">Explore tool <i className="fa-solid fa-arrow-right" /></span></a>)}</div>
        </div>
      </section>

      <section className="mz-pricing-section" id="pricing">
        <div className="mz-container">
          <div className="mz-section-heading"><div><span className="mz-eyebrow">PLANS AND PRICING</span><h2>Simple, clear pricing</h2></div><p>Start with a free account. Choose a paid plan when you are ready to use Mauzobora for your business.</p></div>
          <div className="mz-plans">{plans.map(plan => <article className={plan.featured ? 'mz-plan mz-plan-featured' : 'mz-plan'} key={plan.name}>
            {plan.featured && <span className="mz-plan-label">POPULAR PLAN</span>}
            <h3>{plan.name}</h3><p className="mz-plan-description">{plan.description}</p>
            <div className="mz-plan-price"><span>TSh</span> {plan.price}</div><div className="mz-plan-period">{plan.period}</div>
            <ul>{plan.items.map(item => <li key={item}><i className="fa-solid fa-check" />{item}</li>)}</ul>
            <a className={plan.featured ? 'mz-plan-button mz-plan-button-primary' : 'mz-plan-button'} href="/app">Choose {plan.name}</a>
          </article>)}</div>
          <p className="mz-pricing-note"><i className="fa-solid fa-circle-info" /> Registration and dashboard preview are free. Paid features activate after mobile-money payment is confirmed.</p>
        </div>
      </section>

      <section className="mz-support-section" id="support">
        <div className="mz-container mz-support-inner"><div><span className="mz-eyebrow">WE ARE HERE TO HELP</span><h2>Need help getting started?</h2><p>Contact the Mauzobora support team for assistance with your account or shop workspace.</p></div><div className="mz-support-actions"><a className="mz-primary-button" href="https://wa.me/255621658007" target="_blank" rel="noreferrer"><i className="fa-brands fa-whatsapp" /> WhatsApp support</a><a className="mz-support-phone" href="tel:+255621658007">+255 621 658 007</a></div></div>
      </section>
    </main>

    <footer className="mz-footer">
      <div className="mz-container">
        <div className="mz-footer-main">
          <div className="mz-footer-about"><Brand /><p>Sales, inventory and business management in one place.</p></div>
          <div><b>Explore</b><a href="#overview">Overview</a><a href="#tools">Shop tools</a><a href="#pricing">Pricing</a></div>
          <div><b>Account</b><a href="/app">Sign in</a><a href="/app">Create account</a></div>
          <div><b>Information</b><a href="/terms">Terms and conditions</a><a href="/privacy">Privacy policy</a><a href="mailto:support@mauzobora.co.tz">Email support</a></div>
        </div>
        <div className="mz-footer-bottom"><span>© {new Date().getFullYear()} Mauzobora. All rights reserved.</span><span>Made for businesses in Tanzania</span></div>
      </div>
    </footer>
  </div>;
}
