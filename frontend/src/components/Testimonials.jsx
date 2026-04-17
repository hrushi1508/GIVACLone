import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Aisha Kapoor",
    role: "Bride, Delhi",
    image: "👰",
    text: "The most exquisite bridal collection! Every piece felt special. GIVA made my wedding day even more magical. Highly recommend!",
    rating: 5
  },
  {
    name: "Priya Singh",
    role: "Jewelry Enthusiast, Mumbai",
    image: "✨",
    text: "Fair pricing, premium quality, and exceptional customer service. I'm now a loyal customer and have recommended GIVA to all my friends.",
    rating: 5
  },
  {
    name: "Neha Verma",
    role: "Professional, Bangalore",
    image: "👩‍💼",
    text: "Love how versatile their designs are! I have pieces for every occasion and they never disappoint on quality. Pure elegance.",
    rating: 5
  },
  {
    name: "Sneha Patel",
    role: "Gift Giver, Ahmedabad",
    image: "🎁",
    text: "GIVA's packaging is as beautiful as their jewelry. Got gifts for my sisters and they loved them. Perfect every time!",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-giva-sand/20 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-giva-pink font-bold mb-3">
            Loved by Thousands
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-giva-dark mb-6">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} className="fill-giva-gold text-giva-gold" />
            ))}
          </div>
          <p className="mt-4 text-giva-dark/60 font-medium">Rated 4.9/5 from 1000+ reviews</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="group p-8 bg-white border-2 border-giva-sand/50 hover:border-giva-pink transition-all duration-300 hover:shadow-lg"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-giva-gold text-giva-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-giva-dark/80 font-serif italic mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-giva-sand flex items-center justify-center text-2xl">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-giva-dark">{testimonial.name}</h4>
                  <p className="text-sm text-giva-dark/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
