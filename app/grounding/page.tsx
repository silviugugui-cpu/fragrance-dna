"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildSeed } from "@/lib/engine/seedBuilder";
import { buildUserVector } from "@/lib/engine/userVectorBuilder";
import { mergeGroundingVectorIntoSession } from "@/lib/dnaSession";
import { getOrCreateUserProfile, updateUserVector } from "@/lib/engine/userProfileManager";
import { PageShell, SectionHeader, PremiumButton } from "@/components/design-system";

const TOKENS = [
  "Fresh & Citrusy",
  "Sweet & Gourmand",
  "Woody & Dry",
  "Clean & Soapy",
  "Spicy & Warm",
  "Green & Natural",
  "Dark & Smoky",
  "Soft & Powdery",
];

type Zone = "love" | "neutral" | "hate";

const sectionTitle: Record<Zone, string> = {
  love: "Attraction Patterns",
  neutral: "Neutral Affinities",
  hate: "Avoidance Patterns",
};

const sectionTone: Record<Zone, string> = {
  love: "These accords ignite your curiosity and become the luminous heart of your fragrance story.",
  neutral: "These whispers add atmosphere without demanding the spotlight, creating a soft, balanced trail.",
  hate: "These textures are best set aside to preserve clarity and warmth in your scent identity.",
};

