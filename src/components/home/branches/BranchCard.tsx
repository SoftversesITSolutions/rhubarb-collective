import Image from "next/image";
import type { Service } from "@/lib/branches/config";

interface BranchCardProps {
  service: Service;
}

/**
 * One discipline, as a destination in the network.
 *
 * A flat cream plane with black type — an editorial object, not a UI card: no
 * gradient, no shadow, no glass, and only enough radius to stop the corners
 * reading as clip art. All text is real DOM content and is present in the
 * server render, so nothing depends on animation to exist.
 *
 * Behind the type sits the service's print (client note 7): the image is laid
 * into the cream as ink at low opacity, clearing where the words sit, and
 * deepens toward the photograph under the pointer. It is positioned inside the
 * frame and takes no layout, so the frame's box — which the network is grown
 * against — is exactly what it was without it. It follows the body in the
 * DOM so assistive tech reads the discipline before the picture.
 */
export function BranchCard({ service }: BranchCardProps) {
  const { print } = service;

  return (
    <article className="branch-card" data-branch-card="" data-slot={service.slot}>
      <div className="branch-card__frame" data-branch-frame="">
        <div className="branch-card__body" data-branch-body="">
          <span className="branch-card__index">{service.index}</span>
          <h3 className="branch-card__title">{service.title}</h3>
          <p className="branch-card__detail">{service.detail}</p>
        </div>
        <div className="branch-card__print" data-branch-print="" data-basis={print.basis}>
          <Image
            className="branch-card__print-image"
            data-branch-print-image=""
            src={print.src}
            alt={print.alt}
            width={print.width}
            height={print.height}
            loading="lazy"
            sizes="(min-width: 1100px) 32vw, (min-width: 700px) 48vw, 80vw"
            style={{ objectPosition: print.focal }}
          />
        </div>
      </div>
    </article>
  );
}
