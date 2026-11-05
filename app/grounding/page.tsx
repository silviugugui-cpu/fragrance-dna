"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getUserScopedStorageKey } from "@/lib/auth/userScope";
import { persistUserProfilePatch } from "@/lib/auth/persistentProfile";
import { buildSeed } from "@/lib/engine/seedBuilder";
import { buildUserVector } from "@/lib/engine/userVectorBuilder";
import { mergeGroundingVectorIntoSession } from "@/lib/dnaSession";
import { getOrCreateUserProfile, updateUserVector } from "@/lib/engine/userProfileManager";
import { getPhase1Flags } from "@/lib/intelligence/flags/phase1Flags";
import { runGroundingDualWrite } from "@/lib/intelligence/grounding/groundingDualWrite";
import { useLanguage } from "@/lib/i18n";
import { usePublicTheme } from "@/lib/theme/PublicThemeProvider";
import { PageShell, SectionHeader, PremiumButton } from "@/components/design-system";
import { GROUNDING_TOKENS as TOKENS, emptyGroundingState, restoreGroundingState, groundingChoices, type GroundingZone as Zone } from "@/lib/engine/groundingPreferences";
import { getPriorityCopy } from "@/lib/i18n/priorityCopy";


export default function GroundingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t, locale } = useLanguage();
  const copy = getPriorityCopy(locale);
  const [loadError, setLoadError] = useState(false);
  const { assets, theme } = usePublicTheme();
  const groundingBackground = (image: string) => theme === "normal"
    ? `url('${image}')`
    : `linear-gradient(160deg, rgba(9,9,10,0.44) 0%, rgba(13,11,9,0.36) 50%, rgba(9,9,10,0.44) 100%), url('${image}')`;
  const [isGroundingReady, setIsGroundingReady] = useState(false);
  const draggedTokenRef = useRef<string | null>(null);
  const [state, setState] = useState<Record<string, Zone>>(
    emptyGroundingState()
  );

  useEffect(() => {
    if (isLoading) return;
    setState(emptyGroundingState());
    setLoadError(false);
    try {
      const stored = localStorage.getItem(getUserScopedStorageKey("fragrance_grounding", user?.id));
      if (stored) {
        setState(restoreGroundingState(JSON.parse(stored)));
      }
    } catch (error) {
      console.error("Unable to restore grounding preferences", error);
      setLoadError(true);
    }
    setIsGroundingReady(true);
  }, [isLoading, user?.id]);

  const loveTokens = Object.entries(state)
    .filter(([, zone]) => zone === "love")
    .map(([token]) => token);
  const neutralTokens = Object.entries(state)
    .filter(([, zone]) => zone === "neutral")
    .map(([token]) => token);
  const hateTokens = Object.entries(state)
    .filter(([, zone]) => zone === "hate")
    .map(([token]) => token);
  const movedFromNeutralCount = loveTokens.length + hateTokens.length;
  const canContinueToTest = movedFromNeutralCount >= 2;

  function setTokenZone(token: string, zone: Zone) {
    setState((prev) => ({
      ...prev,
      [token]: zone,
    }));
  }

  function handleTokenDrop(event: DragEvent<HTMLDivElement>, zone: Zone) {
    event.preventDefault();
    const token = event.dataTransfer.getData("text/plain") || draggedTokenRef.current;
    if (token && TOKENS.includes(token)) {
      setTokenZone(token, zone);
    }
    draggedTokenRef.current = null;
  }

  function handleTokenDragStart(event: DragEvent<HTMLDivElement>, token: string) {
    draggedTokenRef.current = token;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", token);
  }

  function renderTokenControl(token: string, tone: "love" | "neutral" | "hate") {
    const tokenLabel = t.grounding.tokens[token] ?? token;
    const toneClass =
      tone === "love"
        ? "bg-gold/20 border-gold/40 text-gold"
        : tone === "hate"
          ? "bg-black-400/20 border-black-400/40 text-black-200"
          : "bg-warm-400/20 border-warm-400/40 text-warm-300";

    return (
      <div
        key={token}
        draggable
        onDragStart={(event) => handleTokenDragStart(event, token)}
        onDragEnd={() => { draggedTokenRef.current = null; }}
        className={`inline-flex items-center overflow-hidden rounded-lg border ${toneClass} transition-all`}
      >
        <button
          type="button"
          onClick={() => setTokenZone(token, "unrated")}
          className="px-2 py-2 text-xs"
          aria-label={`${copy.unrated}: ${tokenLabel}`}
          title={copy.unrated}
        >
          ?
        </button>
        <button
          type="button"
          onClick={() => setTokenZone(token, "hate")}
          className="h-full border-r border-red-400/50 bg-red-500/20 px-2 py-2 text-xs font-bold text-red-300 hover:bg-red-500/35"
          aria-label={t.grounding.moveToAvoidAria(tokenLabel)}
          title={t.grounding.moveToAvoidTitle}
        >
          X
        </button>
        <button
          type="button"
          onClick={() => setTokenZone(token, "neutral")}
          className="px-3 py-2 text-sm font-medium"
          aria-label={t.grounding.moveToNeutralAria(tokenLabel)}
          title={t.grounding.moveToNeutralTitle}
        >
          {tokenLabel}
        </button>
        <button
          type="button"
          onClick={() => setTokenZone(token, "love")}
          className="h-full border-l border-emerald-400/50 bg-emerald-500/20 px-2 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/35"
          aria-label={t.grounding.moveToLoveAria(tokenLabel)}
          title={t.grounding.moveToLoveTitle}
        >
          ✓
        </button>
      </div>
    );
  }

  function buildEngineInput() {
    return groundingChoices(state);
  }

  async function finish() {
    if (!canContinueToTest) return;
    const engineInput = buildEngineInput();
    const seed = buildSeed(engineInput);
    const userVector = buildUserVector(seed);

    localStorage.setItem(getUserScopedStorageKey("fragrance_seed", user?.id), JSON.stringify(seed));
    localStorage.setItem(getUserScopedStorageKey("fragrance_vector", user?.id), JSON.stringify(userVector));
    localStorage.setItem(getUserScopedStorageKey("fragrance_grounding", user?.id), JSON.stringify(engineInput));
    persistUserProfilePatch({ grounding: engineInput, seed, groundingVector: userVector });

    const groundingSession = mergeGroundingVectorIntoSession(userVector, user?.id, {
      love: engineInput.love,
      neutral: engineInput.neutral,
      redFlag: engineInput.red_flag,
    });
    const profile = getOrCreateUserProfile(user?.id);
    const updatedProfile = updateUserVector(profile, groundingSession.currentVector, groundingSession.summary?.confidenceScore ?? 0, groundingSession.answeredOrder.length);

    const phase1Flags = getPhase1Flags();
    if (phase1Flags.eventsWriteEnabled || phase1Flags.phase1ShadowValidation) {
      try {
        const dualWriteResult = await runGroundingDualWrite({
          userId: updatedProfile.userId,
          engineInput,
          seed: seed as Record<string, unknown>,
          userVector: userVector as unknown as Record<string, number>,
          flags: phase1Flags,
        });

        localStorage.setItem("phase1_grounding_dual_write_status", JSON.stringify(dualWriteResult));
      } catch (error) {
        localStorage.setItem(
          "phase1_grounding_dual_write_status",
          JSON.stringify({
            attempted: true,
            persisted: false,
            published: false,
            parityValidated: false,
            parityMatches: false,
            reusedIdempotency: false,
            errors: [error instanceof Error ? error.message : "grounding_dual_write_failed"],
            differences: [],
          })
        );
      }
    }

    router.push("/test");
  }

  const groupedTokens: Record<Zone, string[]> = {
    unrated: TOKENS.filter((token) => state[token] === "unrated"),
    love: loveTokens,
    neutral: neutralTokens,
    hate: hateTokens,
  };

  if (isLoading || !isGroundingReady) {
    return <PageShell className="home-aligned-page"><div className="main-container py-16 text-sm text-gray-300">{t.grounding.loading}</div></PageShell>;
  }

  return (
    <PageShell className="home-aligned-page">
      {/* Interactive Zones Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            title={t.grounding.sectionTitle}
            description={t.grounding.sectionDescription}
            className="mb-10"
          />
          <p className="mb-6 text-sm text-gray-300">{copy.groundingHelp}</p>
          {loadError && <p role="alert" className="mb-4 text-red-300">{copy.loadError}</p>}
          <div data-zone="unrated" className="premium-card-dark mb-6 p-6" onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleTokenDrop(event, "unrated")}>
            <h3 className="mb-4 text-xl font-bold">{copy.unrated}</h3>
            <div className="flex flex-wrap gap-2">{groupedTokens.unrated.map((token) => renderTokenControl(token, "neutral"))}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Neutral Zone */}
            <div
              data-zone="neutral"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleTokenDrop(event, "neutral")}
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-warm-400/30 hover:border-warm-400/60 transition-all min-h-96 flex flex-col"
              style={{
                backgroundImage:
                  groundingBackground(assets.groundingNeutral),
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-warm-300 font-bold mb-2">{t.grounding.neutralLabel}</p>
                <h3 className="text-xl font-bold text-white mb-3">{t.grounding.neutralTitle}</h3>
                <p className="text-base text-gray-400">
                  {t.grounding.neutralDescription}
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {groupedTokens.neutral.length > 0 ? (
                  groupedTokens.neutral.map((token) => renderTokenControl(token, "neutral"))
                ) : (
                  <p className="text-sm text-gray-500 italic">{t.grounding.neutralEmpty}</p>
                )}
              </div>
            </div>

            {/* Attraction Zone */}
            <div
              data-zone="love"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleTokenDrop(event, "love")}
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-emerald-400/30 hover:border-emerald-400/60 transition-all min-h-96 flex flex-col"
              style={{
                backgroundImage:
                  groundingBackground(assets.groundingLove),
                backgroundSize: "cover",
                backgroundPosition: "right center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-gold font-bold mb-2">{t.grounding.loveLabel}</p>
                <h3 className="text-xl font-bold text-white mb-3">{t.grounding.loveTitle}</h3>
                <p className="text-base text-gray-400">
                  {t.grounding.loveDescription}
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {groupedTokens.love.length > 0 ? (
                  groupedTokens.love.map((token) => renderTokenControl(token, "love"))
                ) : (
                  <p className="text-sm text-gray-500 italic">{t.grounding.loveEmpty}</p>
                )}
              </div>
            </div>

            {/* Avoidance Zone */}
            <div
              data-zone="hate"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleTokenDrop(event, "hate")}
              className="premium-card-dark bg-cover bg-center bg-no-repeat p-8 border-2 border-red-400/30 hover:border-red-400/60 transition-all min-h-96 flex flex-col"
              style={{
                backgroundImage:
                  groundingBackground(assets.groundingAvoid),
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider text-black-200 font-bold mb-2">{t.grounding.avoidLabel}</p>
                <h3 className="text-xl font-bold text-white mb-3">{t.grounding.avoidTitle}</h3>
                <p className="text-base text-gray-400">
                  {t.grounding.avoidDescription}
                </p>
              </div>

              <div className="flex-1 space-y-2">
                {groupedTokens.hate.length > 0 ? (
                  groupedTokens.hate.map((token) => renderTokenControl(token, "hate"))
                ) : (
                  <p className="text-sm text-gray-500 italic">{t.grounding.avoidEmpty}</p>
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
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.grounding.readyTitle}</h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                {t.grounding.readyDescription}
              </p>
              <PremiumButton
                onClick={finish}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto sm:min-w-[360px] min-h-[68px] px-8 sm:px-10 py-4 sm:py-0 text-[0.92rem] sm:text-[1.02rem] font-bold leading-tight tracking-[0.06em] sm:tracking-[0.08em] uppercase text-center whitespace-normal border-2 border-gold/65 shadow-[0_14px_28px_rgba(212,175,120,0.24)] hover:shadow-[0_18px_34px_rgba(212,175,120,0.3)]"
              >
                {t.grounding.continueButton}
              </PremiumButton>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