function sentenceList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export default function GroundingPage() {
  const router = useRouter();
  const [state, setState] = useState<Record<string, Zone>>(
    Object.fromEntries(TOKENS.map((token) => [token, "neutral"]))
  );

  const loveTokens = Object.entries(state)
    .filter(([, zone]) => zone === "love")
    .map(([token]) => token);
  const neutralTokens = Object.entries(state)
    .filter(([, zone]) => zone === "neutral")
    .map(([token]) => token);
  const hateTokens = Object.entries(state)
    .filter(([, zone]) => zone === "hate")
    .map(([token]) => token);

  const personaNarrative = [
    loveTokens.length
      ? `You are drawn to ${sentenceList(loveTokens)} as the radiant anchors of your palette.`
      : "Your scent identity is open, with an elegant space for discovery.",
    neutralTokens.length
      ? `Soft affinities for ${sentenceList(neutralTokens)} create a luminous balance.`
      : "Your preferences are still unfolding with subtle nuance.",
    hateTokens.length
      ? `You gently turn away from ${sentenceList(hateTokens)} to preserve a refined clarity.`
      : "There are no harsh exclusions in your current fragrance story.",
  ];

  function onDragStart(e: React.DragEvent<HTMLDivElement>, token: string) {
    e.dataTransfer.setData("token", token);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, zone: Zone) {
    e.preventDefault();
    const token = e.dataTransfer.getData("token");

    setState((prev) => ({
      ...prev,
      [token]: zone,
    }));
  }

  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function buildEngineInput() {
    const love = loveTokens;
    const neutral = neutralTokens;
    const hate = hateTokens;

    return {
      love,
      neutral,
      red_flag: hate,
      strength: {
        loveWeight: 1.0,
        neutralWeight: 0.3,
        hateWeight: -1.2,
      },
    };
  }

  function finish() {
    const engineInput = buildEngineInput();
    const seed = buildSeed(engineInput);
    const userVector = buildUserVector(seed);

    localStorage.setItem("fragrance_seed", JSON.stringify(seed));
    localStorage.setItem("fragrance_vector", JSON.stringify(userVector));
    localStorage.setItem("fragrance_grounding", JSON.stringify(engineInput));

    mergeGroundingVectorIntoSession(userVector);
    const profile = getOrCreateUserProfile();
    updateUserVector(profile, userVector, 10);

    router.push("/test");
  }

  const zones: Zone[] = ["love", "neutral", "hate"];
  const groupedTokens: Record<Zone, string[]> = {
    love: loveTokens,
    neutral: neutralTokens,
    hate: hateTokens,
  };

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="py-12 md:py-20 mb-4">
        <div className="main-container">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wider text-gold mb-4">CALIBRATE</p>
            <h1 className="text-4xl md:text-5xl font-light mb-6 text-white">Discover Your Fragrance Foundation</h1>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
              Shape your olfactory grounding through intuitive curation. Classify the scent moods that feel alive to you, creating a personalized foundation for your DNA discovery.
            </p>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="py-8 md:py-12">
        <div className="main-container">
          <div className="premium-card-dark p-8 md:p-10">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">HOW IT WORKS</p>
            <h3 className="text-xl font-semibold text-white mb-4">Drag scent qualities into your zones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold text-white mb-1">Attraction</p>
                  <p className="text-sm text-gray-400">Qualities that ignite your curiosity</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-warm-400 text-black flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold text-white mb-1">Neutral</p>
                  <p className="text-sm text-gray-400">Qualities that create balance</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-black-400 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold text-white mb-1">Avoidance</p>
                  <p className="text-sm text-gray-400">Qualities to set aside</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Persona Narrative Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <div className="premium-card-dark p-8 md:p-12 border-l-4 border-l-gold">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">YOUR PERSONA</p>
            <h2 className="text-2xl font-bold text-white mb-6">Fragrance Identity Portrait</h2>
            <div className="space-y-4">
              {personaNarrative.map((line, index) => (
                <p key={index} className="text-base text-gray-300 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Zones Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label="CUSTOMIZE"
            title="Classify Your Scent Qualities"
            description="Drag each quality into the zone where it belongs. Your selections shape the foundation of your fragrance DNA."
            className="mb-10"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attraction Zone */}
            <div
              onDrop={(e) => onDrop(e, "love")}
              onDragOver={allowDrop}
              className="premium-card-dark p-8 border-2 border-gold/30 hover:border-gold/60 transition-all min-h-96 cursor-drop flex flex-col"
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-gold font-bold mb-2">Attraction Patterns</p>
                <h3 className="text-xl font-bold text-white mb-3">Love</h3>
                <p className="text-sm text-gray-400">
                  These accords ignite your curiosity and become the luminous heart of your fragrance story.
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {groupedTokens.love.length > 0 ? (
                  groupedTokens.love.map((token) => (
                    <div
                      key={token}
                      draggable
                      onDragStart={(e) => onDragStart(e, token)}
                      className="inline-flex cursor-grab items-center rounded-lg bg-gold/20 border border-gold/40 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/30 hover:border-gold/60 transition-all"
                    >
                      {token}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Drag qualities here...</p>
                )}
              </div>
            </div>

            {/* Neutral Zone */}
            <div
              onDrop={(e) => onDrop(e, "neutral")}
              onDragOver={allowDrop}
              className="premium-card-dark p-8 border-2 border-warm-400/30 hover:border-warm-400/60 transition-all min-h-96 cursor-drop flex flex-col"
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-warm-300 font-bold mb-2">Neutral Affinities</p>
                <h3 className="text-xl font-bold text-white mb-3">Balance</h3>
                <p className="text-sm text-gray-400">
                  These whispers add atmosphere without demanding the spotlight, creating a soft, balanced trail.
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {groupedTokens.neutral.length > 0 ? (
                  groupedTokens.neutral.map((token) => (
                    <div
                      key={token}
                      draggable
                      onDragStart={(e) => onDragStart(e, token)}
                      className="inline-flex cursor-grab items-center rounded-lg bg-warm-400/20 border border-warm-400/40 px-4 py-2 text-sm font-medium text-warm-300 hover:bg-warm-400/30 hover:border-warm-400/60 transition-all"
                    >
                      {token}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Drag qualities here...</p>
                )}
              </div>
            </div>

            {/* Avoidance Zone */}
            <div
              onDrop={(e) => onDrop(e, "hate")}
              onDragOver={allowDrop}
              className="premium-card-dark p-8 border-2 border-black-400/30 hover:border-black-400/60 transition-all min-h-96 cursor-drop flex flex-col"
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-black-200 font-bold mb-2">Avoidance Patterns</p>
                <h3 className="text-xl font-bold text-white mb-3">Avoid</h3>
                <p className="text-sm text-gray-400">
                  These textures are best set aside to preserve clarity and warmth in your scent identity.
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {groupedTokens.hate.length > 0 ? (
                  groupedTokens.hate.map((token) => (
                    <div
                      key={token}
                      draggable
                      onDragStart={(e) => onDragStart(e, token)}
                      className="inline-flex cursor-grab items-center rounded-lg bg-black-400/20 border border-black-400/40 px-4 py-2 text-sm font-medium text-black-200 hover:bg-black-400/30 hover:border-black-400/60 transition-all"
                    >
                      {token}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Drag qualities here...</p>
                )}
              </div>
            </div>
          </div>

          {/* Token Pool */}
          <div className="mt-10">
            <p className="text-sm uppercase tracking-wider text-gray-400 mb-4">Available Qualities</p>
            <div className="premium-card-dark p-6 flex flex-wrap gap-3">
              {TOKENS.map((token) => {
                const currentZone = Object.entries(state).find(([k]) => k === token)?.[1] || "neutral";
                const isPlaced = currentZone !== "neutral" || Object.values(state).some(z => z !== "neutral");
                
                if (
                  (currentZone !== "love" && state[token] !== "love") &&
                  (currentZone !== "hate" && state[token] !== "hate") &&
                  (currentZone !== "neutral" || Object.values(state).filter(z => z === "neutral").length < TOKENS.length)
                ) {
                  return null;
                }

                // Show only unplaced tokens
                if (state[token] === "neutral" && (loveTokens.length > 0 || hateTokens.length > 0)) {
                  return (
                    <div
                      key={token}
                      draggable
                      onDragStart={(e) => onDragStart(e, token)}
                      className="cursor-grab px-4 py-2 rounded-lg bg-black-600 border border-black-400 text-white text-sm hover:bg-black-500 transition-all"
                    >
                      {token}
                    </div>
                  );
                }

                if (state[token] === "neutral") {
                  return (
                    <div
                      key={token}
                      draggable
                      onDragStart={(e) => onDragStart(e, token)}
                      className="cursor-grab px-4 py-2 rounded-lg bg-black-600 border border-black-400 text-white text-sm hover:bg-black-500 transition-all"
                    >
                      {token}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-12 md:py-16 mb-8">
        <div className="main-container">
          <div className="premium-card-dark p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Begin Your Test Flow?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Your grounding foundation is set. Step into the test flow to discover fragrances that align with your calibrated preferences.
            </p>
            <PremiumButton
              onClick={finish}
              variant="primary"
              size="lg"
            >
              Continue to Test Flow
            </PremiumButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
