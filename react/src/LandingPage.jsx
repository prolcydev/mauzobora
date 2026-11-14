import React from 'react';
import './landing.css';

const features = [
  { icon: 'fa-cash-register', title: 'Fast point of sale', text: 'Build a cart, take payment and print receipts.' },
  { icon: 'fa-boxes-stacked', title: 'Stock control', text: 'Manage products, prices and low-stock items.' },
  { icon: 'fa-chart-line', title: 'Sales & profit reports', text: 'See sales, costs and expenses in one view.' },
  { icon: 'fa-users', title: 'Customer records', text: 'Keep customer details and balances organised.' }
];

const plans = [
  { name: 'Basic', price: '40,000', period: '/ month', detail: 'For small shops getting organised', features: ['Up to 300 products', 'Up to 300 customers', '90 days of reports'] },
  { name: 'Premium', price: '60,000', period: '/ month', detail: 'For growing businesses', popular: true, features: ['Unlimited products & customers', 'All-time reports', 'Business analytics'] },
  { name: 'Ultra', price: '600,000', period: '/ year', detail: 'One year of Premium access', features: ['Everything in Premium', '12 months of access', 'Priority support'] }
];

function Brand() {
  return <a className="mz-brand" href="/" aria-label="Mauzobora home"><span className="mz-brand-icon">M</span><span>Mauzobora<small>SHOP MANAGEMENT</small></span></a>;
}

function DashboardMockup() {
  return <div className="mz-dashboard">
    <div className="mz-dash-top"><span className="mz-dash-logo">M</span><b>Business overview</b><span className="mz-dash-status"><i/> Your shop at a glance</span></div>
    <div className="mz-dash-welcome"><div><small>MONDAY, 14 NOVEMBER</small><h3>Good morning 👋</h3><p>Here is what is happening in your shop.</p></div><span className="mz-dash-avatar">D</span></div>
    <div className="mz-metrics"><div className="mz-metric mz-metric-featured"><small>Today's sales</small><b>TSh 482,500</b><span><i className="fa-solid fa-arrow-trend-up"/> Sales overview</span></div><div className="mz-metric"><small>Transactions</small><b>28</b><span>Today's orders</span></div><div className="mz-metric"><small>Low stock</small><b>04</b><span>Need attention</span></div></div>
    <div className="mz-dash-bottom"><div className="mz-mini-chart"><div><b>Sales activity</b><span>Last 7 days</span></div><div className="mz-chart-bars">{[34,55,43,70,50,90,67].map((n,i)=><i key={i} style={{height:n+'%'}}/>)}</div><div className="mz-chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div><div className="mz-mini-stock"><b>Stock watch</b><div><i/> Rice 2kg <strong>86</strong></div><div><i className="mz-orange-dot"/> Sugar 1kg <strong>4 left</strong></div><div><i/> Cooking oil <strong>42</strong></div></div></div>
    <div className="mz-dash-caption"><i className="fa-solid fa-shield-halved"/> A clearer picture of your business, every day.</div>
  </div>;
}

