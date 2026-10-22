'use client';

import React, { useState } from 'react';

interface AnniversaryVideoProps {
    /** The 11-character YouTube id, not the full URL. */
    videoId: string;
    title: string;
    poster: { src: string; alt: string };
}

/**
 * A YouTube video behind a click-to-play poster.
 *
 * The embed iframe pulls roughly a megabyte of player script before anyone has
 * asked to watch, which on Nigerian mobile data is the difference between the
 * page feeling instant and not. Until the visitor presses play this is one
 * local image and a button; the iframe - from the no-cookie domain, so nothing
 * is set on a visitor who never plays - mounts on the press and autoplays,
 * because the press was the request.
 *
 * The poster is our own photograph rather than YouTube's thumbnail: it is
 * always available, matches the page, and does not depend on a third-party
 * image host.
 */
export function AnniversaryVideo({ videoId, title, poster }: AnniversaryVideoProps) {
    const [playing, setPlaying] = useState(false);

    return (
        <div className="relative aspect-video overflow-hidden rounded-showcase bg-black shadow-elevated">
            {playing ? (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="group absolute inset-0 h-full w-full"
                    aria-label={`Play video: ${title}`}
                >
                    <img
                        src={poster.src}
                        alt={poster.alt}
                        className="h-full w-full object-cover transition-transform duration-spatial ease-standard group-hover:scale-[1.02]"
                        loading="lazy"
                        decoding="async"
                    />
                    <span aria-hidden="true" className="absolute inset-0 bg-black/30" />
                    <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-white/95 text-brand-600 shadow-lift transition-transform duration-short ease-standard group-hover:scale-105 group-focus-visible:scale-105"
                    >
                        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" className="ml-1">
                            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.2-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
}
