"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Shield, Users, Eye } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Anonymous Identity",
    description:
      "Every participant receives a randomly generated mask and alias. No names, no history — just honest voices.",
  },
  {
    icon: Users,
    title: "Community Safety",
    description:
      "Community-driven moderation keeps the space respectful. Participants collectively maintain integrity.",
  },
  {
    icon: Eye,
    title: "Reveal on Your Terms",
    description:
      "A graduated reveal system lets you choose when and how much to share. Unmask at your own pace.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto mb-20 animate-fade-in">
        {/* Radial gradient glow behind heading */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(212,168,71,0.08) 0%, transparent 70%)",
          }}
        />

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-[#e8e4df] glow-amber mb-4 relative">
          Candor
        </h1>
        <p className="text-lg sm:text-xl text-[#6b8aab] tracking-wide mb-3">
          Where anonymity enables honesty
        </p>
        <p className="text-sm text-[#6b6e7a] max-w-md leading-relaxed mb-10">
          Create a room, invite others, and share openly behind the safety of a
          mask. No accounts. No judgement. Just truth.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Link
            href="/create"
            className={buttonVariants({
              className:
                "bg-[#d4a847] text-[#0a0a0f] font-semibold hover:bg-[#d4a847]/90 px-8 py-3 rounded-lg text-base transition-all hover:scale-[1.02]",
            })}
          >
            Create a Room
          </Link>
          <Link
            href="/join"
            className={buttonVariants({
              variant: "outline",
              className:
                "border-[#d4a847]/40 text-[#d4a847] hover:bg-[#d4a847]/10 px-8 py-3 rounded-lg text-base transition-all hover:scale-[1.02]",
            })}
          >
            Join a Room
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full mx-auto">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="glass rounded-2xl p-6 hover:border-[#d4a847]/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in opacity-0"
              style={{
                animationDelay: `${i * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <CardHeader>
                <Icon size={24} className="text-[#d4a847] mb-4" />
                <CardTitle className="font-semibold text-[#e8e4df]">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm text-[#6b6e7a] leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="mt-20 text-center">
        <p className="text-xs text-[#6b6e7a]/60">
          Built for truth. No data stored. No accounts needed.
        </p>
      </footer>
    </main>
  );
}
