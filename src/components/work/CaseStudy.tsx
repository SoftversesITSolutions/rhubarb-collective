import Image from "next/image";
import Link from "next/link";
import type { CaseStudy as CaseStudyData } from "@/lib/work/case-study";
import { CaseStudySection } from "./CaseStudySection";

/**
 * A CASE STUDY, END TO END.
 *
 * It renders whatever `CaseStudy` object it is handed and reads nothing else —
 * no import of Ritam, no branch on a slug, no paragraph in the JSX. That is the
 * whole architectural point: when `/work/[slug]` arrives, this component does
 * not change.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SHAPE OF THE PAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   back link ..... a quiet route out, at the top where a reader who arrived by
 *                   mistake will look for it
 *   masthead ...... client, title, descriptor
 *   hero .......... the project's strongest picture, full measure
 *   overview ...... the facts rail against the summary — the page's one true
 *                   two-column spread
 *   sections ...... the study itself, in the data's order
 *   outcome ....... where the work stands
 *   next .......... one link onward, then the site's own footer
 *
 * Every heading level is real: the client's name is the H1, each section
 * heading is an H2, and nothing is a heading that is not one — the facts rail
 * is a description list, because that is what a list of labelled values is.
 */
export function CaseStudy({ study }: { study: CaseStudyData }) {
  return (
    <>
      {/* ---- out ---- */}
      <div className="cs-back" data-cs-block="">
        <Link className="cs-back__link" href="/work" data-cs-reveal="">
          <span className="cs-back__arrow" aria-hidden="true">
            ←
          </span>
          All work
        </Link>
      </div>

      {/* ---- masthead ---- */}
      <header className="cs-masthead" data-cs-block="">
        <p className="cs-masthead__eyebrow" data-cs-reveal="">
          {study.eyebrow}
        </p>

        <h1 className="cs-masthead__title">
          <span className="cs-masthead__title-inner" data-cs-reveal="">
            {study.title}
          </span>
        </h1>

        <p className="cs-masthead__descriptor" data-cs-reveal="">
          {study.descriptor}
        </p>
      </header>

      {/*
        THE HERO PICTURE. The project's strongest asset, at the full measure of
        the field and at its own aspect ratio — the frame carries the file's
        proportions so nothing is letterboxed, nothing is stretched, and the
        space is reserved before the picture lands.

        `priority`, because it is the largest thing above the fold and is this
        page's largest contentful paint by definition.
      */}
      <div
        className="cs-hero"
        data-cs-hero=""
        style={{ aspectRatio: `${study.hero.width} / ${study.hero.height}` }}
      >
        <Image
          className="cs-hero__image"
          src={study.hero.src}
          alt={study.hero.alt}
          width={study.hero.width}
          height={study.hero.height}
          sizes="(min-width: 1100px) 92vw, 100vw"
          priority
        />
      </div>

      {/* ---- overview ---- */}
      <section className="cs-overview" aria-labelledby="cs-overview-title" data-cs-block="">
        <h2 className="visually-hidden" id="cs-overview-title">
          Project overview
        </h2>

        {/* A description list, because a list of labelled values is one. Every
            row is a fact the project really has — there is no empty row and no
            em dash standing in for something unknown. */}
        <dl className="cs-facts">
          {study.facts.map((fact) => (
            <div className="cs-facts__row" key={fact.label} data-cs-reveal="">
              <dt className="cs-facts__label">{fact.label}</dt>
              <dd className="cs-facts__value">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <p className="cs-overview__summary" data-cs-reveal="">
          {study.summary}
        </p>
      </section>

      {/* ---- the study ---- */}
      {study.sections.map((section) => (
        <CaseStudySection key={section.id} section={section} />
      ))}

      {/* ---- outcome ---- */}
      <section className="cs-outcome" aria-labelledby="cs-outcome-title" data-cs-block="">
        <span className="cs-outcome__rule" aria-hidden="true" data-cs-rule="" />

        <h2 className="cs-outcome__label" id="cs-outcome-title" data-cs-reveal="">
          {study.outcome.label}
        </h2>

        {study.outcome.body.map((paragraph) => (
          <p className="cs-outcome__body" key={paragraph} data-cs-reveal="">
            {paragraph}
          </p>
        ))}
      </section>

      {/*
        NEXT WORK. One link onward and nothing else — no second case study, no
        grid of three, no "you might also like". It goes to the archive, because
        that client has no page of its own yet and a link to one that does not
        exist is the 404 this project refuses everywhere.
      */}
      <nav className="cs-next" aria-label={study.next.label} data-cs-block="">
        <span className="cs-next__rule" aria-hidden="true" data-cs-rule="" />

        <Link className="cs-next__link" href={study.next.href}>
          <span className="cs-next__label" data-cs-reveal="">
            {study.next.label}
          </span>
          <span className="cs-next__client" data-cs-reveal="">
            {study.next.client}
          </span>
          <span className="cs-next__discipline" data-cs-reveal="">
            {study.next.discipline}
          </span>
        </Link>
      </nav>
    </>
  );
}
