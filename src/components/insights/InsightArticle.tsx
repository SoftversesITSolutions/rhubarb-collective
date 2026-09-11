import Image from "next/image";
import Link from "next/link";
import { readingTimeLabel, type Insight } from "@/lib/insights/article";
import { InsightArticleBlock } from "./InsightArticleBlock";

/**
 * A PIECE, END TO END.
 *
 * It renders whatever `Insight` object it is handed and reads nothing else — no
 * import of a piece, no branch on a slug, no sentence in the JSX. That is the
 * architectural point: when `/insights/[slug]` arrives, this component does not
 * change.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SHAPE OF THE PAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   back ......... a quiet route out, at the top, where a reader who followed a
 *                  link they did not mean to will look for it
 *   masthead ..... the strand, the title, a rule, and the metadata line
 *   hero ......... the piece's picture, wide, with room around it
 *   blocks ....... the piece itself, in the data's order
 *   colophon ..... how the piece closes
 *   return ....... back into the archive, and a next read where one exists
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SEMANTICS
 * ─────────────────────────────────────────────────────────────────────────────
 * The piece is an `<article>` and its front matter is that article's `<header>`.
 * The title is the page's only H1 and every block heading is an H2, so the
 * outline is real and there is no level skipped to get a size. The back link
 * and the return are `<nav>`s with their own accessible names, and they sit
 * outside the `<article>` because neither is part of the piece.
 *
 * `<time dateTime>` is emitted only when the piece carries a real machine date;
 * a `dateTime` derived by parsing a hand-typed display string is how a page
 * quietly announces the wrong day to every machine reading it. With no date at
 * all, no `<time>` element is emitted — an empty one is worse than none.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTHING IS FILLED IN
 * ─────────────────────────────────────────────────────────────────────────────
 * No byline where the piece is unsigned. No date where it is undated. No
 * standfirst where it has none, no picture where none was supplied, no next
 * read where there is no second piece — each block simply does not render. The
 * same grammar the /insights archive and /work's case studies are written under.
 */
export function InsightArticle({ piece }: { piece: Insight }) {
  const { kind, title, excerpt, author, publishedAt, iso, heroImage } = piece;

  /* Computed from the piece's own prose, never authored — see `readingMinutes`.
     It is the one metadatum that always exists, because it is derived. */
  const reading = readingTimeLabel(piece);

  return (
    <>
      {/* ---- out ---- */}
      <nav className="ia-back" aria-label="Back to the archive" data-ia-block="">
        <Link className="ia-back__link" href="/insights" data-ia-reveal="">
          <span className="ia-back__arrow" aria-hidden="true">
            ←
          </span>
          All insights
        </Link>
      </nav>

      <article className="ia-piece">
        {/* ---- masthead ---- */}
        <header className="ia-masthead" data-ia-block="">
          <p className="ia-masthead__eyebrow" data-ia-reveal="">
            {kind}
          </p>

          <h1 className="ia-masthead__title">
            <span className="ia-masthead__title-inner" data-ia-reveal="">
              {title}
            </span>
          </h1>

          {/* A standfirst, where the piece genuinely has one. */}
          {excerpt && (
            <p className="ia-masthead__excerpt" data-ia-reveal="">
              {excerpt}
            </p>
          )}

          <span className="ia-masthead__rule" aria-hidden="true" data-ia-rule="" />

          {/*
            THE METADATA. Understated by construction: micro type at the
            quietest weight the palette has, so it never competes with the
            title above it. Each item renders only if the piece has it, and the
            separators are drawn between whatever survives rather than being
            typed into the copy.
          */}
          <p className="ia-masthead__meta" data-ia-reveal="">
            {author && <span className="ia-masthead__author">{author}</span>}

            {author && publishedAt && (
              <span className="ia-masthead__separator" aria-hidden="true" />
            )}

            {publishedAt && (
              <time className="ia-masthead__date" dateTime={iso ?? undefined}>
                {publishedAt}
              </time>
            )}

            {(author ?? publishedAt) && (
              <span className="ia-masthead__separator" aria-hidden="true" />
            )}

            <span className="ia-masthead__reading">{reading}</span>
          </p>
        </header>

        {/*
          THE PICTURE. Wide, at its own aspect ratio — the frame carries the
          file's proportions, so nothing is letterboxed, nothing is stretched
          and the space is reserved before the picture lands. No overlay, no
          scrim, no filter and no title set on top of it.

          `priority`, because it is the largest thing above the fold and is this
          page's largest contentful paint by definition. It is the only image on
          the route that is not lazy.
        */}
        {heroImage && (
          <div
            className="ia-hero"
            data-ia-hero=""
            style={{ aspectRatio: `${heroImage.width} / ${heroImage.height}` }}
          >
            <Image
              className="ia-hero__image"
              src={heroImage.src}
              alt={heroImage.alt}
              width={heroImage.width}
              height={heroImage.height}
              sizes={heroImage.sizes}
              priority
            />
          </div>
        )}

        {heroImage?.caption && (
          <p className="ia-hero__caption" data-ia-block="" data-ia-reveal="">
            {heroImage.caption}
          </p>
        )}

        {/* ---- the piece ---- */}
        {piece.blocks.map((block) => (
          <InsightArticleBlock key={block.id} block={block} />
        ))}

        {/* ---- the close ---- */}
        {piece.colophon && (
          <section
            className="ia-colophon"
            aria-labelledby="ia-colophon-label"
            data-ia-block=""
          >
            <span className="ia-colophon__rule" aria-hidden="true" data-ia-rule="" />

            <h2 className="ia-colophon__label" id="ia-colophon-label" data-ia-reveal="">
              {piece.colophon.label}
            </h2>

            {piece.colophon.body.map((paragraph) => (
              <p className="ia-colophon__body" key={paragraph} data-ia-reveal="">
                {paragraph}
              </p>
            ))}
          </section>
        )}
      </article>

      {/*
        THE RETURN. The archive, always — and one piece onward where a second
        piece genuinely exists. With one piece there is nothing to point at, so
        the next block does not render at all rather than pointing back at the
        archive a second time one line above the link that already does.
      */}
      <nav
        className="ia-return"
        aria-label="Continue reading"
        data-next={piece.next ? "" : undefined}
        data-ia-block=""
      >
        <span className="ia-return__rule" aria-hidden="true" data-ia-rule="" />

        {piece.next && (
          <Link className="ia-next" href={piece.next.href}>
            <span className="ia-next__label" data-ia-reveal="">
              {piece.next.label}
            </span>
            <span className="ia-next__title" data-ia-reveal="">
              {piece.next.title}
            </span>
            {piece.next.kind && (
              <span className="ia-next__kind" data-ia-reveal="">
                {piece.next.kind}
              </span>
            )}
          </Link>
        )}

        <Link className="ia-return__link" href="/insights" data-ia-reveal="">
          <span className="ia-return__arrow" aria-hidden="true">
            ←
          </span>
          All insights
        </Link>
      </nav>
    </>
  );
}
