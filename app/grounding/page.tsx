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

  function setTokenZone(token: string, zone: Zone) {
    setState((prev) => ({
      ...prev,
      [token]: zone,
    }));
  }

  function renderTokenControl(token: string, tone: "love" | "neutral" | "hate") {
    const toneClass =
      tone === "love"
        ? "bg-gold/20 border-gold/40 text-gold"
        : tone === "hate"
          ? "bg-black-400/20 border-black-400/40 text-black-200"
          : "bg-warm-400/20 border-warm-400/40 text-warm-300";

    return (
      <div
        key={token}
        className={`inline-flex items-center overflow-hidden rounded-lg border ${toneClass} transition-all`}
      >
        <button
          type="button"
          onClick={() => setTokenZone(token, "hate")}
          className="h-full border-r border-red-400/50 bg-red-500/20 px-2 py-2 text-xs font-bold text-red-300 hover:bg-red-500/35"
          aria-label={`Move ${token} to Avoid`}
          title="Move to Avoid"
        >
          X
        </button>
        <button
          type="button"
          onClick={() => setTokenZone(token, "neutral")}
          className="px-3 py-2 text-sm font-medium"
          aria-label={`Move ${token} to Neutral`}
          title="Move to Neutral"
        >
          {token}
        </button>
        <button
          type="button"
          onClick={() => setTokenZone(token, "love")}
          className="h-full border-l border-emerald-400/50 bg-emerald-500/20 px-2 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/35"
          aria-label={`Move ${token} to Love`}
          title="Move to Love"
        >
          ✓
        </button>
      </div>
    );
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
            description="Use the controls on each quality: X (left) sends it to Avoid, V (right) sends it to Love, and tapping the word keeps it in Neutral."
            className="mb-10"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Neutral Zone */}
            <div
              data-zone="neutral"
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-warm-400/30 hover:border-warm-400/60 transition-all min-h-96 flex flex-col"
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
                  groupedTokens.neutral.map((token) => renderTokenControl(token, "neutral"))
                ) : (
                  <p className="text-sm text-gray-500 italic">No qualities in Neutral right now...</p>
                )}
              </div>
            </div>

            {/* Attraction Zone */}
            <div
              data-zone="love"
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-emerald-400/30 hover:border-emerald-400/60 transition-all min-h-96 flex flex-col"
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
                  groupedTokens.love.map((token) => renderTokenControl(token, "love"))
                ) : (
                  <p className="text-sm text-gray-500 italic">No qualities in Love yet...</p>
                )}
              </div>
            </div>

            {/* Avoidance Zone */}
            <div
              data-zone="hate"
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-red-400/30 hover:border-red-400/60 transition-all min-h-96 flex flex-col"
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
                  groupedTokens.hate.map((token) => renderTokenControl(token, "hate"))
                ) : (
                  <p className="text-sm text-gray-500 italic">No qualities in Avoid yet...</p>
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
                className="w-full sm:w-auto sm:min-w-[360px] min-h-[68px] px-8 sm:px-10 py-4 sm:py-0 text-[0.92rem] sm:text-[1.02rem] font-bold leading-tight tracking-[0.06em] sm:tracking-[0.08em] uppercase text-center whitespace-normal border-2 border-gold/65 shadow-[0_14px_28px_rgba(212,175,120,0.24)] hover:shadow-[0_18px_34px_rgba(212,175,120,0.3)]"
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
