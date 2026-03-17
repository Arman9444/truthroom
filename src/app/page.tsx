"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    title: "Anonymous Identity",
    description:
      "Every participant receives a randomly generated mask and alias. No names, no history -- just honest voices in the room.",
    icon: "\u{1F3AD}",
  },
  {
    title: "Community Safety",
    description:
      "Community-driven moderation keeps the space respectful. Participants collectively maintain the room's integrity.",
    icon: "\u{1F6E1}\uFE0F",
  },
  {
    title: "Reveal on Your Terms",
    description:
      "A graduated reveal system lets you choose when and how much to share. Unmask at your own pace, if at all.",
    icon: "\u{1F525}",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amber/5 blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto mb-20 animate-fade-in">
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight glow-amber animate-pulse-glow mb-4">
          TruthRoom
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground mb-3">
          Where anonymity enables honesty
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-md mb-10 leading-relaxed">
          Create a room, invite others, and share openly behind the safety of a
          mask. No accounts. No judgement. Just truth.
        </p>

        <div className="flex gap-4">
          <Link href="/create" className={buttonVariants({ size: "lg", className: "text-base px-8" })}>
            Create a Room
          </Link>
          <Link href="/join" className={buttonVariants({ size: "lg", variant: "outline", className: "text-base px-8" })}>
            Join a Room
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mx-auto">
        {features.map((feature, i) => (
          <Card
            key={feature.title}
            className="border-border/50 bg-card/50 backdrop-blur-sm hover:glow-border transition-shadow duration-500"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <CardHeader>
              <div className="text-3xl mb-3">{feature.icon}</div>
              <CardTitle className="text-lg text-foreground">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/80 leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  );
}
