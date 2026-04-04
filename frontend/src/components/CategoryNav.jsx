const categories = [
  { name: 'Rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&q=80' },
  { name: 'Earrings', img: 'https://images.unsplash.com/photo-1535633302704-b02f4faad747?w=100&q=80' },
  { name: 'Necklaces', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&q=80' },
  { name: 'Bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80' }
];

export default function CategoryNav({ onSelect }) {
  return (
    <div className="flex justify-center gap-8 md:gap-16 py-10 overflow-x-auto px-6 no-scrollbar">
      {categories.map((cat) => (
        <div 
          key={cat.name} 
          onClick={() => onSelect(cat.name)}
          className="flex flex-col items-center gap-3 cursor-pointer group"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-gray-100 overflow-hidden group-hover:border-giva-pink transition-all p-1">
            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-[11px] uppercase tracking-widest font-bold group-hover:text-giva-pink transition">
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}