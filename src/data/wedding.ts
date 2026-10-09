/**
 * Single source of truth for the couple's wedding details.
 *
 * Every value here is taken from the supplied wedding programme or confirmed
 * by the couple. Where a detail has not been confirmed it is `null` rather
 * than guessed, and the UI omits it instead of rendering a broken affordance.
 */

export interface WeddingVenue {
  readonly name: string;
  readonly location: string;
  /**
   * Verified Google Maps destination for the ceremony.
   *
   * While this is `null` the venue section renders the address text only
   * and no directions button is shown.
   */
  readonly mapsUrl: string | null;
}

export interface WeddingCeremony {
  /** Machine-readable date, used for `<time dateTime>`. */
  readonly isoDate: string;
  readonly dateShort: string;
  readonly dateDisplay: string;
  readonly dateWithWeekday: string;
  readonly timeDisplay: string;
}

export interface WeddingRsvpContact {
  readonly name: string;
  /** Guest-facing number, spaced as on the printed card. */
  readonly phoneDisplay: string;
  /** International `tel:` target for the same Ghana number. */
  readonly phoneHref: string;
}

export interface WeddingConfig {
  readonly couple: {
    readonly groom: string;
    readonly bride: string;
    readonly combined: string;
    readonly initials: string;
  };
  readonly ceremony: WeddingCeremony;
  readonly venue: WeddingVenue;
  readonly rsvp: readonly WeddingRsvpContact[];
  readonly hashtag: string;
  readonly familyLine: string;
  readonly closingMessage: string;
  /** Slug of the hero photograph in the generated image manifest. */
  readonly heroImageSlug: string;
  readonly heroImageAlt: string;
}

export const wedding: WeddingConfig = {
  couple: {
    groom: "Seth",
    bride: "Owusuaa",
    combined: "Seth & Owusuaa",
    initials: "S & O",
  },
  ceremony: {
    isoDate: "2026-10-10T11:00",
    dateShort: "10.10.2026",
    dateDisplay: "10 October 2026",
    dateWithWeekday: "Saturday, 10 October 2026",
    timeDisplay: "11:00 AM",
  },
  venue: {
    name: "God's Dream Church International",
    location: "Tantra Hills",
    mapsUrl: "https://maps.app.goo.gl/zkKnyzgr7krQ16K5A",
  },
  rsvp: [
    {
      name: "Fokuo",
      phoneDisplay: "055 343 2283",
      phoneHref: "tel:+233553432283",
    },
    {
      name: "Asiedu",
      phoneDisplay: "050 186 8211",
      phoneHref: "tel:+233501868211",
    },
  ],
  hashtag: "#GODWILLED2026",
  familyLine: "Together with their families",
  closingMessage: "Thank you for being part of our special day.",
  heroImageSlug: "img-1613",
  heroImageAlt:
    "Seth and Owusuaa dressed in black, looking at one another against a warm golden-brown backdrop",
};
