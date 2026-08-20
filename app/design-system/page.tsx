import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Chip } from '@/components/ui/Chip'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { INTERIOR_PORTRAIT } from '@/lib/media'
import {
    IconHeart, IconMapPin, IconBed, IconBath, IconArea, IconMenu, IconClose, IconSun, IconMoon,
    IconSend, IconCheck, IconSpinner, IconBuilding, IconGrid, IconUsers, IconEdit, IconTrash,
    IconPlus, IconLogout, IconImage, IconAlert, IconStar, IconChart, IconTag,
} from '@/components/icons'

export const metadata: Metadata = {
    title: 'Design system',
    robots: { index: false, follow: false },
}

const MATERIALS: ReadonlyArray<readonly [string, string, string]> = [
    ['glass-capsule', 'The floating nav, favourite buttons', '.66 / blur 24px'],
    ['glass-subtle', 'Small controls', '.72 / blur 20px'],
    ['glass-regular', 'Search panels, menus', '.78 / blur 32px'],
    ['glass-elevated', 'Hero chips, booking panels', '.86 / blur 40px'],
    ['glass-dark', 'Over bright photography', '.60 / blur 28px'],
]

const ICONS: ReadonlyArray<readonly [string, ReactNode]> = [
    ['IconHeart', <IconHeart key="h" />], ['IconMapPin', <IconMapPin key="m" />],
    ['IconBed', <IconBed key="b" />], ['IconBath', <IconBath key="ba" />],
    ['IconArea', <IconArea key="a" />], ['IconMenu', <IconMenu key="mn" />],
    ['IconClose', <IconClose key="c" />], ['IconSun', <IconSun key="s" />],
    ['IconMoon', <IconMoon key="mo" />], ['IconSend', <IconSend key="se" />],
    ['IconCheck', <IconCheck key="ch" />], ['IconSpinner', <IconSpinner key="sp" />],
    ['IconBuilding', <IconBuilding key="bu" />], ['IconGrid', <IconGrid key="g" />],
    ['IconUsers', <IconUsers key="u" />], ['IconEdit', <IconEdit key="e" />],
    ['IconTrash', <IconTrash key="t" />], ['IconPlus', <IconPlus key="p" />],
    ['IconLogout', <IconLogout key="lo" />], ['IconImage', <IconImage key="im" />],
    ['IconAlert', <IconAlert key="al" />], ['IconStar', <IconStar key="st" />],
    ['IconChart', <IconChart key="cr" />], ['IconTag', <IconTag key="tg" />],
]

const COLOURS: ReadonlyArray<readonly [string, string]> = [
    ['brand-700', 'bg-brand-700'], ['brand-600', 'bg-brand-600'],
    ['brand-500', 'bg-brand-500'], ['accent-500', 'bg-accent-500'],
    ['surface-2', 'bg-surface-2'],
]

const RADII: ReadonlyArray<readonly [string, string, string]> = [
    ['control', 'rounded-control', '0.75rem — inputs, small tiles'],
    ['surface', 'rounded-surface', '1.25rem — photo mounts inside a card'],
    ['panel', 'rounded-panel', '1.5rem — modals, dialogs'],
    ['showcase', 'rounded-showcase', '1.875rem — cards, feature panels'],
    ['pill', 'rounded-pill', '999px — every button and chip'],
]

const SHADOWS: ReadonlyArray<readonly [string, string, string]> = [
    ['soft', 'shadow-soft', 'Resting cards inside the admin'],
    ['hover', 'shadow-hover', 'Small hover lift'],
    ['ambient', 'shadow-ambient', 'Public cards and feature panels'],
    ['lift', 'shadow-lift', 'The hovered state of an ambient card'],
    ['elevated', 'shadow-elevated', 'Modals and portrait imagery'],
    ['cta', 'shadow-cta', 'Brand-tinted, primary buttons only'],
]

