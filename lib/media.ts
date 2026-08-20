/**
 * Editorial photography used by the marketing pages.
 *
 * OWNER ACTION AVAILABLE — replace with Mindfire's own photography.
 *
 * The design these pages were built from ships four bespoke renders
 * (`strip-dusk`, `strip-res`, `strip-town`, `elevation`). They could not be
 * exported from the design project — the file API truncates at 256 KiB and
 * every one of them is larger — so the stand-ins below are licensed stock of
 * the same subject and crop.
 *
 * To restore the intended images, drop the four files into `public/hero/` and
 * change these constants to the local paths. Nothing else has to change: every
 * consumer reads them from here, and the alt text is already written for the
 * subject rather than for the specific photograph.
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
        src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80',
        alt: 'Contemporary Abuja townhouse at dusk with lit interiors',
    },
    left: {
        src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=700&q=80',
        alt: 'Apartment block at dusk with balconies lit from within',
    },
    right: {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80',
        alt: 'Residence facade with stone cladding and full-height glazing',
    },
};

/** The 4:3 elevation shot in the featured-property showcase. */
export const FEATURE_ELEVATION: StagePhoto = {
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    alt: 'Elevation of a completed Mindfire development at dusk',
};

/** The 4:5 interior used beside the "what we check" list. */
export const INTERIOR_PORTRAIT: StagePhoto = {
    src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
    alt: 'Living area of a completed Mindfire residence with double-height glazing',
};
