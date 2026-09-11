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
 */
export function BranchCard({ service }: BranchCardProps) {
  return (
    <article className="branch-card" data-branch-card="" data-slot={service.slot}>
      <div className="branch-card__frame" data-branch-frame="">
        <div className="branch-card__body" data-branch-body="">
          <span className="branch-card__index">{service.index}</span>
          <h3 className="branch-card__title">{service.title}</h3>
          <p className="branch-card__detail">{service.detail}</p>
        </div>
      </div>
    </article>
  );
}
