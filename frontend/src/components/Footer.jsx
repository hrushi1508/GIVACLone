import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-giva-sand text-giva-dark border-t border-gray-200">
      {/* SERVICE BAR: Trust signals are huge for Jewelry brands */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <ShieldCheck size={24} className="text-giva-pink" />
            <span className="text-xs uppercase tracking-widest font-bold">BIS Hallmarked</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck size={24} className="text-giva-pink" />
            <span className="text-xs uppercase tracking-widest font-bold">Free Insured Shipping</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <RefreshCw size={24} className="text-giva-pink" />
            <span className="text-xs uppercase tracking-widest font-bold">30-Day Returns</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* BRAND SECTION */}
        <div className="md:col-span-4 space-y-6">
          <h2 className="text-3xl font-serif tracking-tighter font-bold text-giva-dark">GIVA</h2>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            A world of exquisite silver jewellery designed to make you shine, 
            every single day. Elevate your style with GIVA.
          </p>
          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">Newsletter</p>
            <div className="flex border-b border-giva-dark pb-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
              />
              <ArrowRight size={18} className="cursor-pointer hover:text-giva-pink transition" />
            </div>
          </div>
        </div>

        {/* LINKS SECTIONS */}
        <div className="md:col-span-2 space-y-6">
          <h4 className="text-xs uppercase tracking-widest font-bold">Collection</h4>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="hover:text-giva-pink cursor-pointer transition">Rings</li>
            <li className="hover:text-white cursor-pointer transition">Earrings</li>
            <li className="hover:text-giva-pink cursor-pointer transition">Necklaces</li>
            <li className="hover:text-giva-pink cursor-pointer transition">Bracelets</li>
          </ul>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h4 className="text-xs uppercase tracking-widest font-bold">Information</h4>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="hover:text-giva-pink cursor-pointer transition">Our Story</li>
            <li className="hover:text-giva-pink cursor-pointer transition">Certificates</li>
            <li className="hover:text-giva-pink cursor-pointer transition">Blog</li>
          </ul>
        </div>

        {/* CONTACT SECTION */}
        <div className="md:col-span-4 space-y-6">
          <h4 className="text-xs uppercase tracking-widest font-bold">Get in Touch</h4>
          <div className="space-y-4 text-sm text-gray-500">
            <p className="flex items-center gap-3"><Mail size={16} /> care@giva.co</p>
            <p className="flex items-center gap-3"><Phone size={16} /> 1800-123-4567</p>
            <p className="flex items-center gap-3 leading-relaxed">
              <MapPin size={16} className="shrink-0" /> 
              GIVA Jewellery, 3rd Floor, Indiranagar, Bangalore - 560038
            </p>
          </div>
        </div>
      </div>

      {/* COPYRIGHT AREA */}
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
          <p>© {currentYear} GIVA. MADE WITH LOVE IN INDIA.</p>
          <div className="flex gap-8">
            <span className="hover:text-giva-pink cursor-pointer transition">Terms</span>
            <span className="hover:text-giva-pink cursor-pointer transition">Privacy</span>
            <span className="hover:text-giva-pink cursor-pointer transition">Care</span>
          </div>
        </div>
      </div>
    </footer>
  );
}