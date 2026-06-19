'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Fragrance, AttributeKey, AnswerRecord } from '../../lib/types';
import fragrances from '../../lib/db.json';
import {
  buildSessionFromAnswers,
  findNextUnansweredIndex,
  loadDnaSession,
  saveDnaSession,
} from '@/lib/dnaSession';

const attributes: { key: AttributeKey; label: string; description: string }[] = [
  { key: 'elegant', label: 'Elegant', description: 'Refines the composition with satin-smooth depth.' },
  { key: 'carismatic', label: 'Charismatic', description: 'Adds magnetic presence and a memorable aura.' },
  { key: 'misterios', label: 'Mysterious', description: 'Lends an intriguing veil of enigma and shadow.' },
  { key: 'citrice', label: 'Citrus', description: 'Brings sparkling brightness and fresh zest.' },
  { key: 'miere', label: 'Honeyed', description: 'Infuses warm gourmand sweetness and glow.' },
  { key: 'lemn', label: 'Woody', description: 'Grounds the scent with soft, smoky woods.' }
];

const defaultAnswers: AnswerRecord = {
  elegant: 50,
  carismatic: 50,
  misterios: 50,
  citrice: 50,
  miere: 50,
  lemn: 50
};

const STORAGE_KEY = 'fragranceDNA-answers';

export default function TestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});

  useEffect(() => {
    const session = loadDnaSession();
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
      } catch {
        setAnswers({});
      }
    }
    if (typeof session.currentIndex === 'number') {
      setCurrentIndex(Math.min(session.currentIndex, fragrances.length - 1));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    const nextSession = buildSessionFromAnswers(answers, currentIndex, loadDnaSession());
    saveDnaSession(nextSession);
  }, [answers, currentIndex]);

  const currentFragrance = fragrances[currentIndex] as Fragrance;
  const answeredIds = useMemo(() => Object.keys(answers), [answers]);
  const isComplete = answeredIds.length >= fragrances.length;
  const liveSession = useMemo(
    () => buildSessionFromAnswers(answers, currentIndex, loadDnaSession()),
    [answers, currentIndex]
  );

  const handleSliderChange = (key: AttributeKey, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentFragrance.id]: {
        ...((prev[currentFragrance.id] as AnswerRecord) ?? defaultAnswers),
        [key]: value
      }
    }));
  };

  const handleNext = () => {
    const nextAnswers = {
      ...answers,
      [currentFragrance.id]: currentAnswers,
    };

    setAnswers(nextAnswers);

    const nextUnanswered = findNextUnansweredIndex(nextAnswers, currentIndex);
    if (nextUnanswered !== -1) {
      setCurrentIndex(nextUnanswered);
      return;
    }

    const completedSession = buildSessionFromAnswers(nextAnswers, currentIndex, liveSession);
    saveDnaSession(completedSession);
    router.push('/dna');
  };

  const currentAnswers = answers[currentFragrance.id] ?? defaultAnswers;
  const remaining = Math.max(0, fragrances.length - answeredIds.length);
  const progress = Math.round((answeredIds.length / fragrances.length) * 100);

  return (
    <main className="main-container">
      <section className="glass p-10 space-y-10">
        <header className="space-y-6">
          <div className="space-y-3 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.45em] text-[#b59f70]/70">
              Olfactory discovery journey
            </p>
            <h1 className="text-5xl font-light tracking-[0.04em] text-white">
              Explore your scent preferences through a guided sensory ritual
            </h1>
            <p className="text-base leading-8 text-[#d5c9b8]/85">
              Each moment reveals a refined fragrance mood. Move slowly, trust your instinct, and shape the personality of your next signature scent.
            </p>
          </div>

          <div className="rounded-[32px] bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#b59f70]/70">Stage</p>
                <p className="mt-2 text-3xl font-semibold text-white">{currentIndex + 1} of {fragrances.length}</p>
              </div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#c7a86b] to-[#d0b478] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-3 text-sm text-[#d5c9b8]/80">{progress}% through your fragrance discovery</p>
              </div>
            </div>
          </div>
        </header>

        <section className="glass-card p-10 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#c7a86b]/80">Fragrance moment</p>
              <h2 className="text-4xl font-light tracking-[0.04em] text-white">{currentFragrance.name}</h2>
              <p className="mt-2 max-w-xl text-[#d5c9b8]/80">A moment curated to reveal how you feel about warmth, brightness, depth and allure. Let this scent narrative guide your preference.</p>
            </div>
            <div className="rounded-full bg-white/5 px-5 py-3 text-center text-sm uppercase tracking-[0.24em] text-[#e8dfd1] shadow-[inset_0_0_0_1px_rgba(199,168,107,0.08)]">
              {remaining} moments remain
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {attributes.map((attribute) => (
              <div key={attribute.key} className="rounded-[30px] border border-white/10 bg-[#07080c]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-[#b59f70]/70">{attribute.label}</p>
                    <h3 className="mt-2 text-xl font-medium text-white">{attribute.description}</h3>
                  </div>
                  <span className="text-sm text-[#d5c9b8]/80">{currentAnswers[attribute.key]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentAnswers[attribute.key]}
                  onChange={(event) => handleSliderChange(attribute.key, Number(event.target.value))}
                  className="mt-6 w-full accent-[#c7a86b]"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-[28px] bg-white/5 px-6 py-5 text-sm text-[#d5c9b8]/85 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <p className="uppercase tracking-[0.3em] text-[#b59f70]/70">Current rhythm</p>
            <p className="mt-2">You have refined {answeredIds.length} fragrance moments so far.</p>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[#b59f70]/65">
              Live confidence {liveSession.summary?.confidenceScore ?? liveSession.snapshots.at(-1)?.confidenceScore ?? 0}%
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dna"
              className="inline-flex items-center justify-center rounded-full border border-[#c7a86b]/35 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#e7dfd1] transition duration-300 hover:border-[#c7a86b] hover:bg-white/10"
            >
              View Current DNA
            </Link>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-full bg-[#c7a86b] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition duration-300 hover:bg-[#d0b478]"
            >
              {isComplete ? 'View final DNA' : 'Continue ritual'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
