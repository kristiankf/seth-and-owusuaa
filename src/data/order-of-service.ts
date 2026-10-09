/**
 * Order of service, transcribed verbatim from page 1 of WEDDING PROGRAM.pdf.
 * The wording and sequence are official — do not edit without the couple.
 */

export interface ServiceItem {
  readonly title: string;
  /** Person or group leading the item, where the programme names one. */
  readonly attribution?: string;
}

export const orderOfService: readonly ServiceItem[] = [
  { title: "Welcome Address by MC" },
  { title: "Opening Prayer" },
  { title: "Worship" },
  { title: "Praises" },
  { title: "Scripture Reading" },
  { title: "Song Ministration", attribution: "Hallelujah Tribe" },
  { title: "Bridal Procession" },
  { title: "Sermon", attribution: "Prophet Michael Divine" },
  { title: "Song Ministration & Offering" },
  { title: "Exchange of Vows" },
  { title: "Communion" },
  { title: "Signing of Certificate" },
  { title: "Second Offering & First Couple Dance" },
  { title: "Presentation of Certificate" },
  { title: "Vote of Thanks" },
  { title: "Announcements" },
  { title: "Closing Prayer & Benediction" },
];
