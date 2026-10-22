/**
 * Editorial photography used by the marketing pages.
 *
 * Every image here is Mindfire's own: completed estates, homes, and sites
 * photographed by the team. They live in `public/hero/` and `public/projects/`
 * as WebP with all metadata (including any GPS tags) stripped at conversion.
 *
 * OWNER ACTION AVAILABLE - the source files are phone and WhatsApp exports,
 * 650–1280px on the long edge. That is enough for gallery tiles but soft on a
 * large retina hero. Dropping the camera originals in under the same file
 * names sharpens every placement without a code change.
 *
 * Alt text and captions describe what is in the frame and nothing more. No
 * photograph is attributed to a named estate or district, because that
 * mapping has not been supplied - add it here when it is.
 */

export interface StagePhoto {
    src: string;
    alt: string;
}

/**
 * The three plates in the home hero's 3D stage, in depth order. `front` is the
 * plate nearest the viewer and carries the property being showcased; `left`
 * and `right` sit behind it and are atmosphere.
 */
export const HERO_STAGE: { front: StagePhoto; left: StagePhoto; right: StagePhoto } = {
    front: {
        src: '/hero/estate-night.webp',
        alt: 'Completed Mindfire estate at night, with lit townhouses around a fenced courtyard',
    },
    left: {
        src: '/hero/estate-villas.webp',
        alt: 'Two completed three-storey villas with arched balconies on a landscaped estate road',
    },
    right: {
        src: '/hero/residence-white.webp',
        alt: 'Completed white two-storey residence with a red roof and an interlocked forecourt',
    },
};

/** The 4:3 elevation shot in the featured-property showcase. */
export const FEATURE_ELEVATION: StagePhoto = {
    src: '/hero/estate-courtyard.webp',
    alt: 'Completed Mindfire estate: detached villas around a central courtyard and pool',
};

/** The 4:5 interior used beside the "what we check" list. */
export const INTERIOR_PORTRAIT: StagePhoto = {
    src: '/hero/lobby-interior.webp',
    alt: 'Finished lobby in a Mindfire residence, with a glass-balustrade staircase and a passenger lift',
};

export interface ProjectPhoto extends StagePhoto {
    /** Short line shown under the photograph. */
    caption: string;
}

export interface BuildStage {
    title: string;
    body: string;
    photos: ProjectPhoto[];
}

/**
 * The build sequence, told with photographs from Mindfire's own sites. Four
 * stages, four photographs each, in the order the work happens.
 */
export const BUILD_STAGES: BuildStage[] = [
    {
        title: 'Land and design',
        body: 'Every project starts on foot: walking the land, reading the ground, and engineering the site before a design is fixed.',
        photos: [
            {
                src: '/projects/land-site-inspection.webp',
                alt: 'Site inspection: three people walking a plot along a cleared path through farmland',
                caption: 'Walking the land',
            },
            {
                src: '/projects/land-hilltop-plots.webp',
                alt: 'Hilltop plots with foundation blockwork overlooking the city in morning haze',
                caption: 'Hilltop plots set out',
            },
            {
                src: '/projects/land-gabion-wall.webp',
                alt: 'Stepped gabion retaining wall built against a cut slope',
                caption: 'Gabion wall retaining a sloped site',
            },
            {
                src: '/projects/design-townhouse-render.webp',
                alt: "Artist's impression of a row of white contemporary townhouses with roof pergolas",
                caption: "Artist's impression",
            },
        ],
    },
    {
        title: 'Structure',
        body: 'Columns, slabs, and frames are inspected as they go up. Buyers can visit at any stage and see the work for themselves.',
        photos: [
            {
                src: '/projects/structure-column-formwork.webp',
                alt: 'Reinforced columns in timber formwork rising from a raised foundation',
                caption: 'Columns in formwork',
            },
            {
                src: '/projects/structure-concrete-pour.webp',
                alt: 'Site crew carrying concrete during a slab pour, with a hoist and propped formwork',
                caption: 'Slab pour day',
            },
            {
                src: '/projects/structure-blockwork-roof.webp',
                alt: 'Three-storey block building with its roof structure going on',
                caption: 'Blockwork complete, roof going on',
            },
            {
                src: '/projects/structure-steel-frame.webp',
                alt: 'Steel frame members set out on a ground-floor slab, seen through scaffolding',
                caption: 'Steel frame on the slab',
            },
        ],
    },
    {
        title: 'Finishing',
        body: 'Rendering, cladding, roofing, and joinery: the stage where specifications either hold or slip, and where we spend the most time on site.',
        photos: [
            {
                src: '/projects/finishing-townhouse-facade.webp',
                alt: 'White contemporary townhouse under scaffolding, with glass balconies and a roof pergola',
                caption: 'Townhouse at façade stage',
            },
            {
                src: '/projects/finishing-stone-facade.webp',
                alt: 'Stone-clad pilasters on a large building under scaffolding, lit at night',
                caption: 'Stone cladding, night shift',
            },
            {
                src: '/projects/finishing-terrace-row.webp',
                alt: 'Row of terraced houses with red tiled roofs, rendering in progress behind scaffolding',
                caption: 'Terrace row, roofs on',
            },
            {
                src: '/projects/finishing-residence-render.webp',
                alt: 'Two-storey residence with arched balconies being rendered, ladders against the wall',
                caption: 'Residence being rendered',
            },
        ],
    },
    {
        title: 'Handover',
        body: 'Keys change hands after a final walk-through together, and our relationship with the property continues after payment.',
        photos: [
            {
                src: '/projects/handover-estate-street.webp',
                alt: 'Completed estate street lined with three-storey villas, lawns, and lamp posts',
                caption: 'Completed estate street',
            },
            {
                src: '/projects/handover-client-viewing.webp',
                alt: 'Clients viewing a completed white residence from its interlocked forecourt',
                caption: 'Viewing with clients',
            },
            {
                src: '/projects/handover-gated-duplex.webp',
                alt: 'Completed detached duplex behind a wrought-iron gate',
                caption: 'Detached duplex, completed',
            },
            {
                src: '/projects/handover-bedroom.webp',
                alt: 'Finished bedroom with tall windows, split-unit air conditioning, and tiled floor',
                caption: 'Finished interior',
            },
        ],
    },
];
