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
  const movedFromNeutralCount = TOKENS.length - neutralTokens.length;
  const canContinueToTest = movedFromNeutralCount >= 2;


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

  const groupedTokens: Record<Zone, string[]> = {
    love: loveTokens,
    neutral: neutralTokens,
    hate: hateTokens,
  };

  return (
    <PageShell>
      {/* Interactive Zones Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            title="Classify Your Scent Qualities"
            description="Drag each quality into the zone where it belongs. Your selections shape the foundation of your fragrance DNA."
            className="mb-10"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attraction Zone */}
            <div
              onDrop={(e) => onDrop(e, "love")}
              onDragOver={allowDrop}
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-gold/30 hover:border-gold/60 transition-all min-h-96 cursor-drop flex flex-col"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, rgba(9, 9, 10, 0.44) 0%, rgba(13, 11, 9, 0.36) 50%, rgba(9, 9, 10, 0.44) 100%), url('/Pictures/Grounding/Attraction%20Patterns%20Love.png')",
              }}
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
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-warm-400/30 hover:border-warm-400/60 transition-all min-h-96 cursor-drop flex flex-col"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, rgba(9, 9, 10, 0.44) 0%, rgba(13, 11, 9, 0.36) 50%, rgba(9, 9, 10, 0.44) 100%), url('/Pictures/Grounding/Neutral%20Affinitie%20Balance.png')",
              }}
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
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-black-400/30 hover:border-black-400/60 transition-all min-h-96 cursor-drop flex flex-col"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, rgba(9, 9, 10, 0.44) 0%, rgba(13, 11, 9, 0.36) 50%, rgba(9, 9, 10, 0.44) 100%), url('/Pictures/Grounding/Avoidance%20Patterns%20Avoid.png')",
              }}
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

        </div>
      </section>

      {/* Action Section */}
      {canContinueToTest && (
        <section className="py-12 md:py-16 mb-8 -mt-[2cm]">
          <div className="main-container">
            <div className="premium-card-dark p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Begin Your Test Flow?</h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Continue sorting until all relevant scent qualities are placed, then press the button to move into the test flow. Classifying more scent qualities improves profile precision and recommendation quality.
              </p>
              <PremiumButton
                onClick={finish}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto sm:min-w-[360px] h-[68px] px-10 text-[1.02rem] font-bold tracking-[0.08em] uppercase border-2 border-gold/65 shadow-[0_14px_28px_rgba(212,175,120,0.24)] hover:shadow-[0_18px_34px_rgba(212,175,120,0.3)]"
              >
                I'm done sorting, continue to testing
              </PremiumButton>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
