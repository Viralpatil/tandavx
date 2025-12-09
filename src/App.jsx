import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';



// --- THEME CONFIGURATION ---
// We use a CSS gradient to mimic metallic gold rather than a flat color
const METALLIC_GOLD_GRADIENT = 'linear-gradient(135deg, #BF953F, #756f38ff, #B38728, #FBF5B7, #AA771C)';
const TEXT_MAIN = '#1A1A1A';
const BG_CREAM = '#FAF9F6'; // "Off-White" / Alabaster
const BG_PAPER = '#FFFFFF';

// --- GLOBAL CSS INJECTION ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

    body {
      background-color: ${BG_CREAM};
      color: ${TEXT_MAIN};
      font-family: 'Montserrat', sans-serif;
      overflow-x: hidden;
    }

    /* Typography Overrides */
    h1, h2, h3, .serif-font {
      font-family: 'Playfair Display', serif;
    }

    /* The "Metallic Gold" Text Effect */
    .text-gold-metallic {
      background: ${METALLIC_GOLD_GRADIENT};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      background-size: 200% auto;
      animation: shine 5s linear infinite;
    }

    /* The "Metallic Gold" Border/Background Effect */
    .bg-gold-metallic {
      background: ${METALLIC_GOLD_GRADIENT};
      background-size: 200% auto;
      transition: 0.5s;
    }
    .bg-gold-metallic:hover {
      background-position: right center; /* change the direction of the change here */
    }

    /* Animations */
    @keyframes shine {
      to {
        background-position: 200% center;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translate3d(0, 40px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }

    .animate-fade-up {
      animation: fadeInUp 0.8s ease-out forwards;
      opacity: 0; /* Start hidden */
    }
    
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f1f1; 
    }
    ::-webkit-scrollbar-thumb {
      background: #C5A059; 
      border-radius: 4px;
    }
    
    /* Card Hover Lift */
    .hover-lift {
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
    }
    .hover-lift:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
  `}</style>
);

// --- API UTILS ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateScopeAPI(userQuery, setLoading) {
  setLoading(true);
  const systemPrompt = "You are a senior IT Project Manager for TANDAVX LTD. Your task is to take a brief business idea and generate a professional, structured project scope, key features, and high-level milestones. Format the response clearly using Markdown headings and lists. Be encouraging and focus on technical feasibility. Do not use quotes or backticks in your response. Begin with a professional salutation.";
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  let responseText = "";
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const result = await response.json();
      responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } else {
      responseText = "Our consultants are currently busy (API Error). Please try again shortly.";
    }
  } catch (error) {
    responseText = "Connection error. Please check your network.";
  } finally {
    setLoading(false);
  }
  return responseText;
}

// --- COMPONENTS ---

// 1. Navigation (Floating & Minimal)
const Navbar = ({ screen, setScreen, openContact }) => (
  <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
    {/* Logo Area */}
    <div
      className="flex items-center cursor-pointer group"
      onClick={() => setScreen('landing')}
    >
      {/* Simple logo mark */}
      <div className="w-10 h-10 mr-3 flex items-center justify-center border-2 border-[#C5A059] rounded-sm transform rotate-45 group-hover:rotate-0 transition duration-500">
        <span className="text-[#C5A059] font-serif font-bold text-xl transform -rotate-45 group-hover:rotate-0 transition duration-500">T</span>
      </div>
      <div className="text-2xl font-bold tracking-widest serif-font text-gray-900 group-hover:text-[#C5A059] transition">
        TANDAV<span className="text-gold-metallic">X</span>
      </div>
    </div>

    {/* Desktop Links */}
    <div className="hidden md:flex space-x-8 items-center">
      {['about', 'it', 'shop'].map((item) => (
        <button
          key={item}
          onClick={() => setScreen(item)}
          className={`text-sm font-medium tracking-widest uppercase transition relative group ${screen === item ? 'text-[#C5A059]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {item === 'it' ? 'Services' : item}
          <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-gold-metallic transition-all duration-300 group-hover:w-full ${screen === item ? 'w-full' : ''}`}></span>
        </button>
      ))}
    </div>

    {/* CTA Button */}
    <button
      onClick={openContact}
      className="px-6 py-2 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-gold-metallic transition-all duration-500 shadow-lg"
    >
      Inquire
    </button>
  </nav>
);

// 2. Scope Renderer (Cleaned up)
const ScopeOutputRenderer = ({ markdown }) => {
  if (!markdown) return null;
  let formattedText = markdown
    .replace(/###\s*(.*)/g, `<h5 class="font-serif font-bold text-lg mt-6 mb-3 text-gray-800 border-b border-[#C5A059] pb-1 inline-block">$1</h5>`)
    .replace(/##\s*(.*)/g, `<h4 class="font-serif font-bold text-xl mt-8 mb-4 text-[#C5A059]">$1</h4>`)
    .replace(/#\s*(.*)/g, `<h3 class="font-serif font-bold text-2xl mt-8 mb-4 text-black">$1</h3>`)
    .replace(/(\r?\n|^)[*-]\s*(.*)/g, `<li><span class="mr-2 text-[#C5A059]">✦</span> $2</li>`)
    .replace(/(<li>[\s\S]*?<\/li>)/g, (match) => match.includes('<ul>') ? match : `<ul class="space-y-3 mb-6 pl-2 text-gray-600">${match}</ul>`)
    .split('\n\n').map(p => (p.trim() && !p.startsWith('<h') && !p.startsWith('<ul')) ? `<p class="mb-4 leading-relaxed text-gray-600">${p.trim()}</p>` : p).join('');

  return <div className="p-8 bg-white border border-gray-100 shadow-inner rounded-sm animate-fade-up" dangerouslySetInnerHTML={{ __html: formattedText }} />;
}


// 3. Landing Screen - FULLSCREEN BRANDING + SCROLL REVEAL

const LandingScreen = ({ setScreen, openContact }) => (
  <div className="flex flex-col justify-center items-center min-h-screen pt-20 relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#C5A059] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FBF5B7] rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>

    <div className="text-center mb-16 z-10 px-6 max-w-4xl">
      <p className="text-[#C5A059] text-sm tracking-[0.3em] uppercase mb-4 animate-fade-up">Est. 2025</p>
      <h1 className="text-6xl md:text-8xl font-medium mb-6 leading-tight text-gray-900 animate-fade-up delay-100">
        TANDAV <span className="italic font-serif text-gold-metallic">X</span>.
      </h1>
     
      <h3 className="text-6xl md:text-8xl font-medium mb-3 leading-tight text-gray-900 animate-fade-up delay-100">
        Digital <span className="italic font-serif text-gold-metallic">Elegance</span>.
      </h3>
      <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed animate-fade-up delay-200">
        TANDAVX represents the intersection of high-performance technology and curated luxury lifestyle.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-6 z-10">
      {[
        { id: 'it', icon: 'fa-microchip', title: 'Tech Atelier', desc: 'Bespoke software engineering & cloud architecture.' },
        { id: 'shop', icon: 'fa-gem', title: 'Curated Retail', desc: 'Exclusive goods for the modern connoisseur.' },
        { id: 'about', icon: 'fa-landmark', title: 'The Firm', desc: 'Our philosophy, leadership, and vision.' }
      ].map((card, idx) => (
        <div 
          key={card.id}
          onClick={() => setScreen(card.id)}
          className={`bg-white p-10 border border-gray-100 shadow-xl cursor-pointer group relative overflow-hidden hover-lift animate-fade-up`}
          style={{ animationDelay: `${(idx + 3) * 100}ms` }}
        >
          {/* Hover Gradient Overlay */}
          <div className="absolute inset-0 bg-gold-metallic opacity-0 group-hover:opacity-10 transition duration-700"></div>
          
          <div className="text-[#C5A059] text-4xl mb-6 transform group-hover:-translate-y-2 transition duration-500">
            <i className={`fa-solid ${card.icon}`}></i>
          </div>
          <h2 className="text-2xl font-serif mb-3 text-gray-900">{card.title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">{card.desc}</p>
          
          <div className="flex items-center text-xs font-bold tracking-widest uppercase text-gray-400 group-hover:text-[#C5A059] transition">
            Explore <span className="ml-2 transform group-hover:translate-x-2 transition duration-300">→</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);


// 4. IT Services Screen
const ITServiceScreen = ({ setScreen }) => {
  const [projectIdea, setProjectIdea] = useState('');
  const [scopeOutput, setScopeOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateScope = async () => {
    if (!projectIdea.trim()) return;
    setScopeOutput('');
    const result = await generateScopeAPI(projectIdea, setIsLoading);
    setScopeOutput(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 animate-fade-up">
        <div>
          <button onClick={() => setScreen('landing')} className="text-gray-400 hover:text-[#C5A059] transition mb-6 text-sm tracking-widest uppercase">
            ← Return Home
          </button>
          <h1 className="text-5xl md:text-7xl text-gray-900 mb-2">Technical <span className="italic font-serif text-gold-metallic">Mastery</span></h1>
        </div>
        <div className="hidden md:block w-32 h-1 bg-[#C5A059] mb-4"></div>
      </div>

      {/* AI Tool */}
      <div className="bg-white p-8 md:p-12 shadow-2xl border border-gray-100 relative mb-24 animate-fade-up delay-100">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold-metallic"></div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-3xl font-serif mb-4 text-gray-900">Project Architect AI</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Leverage our proprietary Gemini-powered engine to structure your vision. Input a concept, and receive a preliminary technical roadmap instantly.
            </p>
            <div className="relative">
              <textarea
                rows="4"
                placeholder="Describe your vision (e.g., A luxury real estate platform with VR tours...)"
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-4 text-gray-800 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition"
                disabled={isLoading}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateScope}
                  className="bg-gold-metallic text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:shadow-lg transition transform hover:-translate-y-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Architecting...' : 'Generate Blueprint'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-6 min-h-[300px] flex flex-col relative overflow-hidden">
            {(!scopeOutput && !isLoading) && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 opacity-50">
                <i className="fa-solid fa-compass-drafting text-6xl mb-4"></i>
                <span className="uppercase tracking-widest text-sm">Awaiting Input</span>
              </div>
            )}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-[#C5A059]">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
                <span className="uppercase tracking-widest text-xs animate-pulse">Consulting Neural Network...</span>
              </div>
            )}
            {scopeOutput && <ScopeOutputRenderer markdown={scopeOutput} />}
          </div>
        </div>
      </div>

      {/* Service Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { title: 'Bespoke Development', icon: 'fa-code', desc: 'Hand-coded web and mobile applications tailored to your exact specifications using React and Native technologies.' },
          { title: 'Cloud Infrastructure', icon: 'fa-cloud', desc: 'Scalable, secure, and resilient architecture deployed on AWS or Azure for maximum uptime.' },
          { title: 'Regulatory Affairs', icon: 'fa-file-contract', desc: 'UK, US, EU, Ireland & Canada pharma regulatory expertise: MHRA submissions, pre/post-approvals, dossier management & compliance strategies.' },
          { title: 'Cyber Intelligence', icon: 'fa-shield-halved', desc: 'Proactive threat hunting and military-grade encryption to protect your enterprise assets.' }
        ].map((svc, i) => (
          <div key={i} className="group animate-fade-up" style={{ animationDelay: `${(i + 2) * 100}ms` }}>
            <div className="w-12 h-12 border border-gray-200 flex items-center justify-center text-[#C5A059] text-xl mb-6 group-hover:bg-[#C5A059] group-hover:text-white transition duration-500">
              <i className={`fa-solid ${svc.icon}`}></i>
            </div>
            <h3 className="text-xl font-serif font-bold mb-3 text-gray-900">{svc.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Shop Screen
const ShopScreen = ({ setScreen }) => {
  const products = [
    { id: 1, name: 'Wireless Pods X', price: '$229.00', cat: 'Audio', icon: 'fa-headphones' },
    { id: 2, name: 'Chronos Smart', price: '$345.00', cat: 'Wearables', icon: 'fa-stopwatch' },
    { id: 3, name: 'Signature Hoodie', price: '$85.00', cat: 'Apparel', icon: 'fa-shirt' },
    { id: 4, name: 'Lumina Ring', price: '$120.00', cat: 'Studio', icon: 'fa-ring' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 animate-fade-up">
        <div>
          <button onClick={() => setScreen('landing')} className="text-gray-400 hover:text-[#C5A059] transition mb-6 text-sm tracking-widest uppercase">
            ← Return Home
          </button>
          <h1 className="text-5xl md:text-7xl text-gray-900 mb-2">Curated <span className="italic font-serif text-gold-metallic">Collection</span></h1>
        </div>
        <div className="hidden md:block w-32 h-1 bg-[#C5A059] mb-4"></div>
      </div>

      {/* Featured Hero */}
      <div className="relative w-full h-96 bg-gray-900 mb-24 flex items-center justify-center overflow-hidden animate-fade-up delay-100 group">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        {/* Abstract abstract background using css */}
        <div className="absolute right-0 top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-20 flex flex-col md:flex-row items-center w-full max-w-5xl px-8">
          <div className="md:w-1/2 text-white">
            <span className="text-[#C5A059] tracking-[0.3em] text-xs uppercase font-bold mb-4 block">Viral Trend</span>
            <h2 className="text-5xl font-serif mb-6">The Gold Standard.</h2>
            <p className="text-gray-400 mb-8 max-w-md font-light">Discover the products defining the current cultural moment. Available exclusively through our partner channels.</p>
            <a href="https://www.tiktok.com/@tandavx?_r=1&_t=ZN-92592LMoyBu" target="_blank" rel="noreferrer" className="inline-block px-8 py-3 border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-white transition duration-500 uppercase text-xs font-bold tracking-widest">
              View on TikTok
            </a>
          </div>
          <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
            <i className="fa-solid fa-crown text-9xl text-white opacity-10 transform group-hover:scale-110 transition duration-1000"></i>
          </div>
        </div>
      </div>

      {/* Channels */}
      <div className="flex justify-center space-x-12 mb-20 animate-fade-up delay-200 border-b border-gray-200 pb-12">
        {[
          { name: 'Amazon', icon: 'fa-amazon', url: 'https://amazon.com' },
          { name: 'eBay', icon: 'fa-ebay', url: 'https://ebay.com' },
          { name: 'TikTok Shop', icon: 'fa-tiktok', url: 'https://www.tiktok.com/@tandavx?_r=1&_t=ZN-92592LMoyBu' }
        ].map(ch => (
          <a key={ch.name} href={ch.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#C5A059] transition flex flex-col items-center group">
            <i className={`fa-brands ${ch.icon} text-3xl mb-2 group-hover:-translate-y-1 transition duration-300`}></i>
            <span className="text-xs tracking-widest uppercase">{ch.name}</span>
          </a>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {products.map((p, i) => (
          <div key={p.id} className="group cursor-pointer animate-fade-up" style={{ animationDelay: `${(i + 3) * 100}ms` }}>
            <div className="aspect-[4/5] bg-gray-50 mb-6 flex items-center justify-center relative overflow-hidden">
              <i className={`fa-solid ${p.icon} text-6xl text-gray-200 group-hover:text-[#C5A059] transition duration-500 transform group-hover:scale-110`}></i>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-500"></div>
              <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest shadow-lg">
                Add to Cart
              </button>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-400 uppercase tracking-widest">{p.cat}</span>
              <h3 className="text-lg font-serif text-gray-900 mt-1 mb-2">{p.name}</h3>
              <span className="text-[#C5A059] font-medium">{p.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. About Screen
const AboutScreen = ({ setScreen, openContact }) => (
  <div className="max-w-7xl mx-auto px-6 py-24">
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 animate-fade-up">
      <div>
        <button onClick={() => setScreen('landing')} className="text-gray-400 hover:text-[#C5A059] transition mb-6 text-sm tracking-widest uppercase">
          ← Return Home
        </button>
        <h1 className="text-5xl md:text-7xl text-gray-900 mb-2">The <span className="italic font-serif text-gold-metallic">Firm</span></h1>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24 animate-fade-up delay-100">
      <div>
        <h3 className="text-3xl font-serif mb-6 text-gray-900">A duality of purpose.</h3>
        <p className="text-gray-500 mb-6 leading-loose font-light">
          TANDAVX LTD was established on the principle that precision engineering and aesthetic beauty are not mutually exclusive. We operate as a hybrid entity: one arm dedicated to rigorous software architecture, the other to the curation of high-end lifestyle artifacts.
        </p>
        <p className="text-gray-500 leading-loose font-light">
          Whether we are deploying a microservices architecture for a fintech client or sourcing rare goods for our retail division, the underlying standard remains the same: <span className="text-[#C5A059]">uncompromised excellence.</span>
        </p>

        <div className="mt-8 flex space-x-6">
          <div className="text-center">
            <span className="block text-4xl font-serif text-gold-metallic mb-1">20+</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">Enterprise Clients</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl font-serif text-gold-metallic mb-1">5k+</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">Products Sold</span>
          </div>
        </div>
      </div>
      <div className="relative h-[500px] bg-gray-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
        {/* Decorative monogram */}
        <span className="text-[200px] font-serif text-[#C5A059] opacity-20">T</span>
      </div>
    </div>

    <div className="bg-black text-white p-16 text-center animate-fade-up delay-200">
      <h3 className="text-2xl font-serif mb-4">Start a conversation.</h3>
      <p className="text-gray-400 mb-8 max-w-lg mx-auto font-light">We are currently accepting new partnerships for Q4 2024. Contact our leadership team directly.</p>
      <button onClick={openContact} className="bg-gold-metallic text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:opacity-90 transition">
        Initiate Inquiry
      </button>
    </div>
  </div>
);

// 7. Contact Modal
const ContactModal = ({ isVisible, closeContact }) => {
  if (!isVisible) return null;

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    
    // Get customer data
    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone ? e.target.phone.value : 'Not provided';
    const inquiryType = e.target.inquiry.value;
    const message = e.target.message.value;
    
    // WHATSAPP MESSAGE TO YOU (Primary - Instant)
    const whatsappMessage = `🆕 *NEW TANDAVX INQUIRY!*\n\n` +
      `👤 *Customer:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `📱 *Phone:* ${phone}\n` +
      `🎯 *Type:* ${inquiryType}\n` +
      `💬 *Project:* ${message}\n\n` +
      `⚡ Reply NOW to close deal!`;
    
    // YOUR WHATSAPP NUMBER HERE 👇
    const yourWhatsAppNumber = "447407024220"; // CHANGE THIS!
    
    const whatsappUrl = `https://wa.me/${yourWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // EMAIL TO YOU (Backup)
    const emailSubject = `🆕 New TANDAVX Inquiry - ${name} (${inquiryType})`;
    const emailBody = `New customer inquiry received:\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Inquiry Type: ${inquiryType}\n` +
      `Project Details:\n${message}\n\n` +
      `-- TANDAVX Concierge`;
    
    // YOUR EMAIL HERE 👇
    const yourEmail = "viralpatil59@gmail.com"; // CHANGE THIS!
    
    const mailtoUrl = `mailto:${yourEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // OPEN BOTH (WhatsApp + Email)
    window.open(whatsappUrl, '_blank');
    window.location.href = mailtoUrl;
    
    // Customer confirmation
    alert(`✅ Thank you ${name}!\n\nOur concierge will contact you within 24 hours.\n\n💼 Professional service guaranteed.`);
    
    // Reset form
    e.target.reset();
    closeContact();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white w-full max-w-lg p-12 relative shadow-2xl animate-fade-up">
        <button onClick={closeContact} className="absolute top-6 right-6 text-gray-400 hover:text-black transition">
          ✕
        </button>
        
        <div className="text-center mb-8">
          <span className="text-[#C5A059] text-xs font-bold tracking-widest uppercase mb-2 block">Concierge Service</span>
          <h3 className="text-3xl font-serif text-gray-900">Request Consultation</h3>
        </div>
        
        <form className="space-y-6" onSubmit={handleInquirySubmit}>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
            <input required name="name" type="text" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#C5A059] transition-all" placeholder="John Doe" />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email *</label>
            <input required name="email" type="email" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#C5A059] transition-all" placeholder="john@company.com" />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone (Optional)</label>
            <input name="phone" type="tel" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#C5A059] transition-all" placeholder="+44 7123 456 789" />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Service Required *</label>
            <select required name="inquiry" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#C5A059] bg-transparent">
              <option value="">Select service...</option>
              <option>Mobile App Development</option>
              <option>Website Development</option>
              <option>ERP Solutions</option>
              <option>Booking Systems</option>
              <option>Restaurant Billing</option>
              <option>Regulatory Affairs</option>
              <option>Corporate Partnership</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Project Details *</label>
            <textarea required name="message" rows="4" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#C5A059] transition-all resize-none" placeholder="Describe your project requirements..."></textarea>
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-[#C5A059] to-gold-metallic text-white py-4 text-sm font-bold tracking-widest uppercase hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <i className="fab fa-whatsapp mr-2"></i>
            <i className="fas fa-envelope mr-2"></i>
            Submit Inquiry
          </button>
        </form>
        
        <p className="text-xs text-gray-400 mt-6 text-center">
          🔒 Secure | 📱 Instant WhatsApp | ✉️ Email Confirmation | Response: 24h
        </p>
      </div>
    </div>
  );
};





// --- MAIN APP ---
const App = () => {
  const [screen, setScreen] = useState('landing');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <GlobalStyles />
      <Navbar
        screen={screen}
        setScreen={setScreen}
        openContact={() => setIsContactModalOpen(true)}
      />

      {screen === 'landing' && <LandingScreen setScreen={setScreen} openContact={() => setIsContactModalOpen(true)} />}
      {screen === 'it' && <ITServiceScreen setScreen={setScreen} />}
      {screen === 'shop' && <ShopScreen setScreen={setScreen} />}
      {screen === 'about' && <AboutScreen setScreen={setScreen} openContact={() => setIsContactModalOpen(true)} />}

      <ContactModal
        isVisible={isContactModalOpen}
        closeContact={() => setIsContactModalOpen(false)}
      />
    </>
  );
};

export default App;