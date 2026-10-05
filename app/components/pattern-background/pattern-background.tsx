import Image from "next/image";
import "./pattern-background.scss";
import { colorCss, imageUrl, patternLayerCss, svgLayerCss, toStyle, type PatternBackgroundConfig } from "./engine";

// Fills its positioned parent with a generated background, bottom to top: a flat colour, a jpg,
// an svgbackgrounds.com svg (recoloured / palette-mapped / hue-shifted / turned / zoomed) and a
// masked pattern. Puzzles use it through <PuzzleBackground />, which picks the config from a pool.
//   <PatternBackground svg="liquid-cheese" palette={42} />
export default function PatternBackground({ className = "", ...config }: PatternBackgroundConfig & { className?: string }) {
  const pattern = patternLayerCss(config);
  const rotate = (config.svgRotate ?? 0) % 360, zoom = config.svgZoom ?? 1;
  const transform = [rotate ? `rotate(${rotate}deg)` : "", zoom !== 1 ? `scale(${zoom})` : ""].filter(Boolean).join(" ");
  // Unturned, the drawing paints in the puzzle's own box (half the set is sized to cover, and an
  // oversized box would rescale them); turned, it takes a square past the diagonal so no edge shows.
  const svgTile = config.svg ? { ...toStyle(svgLayerCss(config)), ...(rotate ? { transform: `translate(-50%, -50%) ${transform}` } : transform ? { transform } : {}) } : null;

  return (
    <div className={`nsc-pattern-background ${className}`.trim()} style={{ backgroundColor: colorCss(config) }} aria-hidden="true">
      <div className="layers" style={{ opacity: config.opacity ?? 1 }}>
        {config.image && (
          <div className="image-layer" style={{ opacity: config.imageOpacity ?? 1 }}>
            <Image src={imageUrl(config.image)} fill sizes="100vw" className="object-cover" alt="" priority />
          </div>
        )}
        {svgTile && <div className="svg-layer"><i className={rotate ? "is-turned" : ""} style={svgTile} /></div>}
        {pattern && (
          <div className="pattern-layer" style={{ opacity: config.patternOpacity ?? 0.35, mixBlendMode: config.patternBlend ?? "normal" }}>
            <i style={{ ...toStyle(pattern), transform: `translate(-50%, -50%) rotate(${config.patternRotate ?? 0}deg)` }} />
          </div>
        )}
      </div>
    </div>
  );
}
