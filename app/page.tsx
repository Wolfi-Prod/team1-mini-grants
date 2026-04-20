import type { Metadata } from "next";
import Link from "next/link";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { HomeScrollDriver } from "@/app/_components/home/HomeClient";
import { HeroTitle } from "@/app/_components/home/HeroTitle";
import { getServerRole, getServerOrg } from "@/lib/auth/serverAuth";
import type { MockRole } from "@/lib/auth/roles";
import type { Organization } from "@/lib/types";

export const metadata: Metadata = {
  title: "Backyard — You build. We back you.",
  description:
    "Grants, hackathons, and build challenges with real feedback, structured milestones, and a community behind your project from day one.",
  openGraph: {
    title: "Backyard — You build. We back you.",
    description:
      "Grants, hackathons, and build challenges with real feedback, structured milestones, and a community behind your project from day one.",
    type: "website",
  },
};

function primaryCtaFor(role: MockRole, org: Organization | null) {
  if (role === "applicant") return { href: "/projects", label: "My projects" };
  if (role === "admin") return { href: "/admin", label: "Admin dashboard" };
  if (role === "org" && org) return { href: `/dashboard/${org.slug}`, label: "Dashboard" };
  return { href: "/login", label: "Start building" };
}

export default async function HomePage() {
  const role = await getServerRole();
  const org = await getServerOrg();
  const primary = primaryCtaFor(role, org);

  return (
    <>
      <div className="main">
        {/* Left rail */}
        <div className="rail rail--left">
          <span className="rail__text">Backyard — 2026</span>
        </div>

        {/* Content */}
        <div className="content">
          {/* ═══ HERO ═══ */}
          <section className="hero">
            <div>
              <MockApiBadge
                endpoints={[
                  "GET /api/discover/grants?status=OPEN&isPublic=true",
                  "GET /api/competitions?format=HACKATHON",
                  "GET /api/competitions?format=CHALLENGE",
                ]}
              />

              <div className="eyebrow">
                <span className="eyebrow__line" />
                Est. 2026
              </div>

              <HeroTitle />

              <p className="hero__sub">
                Grants, hackathons, and build challenges with real feedback,
                structured milestones, and a community behind your project from day one.
              </p>

              <div className="hero__actions">
                <Link href={primary.href} className="btn btn--primary">
                  {primary.label}
                </Link>
                <Link href="/discover" className="btn btn--ghost">
                  See what&apos;s open
                </Link>
              </div>
            </div>

            <div className="hero__meta">
              <div>Issue N.01 / Vol. One</div>
              <div className="hero__meta-dots">◦ ◦ ◦</div>
            </div>
          </section>

          {/* ═══ JOURNEY ═══ */}
          <div className="scroll-container scroll-container--journey" id="journeyScroll">
            <div className="scroll-container__sticky">
              <section className="bento" style={{ height: "100%" }}>
                <div className="journey" style={{ height: "100%" }}>
                  <div className="journey__steps">
                    <div className="step-box" data-idx="1" data-big="01" data-small="Spark · Validate · Refine">
                      <div className="step-box__num">01 Ideate</div>
                      <div className="step-box__name">Ideate</div>
                      <div className="step-box__desc">Start with a problem worth solving. Share your idea, get early feedback, and find teammates who fill your gaps.</div>
                    </div>
                    <div className="step-box" data-idx="2" data-big="02" data-small="Compete · Collaborate · Iterate">
                      <div className="step-box__num">02 Build</div>
                      <div className="step-box__name">Build</div>
                      <div className="step-box__desc">Work in public. Hit milestones. Get reviewed by people who read your code, not your pitch deck.</div>
                    </div>
                    <div className="step-box" data-idx="3" data-big="03" data-small="Deploy · Showcase · Announce">
                      <div className="step-box__num">03 Launch</div>
                      <div className="step-box__name">Launch</div>
                      <div className="step-box__desc">Ship your project publicly. Showcase your work. Let the community and reviewers see what you made.</div>
                    </div>
                    <div className="step-box" data-idx="4" data-big="04" data-small="Apply · Pitch · Scale">
                      <div className="step-box__num">04 Raise</div>
                      <div className="step-box__name">Raise</div>
                      <div className="step-box__desc">Apply for grant funding with a shipped product, not a slide deck. Organizations fund projects with proof, not promises.</div>
                    </div>
                  </div>
                  <div className="journey__image">
                    <div className="journey__image-content">
                      <div className="journey__hint">Scroll to explore</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ═══ WAYS TO BUILD ═══ */}
          <div className="scroll-container scroll-container--ways" id="waysScroll">
            <div className="scroll-container__sticky">
              <section className="bento" style={{ height: "100%" }}>
                <div className="ways" id="waysGrid" style={{ height: "100%" }}>
                  <div className="way">
                    <div className="way__narrow">
                      <div className="way__num">01</div>
                      <div className="way__label--v">Idea Bank</div>
                    </div>
                    <div className="way__wide">
                      <div className="way__num">01</div>
                      <div className="way__title">Idea Bank</div>
                      <div className="way__desc">Drop early ideas, get lightweight signal from other builders, and see what resonates before you commit serious time.</div>
                      <Link href="/projects/new" className="way__explore">Explore →</Link>
                    </div>
                  </div>
                  <div className="way">
                    <div className="way__narrow">
                      <div className="way__num">02</div>
                      <div className="way__label--v">Challenges</div>
                    </div>
                    <div className="way__wide">
                      <div className="way__num">02</div>
                      <div className="way__title">Challenges</div>
                      <div className="way__desc">Short focused prompts with clear briefs, review panels, and real feedback. Great for sharpening a specific skill or shipping a wedge.</div>
                      <Link href="/challenges" className="way__explore">Explore →</Link>
                    </div>
                  </div>
                  <div className="way">
                    <div className="way__narrow">
                      <div className="way__num">03</div>
                      <div className="way__label--v">Hackathons</div>
                    </div>
                    <div className="way__wide">
                      <div className="way__num">03</div>
                      <div className="way__title">Hackathons</div>
                      <div className="way__desc">Time-bound competitions with tracks, teams, and prizes. Register solo or with a crew. Ship under pressure.</div>
                      <Link href="/hackathons" className="way__explore">Explore →</Link>
                    </div>
                  </div>
                  <div className="way">
                    <div className="way__narrow">
                      <div className="way__num">04</div>
                      <div className="way__label--v">Grants</div>
                    </div>
                    <div className="way__wide">
                      <div className="way__num">04</div>
                      <div className="way__title">Grants</div>
                      <div className="way__desc">Non-dilutive funding for builders with momentum. Transparent criteria, fast decisions, milestone-based disbursement.</div>
                      <Link href="/discover" className="way__explore">Explore →</Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ═══ MORE THAN FUNDING ═══ */}
          <section className="bento">
            <div className="funding">
              <div className="card">
                <div className="card__title">GTM &amp; Tech Calls</div>
                <div className="card__desc">One-on-one calls with people who shipped before you. Get advice on your go-to-market strategy or technical architecture.</div>
                <div className="card__tag">1:1 Calls</div>
              </div>
              <div className="card">
                <div className="card__title">Bootcamps</div>
                <div className="card__desc">Structured programs to take your project from raw idea to launch-ready. Learn by building, not watching.</div>
                <div className="card__tag">Structured</div>
              </div>
              <div className="card">
                <div className="card__title">Distribution</div>
                <div className="card__desc">We put your project in front of the right people. Email lists, social boosts, and featured spots on Backyard.</div>
                <div className="card__tag">Reach</div>
              </div>
              <div className="card">
                <div className="card__title">Testing</div>
                <div className="card__desc">Real users test your product before launch. Get bug reports, UX feedback, and validation from people outside your bubble.</div>
                <div className="card__tag">Validation</div>
              </div>
              <div className="card">
                <div className="card__title">Design Support</div>
                <div className="card__desc">Access design reviews and UI feedback so your project ships polished, not half-baked.</div>
                <div className="card__tag">Polish</div>
              </div>
              <div className="card">
                <div className="card__title">Community</div>
                <div className="card__desc">Connect with other builders shipping in public. Share progress, ask questions, get unstuck fast.</div>
                <div className="card__tag">Network</div>
              </div>
            </div>
          </section>

          {/* ═══ CTA ═══ */}
          <section className="cta">
            <h2 className="cta__title">
              Your project<br />
              <em>belongs here.</em>
            </h2>
            <p className="cta__sub">
              Join Backyard. Build in public, get real support, and ship something that matters.
            </p>
            <Link href={primary.href} className="btn btn--primary" style={{ marginTop: 48 }}>
              Start building
            </Link>
          </section>
        </div>

        {/* Right rail */}
        <div className="rail rail--right">
          <span className="rail__text">For Builders</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__brand">
          <span className="footer__circle">N</span>
          <span className="footer__copy">Backyard &copy; 2026</span>
        </div>
        <div className="footer__links">
          <Link href="/faq" className="footer__link">FAQ</Link>
          <Link href="/login" className="footer__link">Run a grant</Link>
          <span className="footer__link footer__live">
            <span className="footer__dot" />
            Live
          </span>
        </div>
      </footer>

      <HomeScrollDriver />
    </>
  );
}
