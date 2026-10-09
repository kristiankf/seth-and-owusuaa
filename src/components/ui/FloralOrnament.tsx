/**
 * Line-art floral ornament echoing the border of the printed programme.
 *
 * Drawn as a single inline SVG with `currentColor` strokes so it inherits the
 * surrounding text colour and stays crisp at any size. Purely decorative, so
 * it is always hidden from assistive technology.
 */

interface LeafPlacement {
  readonly x: number;
  readonly y: number;
  readonly rotate: number;
  readonly scale: number;
}

/** A single lens-shaped leaf, drawn from its stem end at the origin. */
const LEAF_PATH = "M0 0C5.2-4.4 12.4-3.2 16 0C12.4 3.2 5.2 4.4 0 0Z";

/**
 * Distributes leaves along the stem, alternating sides and tapering towards
 * the tip so the spray reads as hand-drawn rather than mechanical.
 */
function sprigLeaves(count: number): LeafPlacement[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const side = index % 2 === 0 ? -1 : 1;

    return {
      x: 14 + t * 84,
      y: -(t * t) * 9,
      rotate: side * (36 - t * 14) - t * 16,
      scale: 1 - t * 0.52,
    };
  });
}

const SPRIG_LEAVES = sprigLeaves(7);

function Sprig() {
  return (
    <g>
      <path d="M8 3C38 1 72-2 104-9" />
      {SPRIG_LEAVES.map((leaf, index) => (
        <path
          key={index}
          d={LEAF_PATH}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
        />
      ))}
      <circle cx="107" cy="-10.5" r="2.1" />
      <circle cx="98" cy="-16" r="1.4" />
    </g>
  );
}

type OrnamentVariant = "crest" | "sprig" | "corner";

interface FloralOrnamentProps {
  readonly variant?: OrnamentVariant;
  /**
   * Give this a width only. Each variant carries a `viewBox`, so the height
   * follows from the drawing's own proportions and the artwork never sits in
   * a box larger than itself — which would read as an indent in left-aligned
   * layouts.
   */
  readonly className?: string;
}

export function FloralOrnament({ variant = "crest", className }: FloralOrnamentProps) {
  const shared = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  if (variant === "corner") {
    return (
      <svg
        viewBox="0 0 84 84"
        aria-hidden="true"
        focusable="false"
        className={className}
        preserveAspectRatio="xMidYMid meet"
      >
        <g {...shared}>
          {/* Two sprigs meeting at the corner, rotated into an L. */}
          <g transform="translate(6 6) rotate(0) scale(0.62)">
            <Sprig />
          </g>
          <g transform="translate(6 6) rotate(90) scale(0.62)">
            <Sprig />
          </g>
          <circle cx="6" cy="6" r="2.4" />
        </g>
      </svg>
    );
  }

  if (variant === "sprig") {
    return (
      <svg
        viewBox="0 -24 120 48"
        aria-hidden="true"
        focusable="false"
        className={className}
        preserveAspectRatio="xMidYMid meet"
      >
        <g {...shared}>
          <Sprig />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="-120 -26 240 52"
      aria-hidden="true"
      focusable="false"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g {...shared}>
        <g transform="scale(-1 1)">
          <Sprig />
        </g>
        <Sprig />
        {/* Centre marque. */}
        <path d="M0-7.5 6.5 0 0 7.5-6.5 0Z" />
        <circle cx="0" cy="0" r="1.6" />
      </g>
    </svg>
  );
}
