"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildSeed } from "@/lib/engine/seedBuilder";
import { buildUserVector } from "@/lib/engine/userVectorBuilder";
import { mergeGroundingVectorIntoSession } from "@/lib/dnaSession";
import { getOrCreateUserProfile, updateUserVector } from "@/lib/engine/userProfileManager";

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
    <main className="main-container">
      <section className="glass p-10 space-y-10">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.42em] text-[#b59f70]/70">
            Olfactory Insight
          </p>
          <h1 className="text-5xl font-light tracking-[0.04em] text-white">
            Your fragrance identity in soft focus
          </h1>
          <p className="max-w-2xl leading-8 text-[#d5c9b8]/85">
            Place the scent moods into the spaces that feel most alive. This layer is a refined portrait of what you are attracted to, what you avoid, and what quietly influences your signature.
          </p>
        </div>

        <div className="rounded-[28px] bg-white/5 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.28)]">
          <p className="text-sm uppercase tracking-[0.28em] text-[#b59f70]/70">
            Persona reading
          </p>
          <div className="mt-6 space-y-4 text-[#e5dcc7]">
            {personaNarrative.map((line, index) => (
              <p key={index} className="text-base leading-8 text-[#d9d1c3]/95">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone}
              onDrop={(e) => onDrop(e, zone)}
              onDragOver={allowDrop}
              className="glass-card p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_40px_100px_rgba(199,168,107,0.18)]"
            >
              <p className="text-sm uppercase tracking-[0.35em] text-[#b59f70]/70">
                {sectionTitle[zone]}
              </p>
              <p className="mt-4 text-sm leading-7 text-[#d5c9b8]/80">
                {sectionTone[zone]}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {groupedTokens[zone].length > 0 ? (
                  groupedTokens[zone].map((token) => (
                    <div
                      key={token}
                      draggable
                      onDragStart={(e) => onDragStart(e, token)}
                      className="inline-flex cursor-grab items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e8dfd1] shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition duration-200 hover:bg-white/10"
                    >
                      {token}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#b8ab96]">No qualities assigned yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="glass p-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#b59f70]/70">
              Next step
            </p>
            <p className="text-xl font-medium text-white">
              Secure your grounding and step into a personalized fragrance flow.
            </p>
          </div>
          <button
            onClick={finish}
            className="rounded-full bg-[#c7a86b] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition duration-300 hover:bg-[#d0b478]"
          >
            Continue to Test Flow
          </button>
        </div>
      </section>
    </main>
  );
}