export default function LandingPage() {
  return <div className="mz-site">
    <div className="mz-topline"><div className="mz-wrap"><span>Simple shop management, built for Tanzania</span><a href="https://wa.me/255621658007" target="_blank" rel="noreferrer"><i className="fa-brands fa-whatsapp"/> Need help? Chat with us</a></div></div>
    <header className="mz-header"><div className="mz-wrap mz-nav"><Brand/><nav><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#contact">Contact</a></nav><div className="mz-nav-actions"><a className="mz-signin" href="/app">Sign in</a><a className="mz-button mz-button-dark" href="/app">Get started <i className="fa-solid fa-arrow-right"/></a></div></div></header>
    <main>
      <section className="mz-hero"><div className="mz-wrap mz-hero-grid"><div className="mz-hero-copy"><div className="mz-kicker"><span/> YOUR SHOP. ONE SMART WORKSPACE.</div><h1>Run your shop.<br/><em>Stay in control.</em></h1><p className="mz-hero-lead">Sales, stock, customers and expenses — all organised in one simple system. Spend less time counting and more time growing your business.</p><div className="mz-hero-actions"><a className="mz-button mz-button-dark mz-button-large" href="/app">Create your free account <i className="fa-solid fa-arrow-right"/></a><a className="mz-watch-link" href="#features">See what you can do <i className="fa-solid fa-arrow-down"/></a></div><div className="mz-proof"><span><i className="fa-solid fa-check"/> Free account & dashboard preview</span><span><i className="fa-solid fa-check"/> Works on phone and computer</span></div></div><div className="mz-hero-art"><div className="mz-art-orb"/><DashboardMockup/><div className="mz-floating-note"><span><i className="fa-solid fa-chart-pie"/></span><div><small>Business insight</small><b>Know your numbers</b></div></div></div></div></section>
      <section className="mz-benefit-strip"><div className="mz-wrap"><span>EVERYTHING CONNECTED</span><b><i className="fa-solid fa-cash-register"/> Sales</b><b><i className="fa-solid fa-boxes-stacked"/> Inventory</b><b><i className="fa-solid fa-users"/> Customers</b><b><i className="fa-solid fa-chart-column"/> Reports</b></div></section>
      <section className="mz-section" id="features"><div className="mz-wrap"><div className="mz-section-head"><div><div className="mz-kicker"><span/> MADE FOR DAILY BUSINESS</div><h2>Everything your shop needs.<br/><em>Nothing you don't.</em></h2></div><p>Keep everyday operations simple with practical tools that work together.</p></div><div className="mz-feature-grid">{features.map((f,i)=><article className="mz-feature" key={f.title}><span className="mz-feature-icon"><i className={'fa-solid '+f.icon}/></span><small>0{i+1}</small><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></div></section>
      <section className="mz-pricing" id="pricing"><div className="mz-wrap"><div className="mz-section-head"><div><div className="mz-kicker"><span/> STRAIGHTFORWARD PLANS</div><h2>Start simple.<br/><em>Grow with confidence.</em></h2></div><p>Create an account and preview your dashboard for free. Choose a paid plan when you are ready to operate your shop.</p></div><div className="mz-price-grid">{plans.map(p=><article key={p.name} className={p.popular?'mz-price-card mz-price-best':'mz-price-card'}>{p.popular&&<span className="mz-best-label">MOST POPULAR</span>}<h3>{p.name}</h3><p>{p.detail}</p><div className="mz-price"><span>TSh</span> {p.price}<small>{p.period}</small></div><ul>{p.features.map(f=><li key={f}><i className="fa-solid fa-check"/> {f}</li>)}</ul><a className={p.popular?'mz-button mz-button-dark':'mz-button mz-button-light'} href="/app">Choose {p.name} <i className="fa-solid fa-arrow-right"/></a></article>)}</div><p className="mz-free-note"><i className="fa-solid fa-circle-info"/> Free registration does not require payment. Paid features activate after your mobile-money payment is confirmed.</p></div></section>
      <section className="mz-bottom-cta" id="contact"><div className="mz-wrap"><div><span>READY WHEN YOU ARE</span><h2>Make your shop easier to manage.</h2><p>Start with a free account. Your next step is just one click away.</p></div><a className="mz-button mz-button-white" href="/app">Get started for free <i className="fa-solid fa-arrow-right"/></a></div></section>
    </main>
    <footer className="mz-footer"><div className="mz-wrap"><div className="mz-footer-main"><div className="mz-footer-brand"><Brand/><p>Simple sales, inventory and profit management for growing businesses.</p></div><div><b>Explore</b><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="/app">Sign in</a></div><div><b>Help & support</b><a href="tel:+255621658007">+255 621 658 007</a><a href="https://wa.me/255621658007" target="_blank" rel="noreferrer">WhatsApp support</a><a href="mailto:support@mauzobora.co.tz">Email us</a></div><div><b>Legal</b><a href="/terms">Terms & conditions</a><a href="/privacy">Privacy policy</a></div></div><div className="mz-footer-bottom"><span>© {new Date().getFullYear()} Mauzobora. All rights reserved.</span><span>Built for business in Tanzania <i className="fa-solid fa-heart"/></span></div></div></footer>
  </div>;
}
