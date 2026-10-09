import { wedding } from "@/data/wedding";

interface CoupleWordmarkProps {
  readonly className?: string;
}

/**
 * The couple's names set as a wordmark, with the ampersand in the script face.
 *
 * The script is used only for the ampersand: it is decorative, unambiguous to
 * read, and keeps the names themselves in Cormorant Garamond where they stay
 * legible at any size.
 */
export function CoupleWordmark({ className = "" }: CoupleWordmarkProps) {
  const { groom, bride } = wedding.couple;

  return (
    <span className={`wordmark ${className}`}>
      {/*
        The spaces are real characters, not margins: they give the browser a
        break opportunity so the names wrap to two lines on narrow screens
        instead of forming one unbreakable word. The script ampersand has a
        tight right side bearing, so it gets a little optical padding.
      */}
      {groom}{" "}
      <span className="font-script pr-[0.12em] font-normal tracking-normal">&amp;</span>{" "}
      {bride}
    </span>
  );
}
