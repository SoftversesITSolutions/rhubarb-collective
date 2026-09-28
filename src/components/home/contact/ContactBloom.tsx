import Image from "next/image";
import { BLOOM } from "@/lib/contact/config";

/**
 * The sunflower (client note 8) — the brand element the client asked to see
 * turning in the closing frame.
 *
 * Two layers. The still is a real image in the server render: face-on, the
 * last frame of the run, and everything a reader without JavaScript or with
 * reduced motion gets. The canvas above it is where the scrubbed turn is drawn
 * (see `lib/contact/bloom`), and it hides the still only once it has a frame
 * to show. The figure itself is what the section's timeline rotates and scales
 * — the swirl — so the frames never have to carry that axis.
 *
 * The slot around it is the figure's layout box and never moves: it is what
 * the network measures as a destination and what the scroll window is timed
 * from, so neither is ever a function of the transform they drive.
 */
export function ContactBloom() {
  return (
    <div className="contact__bloom-slot" data-contact-bloom-slot="">
    <figure className="contact__bloom" data-contact-bloom="">
      <Image
        className="contact__bloom-face"
        data-bloom-face=""
        src={BLOOM.src(BLOOM.frames - 1)}
        alt={BLOOM.alt}
        width={BLOOM.size}
        height={BLOOM.size}
        loading="lazy"
        sizes="(min-width: 1100px) 28vw, (min-width: 700px) 30vw, 56vw"
      />
      <canvas className="contact__bloom-canvas" data-bloom-canvas="" aria-hidden="true" />
    </figure>
    </div>
  );
}