const CONTRACT: ReadonlyArray<readonly [string, string]> = [
    ['--nav-inset', '14px / 16px ≥768'],
    ['--nav-cap-h', '54px / 60px ≥768'],
    ['--nav-h', '82px / 92px ≥768'],
    ['--content-max', '1180px'],
    ['--dur-short', '200ms'],
    ['--dur-spatial', '500ms'],
]

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
    return (
        <section className="border-t border-hairline/10 py-section-sm">
            <h2 className="mb-1 font-display text-display-sm font-semibold tracking-tight text-content">{title}</h2>
            {note && <p className="mb-6 max-w-[46rem] text-body-sm text-content-muted">{note}</p>}
            {children}
        </section>
    )
}

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-bg">
            <div className="mx-auto max-w-content px-gutter py-section">
                <Eyebrow>Internal reference</Eyebrow>
                <h1 className="mt-3 font-display text-[clamp(2.125rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.03em] text-content">
                    Mindfire design system
                </h1>
                <p className="mt-4 max-w-2xl text-body-lg text-content-muted">
                    The acceptance surface. Toggle your OS between light and dark, enable reduced
                    transparency and reduced motion, and disable <code>backdrop-filter</code> in
                    DevTools — every state below must stay legible.
                </p>

                <Section
                    title="Glass materials over photography"
                    note="The real test: text legibility over an arbitrary image."
                >
                    <div className="relative overflow-hidden rounded-showcase">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={INTERIOR_PORTRAIT.src} alt="" className="h-[30rem] w-full object-cover" />
                        <div className="absolute inset-0 grid grid-cols-1 content-center gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                            {MATERIALS.map(([cls, use, spec]) => (
                                <div key={cls} className={`${cls} rounded-surface p-5`}>
                                    <p className="font-display text-base font-semibold">{cls}</p>
                                    <p className="text-body-sm opacity-80">{use}</p>
                                    <p className="mt-1 text-eyebrow-sm uppercase opacity-70">{spec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="Colour" note="accent-500 is for fills, borders, icons ≥24px, and large display text only — never small text.">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {COLOURS.map(([name, cls]) => (
                            <div key={name}>
                                <div className={`${cls} h-20 rounded-surface border border-hairline/10`} />
                                <p className="mt-2 text-eyebrow-sm uppercase text-content-muted">{name}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Type scale">
                    <div className="space-y-3">
                        <p className="font-display text-display-xl font-bold tracking-tight text-content">Display XL</p>
                        <p className="font-display text-display-lg font-bold tracking-tight text-content">Display LG</p>
                        <p className="font-display text-display-md font-bold tracking-tight text-content">Display MD</p>
                        <p className="font-display text-display-sm font-semibold tracking-tight text-content">Display SM</p>
                        <p className="text-body-lg text-content">Body large — introductory paragraphs.</p>
                        <p className="text-body text-content">Body — default reading size.</p>
                        <p className="text-body-sm text-content-muted">Body small — captions and metadata.</p>
                        <p className="text-eyebrow font-semibold uppercase text-content-muted">Eyebrow — section openers</p>
                        <p className="text-label font-semibold uppercase text-content-muted">Label — form fields</p>
                    </div>
                    <p className="mt-4 max-w-[46rem] text-body-sm text-content-muted">
                        Eyebrow and label are not interchangeable. The eyebrow&rsquo;s 0.3em tracking is
                        the loudest signal in the system and belongs above a section heading; a form
                        label at that tracking is slow to read.
                    </p>
                </Section>

                <Section title="Radius" note="One radius per role. Mixing them inside a single component is what makes an interface look assembled rather than designed.">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {RADII.map(([name, cls, note]) => (
                            <div key={name}>
                                <div className={`${cls} h-24 border border-hairline/15 bg-surface-2`} />
                                <p className="mt-2 font-mono text-eyebrow-sm uppercase text-content">{name}</p>
                                <p className="mt-0.5 text-[0.75rem] text-content-muted">{note}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Elevation" note="Long-throw shadows with negative spread: the shadow falls well below the element rather than ringing it.">
                    <div className="grid grid-cols-1 gap-6 rounded-panel bg-surface-2 p-8 sm:grid-cols-2 lg:grid-cols-3">
                        {SHADOWS.map(([name, cls, use]) => (
                            <div key={name} className={`${cls} rounded-showcase bg-surface p-5`}>
                                <p className="font-mono text-eyebrow-sm uppercase text-content">{name}</p>
                                <p className="mt-1 text-body-sm text-content-muted">{use}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Buttons — every state">
                    <div className="space-y-4">
                        {(['primary', 'secondary', 'outline', 'glass', 'ghost'] as const).map((variant) => (
                            <div key={variant} className="flex flex-wrap items-center gap-3">
                                <Button variant={variant} size="sm">Small</Button>
                                <Button variant={variant}>Default</Button>
                                <Button variant={variant} size="lg">Large</Button>
                                <Button variant={variant} icon={<IconSend size={16} />}>With icon</Button>
                                <Button variant={variant} disabled>Disabled</Button>
                            </div>
                        ))}
                        <div className="flex flex-wrap items-center gap-3">
                            <ButtonLink href="/design-system">ButtonLink — navigates</ButtonLink>
                            <ButtonLink href="/design-system" variant="outline">Secondary link</ButtonLink>
                        </div>
                        <p className="text-body-sm text-content-muted">
                            Tab through the rows above — every control must show a visible focus ring. A
                            control that navigates is a <code>ButtonLink</code>; a control that acts is a{' '}
                            <code>Button</code>.
                        </p>
                    </div>
                </Section>

                <Section title="Badges and chips" note="Badge is an uppercase status marker. Chip is body-sized and carries a fact.">
                    <div className="flex flex-wrap gap-2">
                        {(['primary', 'secondary', 'overlay', 'gray', 'red', 'green', 'blue', 'yellow'] as const).map((c) => (
                            <Badge key={c} color={c}>{c}</Badge>
                        ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                        <Chip>2 bedrooms</Chip>
                        <Chip>4,200 sq ft</Chip>
                        <Chip variant="solid">Over photography</Chip>
                        <Chip variant="accent">Featured</Chip>
                        <Chip variant="dark">Sold</Chip>
                    </div>
                </Section>

                <Section title="Icons" note="24px grid, currentColor, aria-hidden unless given a label. No icon font: these are inline SVG and cannot flash a ligature name while a stylesheet loads.">
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-8">
                        {ICONS.map(([name, node]) => (
                            <div key={name} className="flex flex-col items-center gap-2 rounded-surface bg-surface p-4 text-content">
                                {node}
                                <span className="text-center text-[0.65rem] text-content-muted">{name}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Motion" note="Hover each tile. Enable reduced motion and confirm they stop moving — including the scroll reveals on the public pages.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="cursor-pointer rounded-showcase bg-surface p-6 shadow-ambient transition-all duration-short ease-standard hover:-translate-y-1 hover:shadow-lift">
                            <p className="font-display font-semibold text-content">duration-short — 200ms</p>
                            <p className="text-body-sm text-content-muted">Controls, hover, focus. 180–240ms band.</p>
                        </div>
                        <div className="cursor-pointer rounded-showcase bg-surface p-6 shadow-ambient transition-all duration-spatial ease-spring hover:-translate-y-2 hover:shadow-elevated">
                            <p className="font-display font-semibold text-content">duration-spatial — 500ms</p>
                            <p className="text-body-sm text-content-muted">Sheets, gallery, page transitions. 400–600ms band.</p>
                        </div>
                    </div>
                </Section>

                <Section title="Layout contract">
                    <dl className="grid grid-cols-2 gap-4 text-body-sm sm:grid-cols-3 lg:grid-cols-6">
                        {CONTRACT.map(([k, v]) => (
                            <div key={k} className="rounded-surface bg-surface p-4">
                                <dt className="font-mono text-eyebrow-sm text-content-muted">{k}</dt>
                                <dd className="mt-1 font-display font-semibold text-content">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </Section>
            </div>
        </div>
    )
}
