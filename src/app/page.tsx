import { Hero } from "@/components/hero/Hero";
import { FirstGrowth } from "@/components/home/FirstGrowth";
import { WorkSection } from "@/components/home/work/WorkSection";
import { BranchesSection } from "@/components/home/branches/BranchesSection";
import { CollectiveSection } from "@/components/home/collective/CollectiveSection";
import { ProofSection } from "@/components/home/proof/ProofSection";
import { JournalSection } from "@/components/home/journal/JournalSection";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";

export default function Home() {
  return (
    <>
      {/*
        The global navigation layer. Mounted at the page shell, beside <main>
        rather than inside any section — a fixed element nested in a section
        would position against that section's transform and be clipped by its
        `overflow: hidden`.
      */}
      <GlobalMenu />

      <main>
        <Hero />
        <FirstGrowth />
        <WorkSection />
        <BranchesSection />
        <CollectiveSection />
        <ProofSection />
        <JournalSection />
      </main>

      {/*
        Section 08 closes the page and *is* its footer, so it sits outside
        <main> — that is what makes it the document's contentinfo landmark,
        which is where the company details belong. It reads Journal & Culture
        out of the live DOM for its inlets, so it must stay after it in the
        document. There is no second footer component underneath it.
      */}
      <ContactRoutes />
    </>
  );
}
