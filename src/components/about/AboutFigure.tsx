import Image from "next/image";
import type { AboutImage } from "@/lib/about/content";

interface AboutFigureProps {
  image: AboutImage;
  /** Places the figure in its section's grid. */
  className: string;
}

/**
 * A picture on the About page.
 *
 * An editorial rectangle and nothing else: no radius, no shadow, no border, no
 * card, no overlay, no hover zoom, no lightbox. The frame reserves its exact
 * aspect ratio before the file arrives, so a slow image never shifts the type
 * around it.
 *
 * The reveal is the page's one gesture — the same mask that opens on every
 * block of type — applied to the frame rather than to the picture, so nothing
 * is ever scaled or panned. `data-about-group` gives the figure its own scroll
 * window instead of waiting on whatever it sits beside.
 *
 * `alt` describes the frame and never repeats the copy next to it; the caption
 * names the artefact. Both live in `lib/about/content` with the picture.
 */
export function AboutFigure({ image, className }: AboutFigureProps) {
  return (
    <figure className={`ab-figure ${className}`} data-about-group="">
      <div
        className="ab-figure__frame"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
        data-about-reveal=""
      >
        <Image
          className="ab-figure__image"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={image.sizes}
          loading="lazy"
        />
      </div>

      {image.caption && (
        <figcaption className="ab-figure__caption" data-about-reveal="">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}
