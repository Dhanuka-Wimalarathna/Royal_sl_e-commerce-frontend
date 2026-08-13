"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Authenticity guaranteed" },
  { icon: Truck, label: "Free shipping over $100" },
  { icon: RotateCcw, label: "30-day returns" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B4E38] text-white py-16 sm:py-20 md:py-24">
      <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="stagger-children space-y-6 md:space-y-8"
        >
          <span className="text-xs font-semibold tracking-[0.2em] text-[#dfc299] uppercase block">
            New Collection · Autumn 2026
          </span>
          <h1 className="text-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl font-medium tracking-tight text-white max-w-lg">
            Luxury you deserve.<br />Quality you trust.
          </h1>
          <p className="text-white/80 max-w-md text-base sm:text-lg leading-relaxed">
            Premium products, exceptional craftsmanship, and an unforgettable
            experience — delivered to your door.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button
  size="lg"
  className="rounded-full bg-gradient-to-r from-[#f5d78e] via-[#e0b563] to-[#c99a4a] hover:from-[#f7e0a3] hover:via-[#e8c078] hover:to-[#d4a75e] text-[#0B4E38] border-0 px-6 py-6 font-semibold shadow-lg shadow-[#d6b68a]/40 hover:shadow-xl hover:shadow-[#d6b68a]/60 transition-all duration-300 hover:scale-[1.02]"
  asChild
>
  <Link href="/products" className="inline-flex items-center gap-2">
    Shop the collection
    <ArrowRight className="size-4" />
  </Link>
</Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 hover:border-white/60 text-white hover:bg-white/10 hover:text-white px-6 py-6 font-medium transition-all duration-200"
              asChild
            >
              <Link href="/categories">Explore lookbook</Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-white/10">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="text-white/70 flex items-center gap-2 text-xs sm:text-sm">
                <item.icon className="text-[#dfc299] size-4 shrink-0" />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative aspect-[4/3] w-full max-w-xl mx-auto rounded-[32px] overflow-hidden bg-[#f4f4f2] shadow-luxury-xl p-8 flex items-center justify-center border border-white/5"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
            <Image
              src="/hero-product.png"
              alt="Luxury product showcase"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

