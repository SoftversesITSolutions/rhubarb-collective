/**
 * /CONTACT — THE PAGE'S OWN WORDS
 * ==============================
 *
 * NOTHING IS DUPLICATED HERE. The contact details themselves — both emails, the
 * phone number, the location, the company, the postal address and the GSTIN —
 * already live in `lib/contact/config` and are read straight from it by this
 * page. There is one copy of every value on the site, and this file adds only
 * the framing this page needs and the homepage footer does not.
 *
 * WHY THIS PAGE AND THE FOOTER ARE NOT THE SAME THING. The site's footer *is*
 * the Contact / Routes section: it carries the statement, the four routes and
 * the colophon on every route of the site. A dedicated page that printed all of
 * that again, with the footer restating it directly underneath, would say
 * everything twice inside one screen. So the two are split by job:
 *
 *   this page  →  the statement, the invitation and the four routes, at the
 *                 scale a page can give them
 *   the footer →  the registered entity, its address and its GSTIN, which is
 *                 what belongs in a contentinfo landmark on every page
 *
 * The footer is not redesigned to achieve that: it takes a `variant` that
 * defaults to exactly what it renders today, so "/" and "/about" are untouched.
 *
 * THE FORM DOES NOT REPLACE THE ROUTES, and it is not stubbed. The rule this
 * page was built on — that a form which silently discards an enquiry is worse
 * than an address that works — still holds; `lib/contact/enquiry` and
 * `app/api/enquiry/route` are what it costs to keep it. The four routes above
 * remain the fastest way to reach a person; the form is for the enquiry that
 * needs a brief rather than a subject line.
 *
 * NO WHATSAPP LINK, NO MAP. The client labels the number "Phone/ Whatsapp",
 * which describes the number rather than naming a destination, and no wa.me
 * URL, deep link or business id exists in any supplied file. No map URL or
 * coordinates were supplied either. Both stay absent rather than guessed —
 * `lib/contact/config` records the same decision for the footer.
 */

/* ------------------------------------------------------------------ *
 * 01 — HERO
 * ------------------------------------------------------------------ */

/**
 * The page's opening. `statement` and `invitation` are NOT redeclared — they
 * are the client's approved footer copy and are read from `CONTACT_COPY`, so
 * correcting a word corrects it in both places at once. Only the eyebrow is
 * this page's, and it is the menu's own label for the destination.
 */
export const CONTACT_PAGE_HERO = {
  eyebrow: "Contact",
} as const;

/* ------------------------------------------------------------------ *
 * 02 — ROUTES
 * ------------------------------------------------------------------ */

export const CONTACT_PAGE_ROUTES = {
  index: "01",
  marker: "Routes",
  /** Accessible name for the section. Not printed — the routes speak for it. */
  title: "Ways to reach Rhubarb Collective",
} as const;

/* ------------------------------------------------------------------ *
 * 03 — CLOSING
 * ------------------------------------------------------------------ */

/**
 * The client's own sign-off, from the closing page of the brand guidelines
 * ("Moving Forward? / Let's get started ! / Call us today to elevate your
 * Brand."). Their capitalisation of "Brand" is kept.
 *
 * "Let's get started !" is deliberately not used: the space before its
 * exclamation mark is a typesetting slip rather than a stylistic choice, and
 * the options were to reproduce a visible error or to silently edit the
 * client's words. Leaving the line out does neither.
 */
export const CONTACT_PAGE_CLOSING = {
  eyebrow: "Moving forward?",
  statement: "Call us today to elevate your Brand.",
} as const;

/* ------------------------------------------------------------------ *
 * 03 — ENQUIRY
 * ------------------------------------------------------------------ */

/**
 * THE FORM'S WORDS.
 *
 * None of this is transcribed from client material, and it is marked as such
 * rather than quietly mixed in with the copy above: the client supplied a
 * footer, a set of routes and a sign-off, not a form. What is written here is
 * held to the same rules their words are — it makes no claim about response
 * time, availability, capacity, rates or turnaround, because no such claim
 * exists in any supplied file and inventing one would be putting a promise in
 * the client's mouth.
 *
 * `headingLines` is the heading broken where the composition breaks it, exactly
 * as `CONTACT_COPY.statementLines` does for the hero. Joining them with a single
 * space reproduces the sentence; the break is a typographic decision that lives
 * here rather than in the component.
 *
 * The heading deliberately answers the hero. The page opens "We make brands
 * harder to ignore." and the form asks the reader to finish the sentence with
 * their own project — which is why it is the one place on the page allowed to
 * echo the client's line rather than repeat a second statement of its own.
 */
export const CONTACT_PAGE_FORM = {
  eyebrow: "Start a project",
  headingLines: ["Let's make something", "harder to ignore."],
  /**
   * One sentence. It says what the form is for and what makes it useful, and
   * stops — a contact page that explains itself at length has stopped being a
   * door.
   */
  note: "Tell us what you're working on. The more you share, the sharper the first conversation.",
  /** The accessible name for the section. */
  title: "Start a project with Rhubarb Collective",
  submit: "Send enquiry",
  submitting: "Sending",
  /** Marks the three fields that block submission. Set once, in the legend. */
  requiredNote: "Required",
  optionalNote: "Optional",
} as const;

/**
 * WHAT THE FORM SAYS AFTER THE BUTTON IS PRESSED.
 *
 * Four outcomes, four messages, and no fifth message for the case where the
 * code is unsure — `lib/contact/enquiry` returns one of exactly four states and
 * this object answers each of them. In particular `unconfigured` says plainly
 * that nothing was delivered. That is the state this site is in until
 * `RHUBARB_ENQUIRY_ENDPOINT` is set, and printing "Thank you, we'll be in
 * touch" over it would be the silently-discarded enquiry this page has refused
 * from the beginning.
 */
export const CONTACT_PAGE_FORM_STATES = {
  sent: {
    heading: "Enquiry received.",
    /* No response time and no "we'll be in touch shortly": the endpoint
       confirmed receipt, which is the only thing this site actually knows. */
    body: "Thank you — it's with us. The routes above stay open in the meantime.",
  },
  unconfigured: {
    heading: "This form isn't connected yet.",
    body: "Nothing was sent. Your answers are still here — open them as an email and they'll reach us properly.",
  },
  failed: {
    heading: "That didn't go through.",
    body: "Something failed on the way. Try again, or open your enquiry as an email instead.",
  },
  invalid: {
    heading: "Something in the form needs another look.",
    body: "Check the fields marked above and send it again.",
  },
  /** The label on the `mailto:` fallback offered by the two failing states. */
  mailto: "Open as an email",
  /** Shown when submission is attempted with fields still unanswered. */
  incomplete: "A few answers are missing — they're marked below.",
  /**
   * With scripting off the form cannot send, and it says so rather than
   * quietly reloading the page with the answers in the URL. The routes above
   * are plain `mailto:` and `tel:` links and work regardless, which is why
   * this line points at them instead of apologising.
   */
  noscript:
    "This form needs JavaScript to send. The email addresses and phone number above work without it.",
} as const;
