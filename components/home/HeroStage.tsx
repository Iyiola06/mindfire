'use client';

import React, { useEffect, useRef } from 'react';
import { HERO_STAGE } from '@/lib/media';

export interface StageFeature {
    /** Development or district name, shown as the chip's eyebrow. */
    eyebrow: string;
    /** Formatted price, already carrying its currency symbol. */
    price: string;
    /** Street or district line under the price. */
    location: string;
    specs: { value: string; label: string }[];
}

/**
 * The home hero's three-plate photographic stage.
 *
 * Three things move, all from one rAF loop rather than three listeners:
 *
 *   - an entrance, driven from `performance.now()` rather than from a
 *     transition, so it still completes if the tab was hidden at mount and
 *     rAF was throttled;
 *   - a small parallax tilt following the pointer;
 *   - a depth push as the stage scrolls away, so the plates fly toward the
 *     viewer and fade rather than simply sliding off.
 *
 * All of it is decoration over content that is already legible without it: if
 * the loop never runs, the plates sit in their laid-out positions at full
 * opacity. `prefers-reduced-motion` takes exactly that path.
 */
export const HeroStage: React.FC<{ feature: StageFeature }> = ({ feature }) => {
    const rigRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rig = rigRef.current;
        const stage = stageRef.current;
        if (!rig || !stage) return;

        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        let raf = 0;
        let enterStart: number | null = null;
        let mx = 0;
        let my = 0;
        let px = 0;
        let py = 0;

        const onPointer = (e: PointerEvent) => {
            mx = (e.clientX / window.innerWidth) * 2 - 1;
            my = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', onPointer, { passive: true });

        const easeOut = (t: number) => 1 - (1 - t) ** 3;

        const loop = () => {
            raf = requestAnimationFrame(loop);

            px += (mx - px) * 0.06;
            py += (my - py) * 0.06;

            if (enterStart === null) enterStart = performance.now();
            const entered = easeOut(Math.min(1, (performance.now() - enterStart) / 1300));

            const rect = stage.getBoundingClientRect();
            const vh = window.innerHeight;
            // Only starts once the stage's bottom edge has risen past ~70% of
            // the viewport, so the effect belongs to leaving rather than to
            // any scroll at all.
            const away = Math.min(1, Math.max(0, (vh * 0.7 - rect.bottom) / (vh * 0.55)));

            const z = (1 - entered) * -300 + away * 260;
            const ry = px * 5 * entered;
            const rx = -py * 3.4 * entered;

            rig.style.transform = `translateZ(${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
            rig.style.opacity = Math.max(0, Math.min(entered, 1 - away * 1.15)).toFixed(3);
        };

        loop();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onPointer);
        };
    }, []);

    return (
        <div
            ref={stageRef}
            aria-hidden={false}
            className="relative mx-auto mt-[clamp(3rem,7vh,5.25rem)] h-[clamp(23.75rem,58vw,38.75rem)] max-w-[80rem] [perspective-origin:50%_40%] [perspective:1500px]"
        >
            <div ref={rigRef} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
                {/* Behind left */}
                <div className="absolute left-[9%] top-[16%] aspect-[10/14] w-[21%] overflow-hidden rounded-surface shadow-stage [transform:translateZ(-150px)_rotateY(11deg)]">
                    <img
                        src={HERO_STAGE.left.src}
                        alt={HERO_STAGE.left.alt}
                        className="h-full w-full object-cover object-[center_30%]"
                        loading="lazy"
                    />
                </div>

                {/* Behind right */}
                <div className="absolute right-[9%] top-[16%] aspect-[10/14] w-[21%] overflow-hidden rounded-surface shadow-stage [transform:translateZ(-150px)_rotateY(-11deg)]">
                    <img
                        src={HERO_STAGE.right.src}
                        alt={HERO_STAGE.right.alt}
                        className="h-full w-full object-cover object-[center_40%]"
                        loading="lazy"
                    />
                </div>

                {/* Front centre. This is the only stage image above the fold on
                    every viewport, so it is the one that gets fetch priority. */}
                <div className="absolute left-1/2 top-[2%] aspect-[4/5] w-[min(34%,26.25rem)] -translate-x-1/2 overflow-hidden rounded-showcase shadow-stage-front [transform:translateX(-50%)_translateZ(70px)]">
                    <img
                        src={HERO_STAGE.front.src}
                        alt={HERO_STAGE.front.alt}
                        className="h-full w-full object-cover object-[center_55%]"
                        fetchPriority="high"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(200deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_28%)]"
                    />
                </div>

                {/* Price chip, floating in front of the plates. Hidden below sm
                    where it would cover the photograph it annotates. */}
                <div className="glass-elevated absolute bottom-[10%] left-[10%] hidden flex-col gap-0.5 rounded-surface px-5 py-4 sm:flex md:left-[24%] [transform:translateZ(150px)]">
                    <span className="text-eyebrow-sm font-semibold uppercase text-brand-500">
                        {feature.eyebrow}
                    </span>
                    <span className="font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-bold tracking-[-0.02em] text-content">
                        {feature.price}
                    </span>
                    <span className="text-body-sm font-medium text-content-muted">{feature.location}</span>
                </div>

                {/* Specification chip */}
                <div className="glass-elevated absolute right-[8%] top-[4%] hidden gap-4 rounded-surface px-5 py-3.5 md:right-[23%] lg:flex [transform:translateZ(190px)]">
                    {feature.specs.map(({ value, label }) => (
                        <span key={label} className="flex flex-col">
                            <b className="font-display text-[1.0625rem] font-bold text-content">{value}</b>
                            <span className="text-[0.65rem] uppercase tracking-[0.08em] text-content-muted">
                                {label}
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
