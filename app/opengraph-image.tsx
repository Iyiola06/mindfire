import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/seo'

/**
 * The default social card, generated at the edge rather than committed as a
 * PNG so the wording stays in sync with the site.
 *
 * Every page inherits this through `metadataBase`; property and article pages
 * override it with their own photograph, which is a stronger card when one
 * exists.
 */
export const runtime = 'edge'
export const alt = `${SITE.name} — premium property in Abuja`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px',
                    background: 'linear-gradient(160deg, #f2f5f4 0%, #fafafa 60%, #ffffff 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 999,
                            background: '#c98a4a',
                        }}
                    />
                    <div
                        style={{
                            fontSize: 22,
                            letterSpacing: 6,
                            textTransform: 'uppercase',
                            color: '#00897b',
                            fontWeight: 600,
                        }}
                    >
                        Abuja · Verified titles
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize: 74,
                        lineHeight: 1.05,
                        letterSpacing: '-0.03em',
                        color: '#121212',
                        fontWeight: 700,
                        maxWidth: 940,
                    }}
                >
                    Own exceptional property in Abuja’s most promising locations.
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 34, fontWeight: 800, color: '#141414', letterSpacing: '-0.01em' }}>
                            MINDFIRE
                        </div>
                        <div
                            style={{
                                fontSize: 16,
                                letterSpacing: 8,
                                textTransform: 'uppercase',
                                color: '#8a9296',
                                fontWeight: 600,
                                marginTop: 6,
                            }}
                        >
                            Homes
                        </div>
                    </div>
                    <div style={{ fontSize: 22, color: '#4b5459' }}>
                        Titles checked before listing
                    </div>
                </div>
            </div>
        ),
        size,
    )
}
