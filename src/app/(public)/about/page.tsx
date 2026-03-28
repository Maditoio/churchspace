import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ChurchSpaces — The World's First Marketplace for Sacred Spaces",
  description:
    "ChurchSpaces is the world's first dedicated marketplace for places of worship and sacred spaces — connecting faith communities with the venues they need to gather, grow, and serve.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-200 px-4 py-20 md:px-8">
      <h1 className="font-display text-5xl leading-tight text-foreground">
        About ChurchSpaces
      </h1>
      <p className="mt-4 text-sm font-medium uppercase tracking-widest text-(--text-muted)">
        The World&apos;s First Marketplace Built Exclusively for Places of Worship and Sacred Spaces
      </p>

      <div className="mt-10 space-y-5 text-[15px] leading-8 text-(--text-secondary)">
        <p>
          ChurchSpaces is not a general property platform with a filter for churches. We are the first dedicated, purpose-built marketplace
          in the world designed entirely around places of worship, faith communities, and the spaces they need — to gather, grow, celebrate, and serve.
        </p>
        <p className="font-medium text-foreground">
          We built ChurchSpaces because no one else had. And that needed to change.
        </p>
      </div>

      <div className="mt-16 space-y-14">

        <section>
          <h2 className="font-display text-3xl text-foreground">What We Do</h2>
          <p className="mt-4 text-[15px] leading-8 text-(--text-secondary)">
            ChurchSpaces connects churches, ministries, mosques, synagogues, and faith-based organisations with the spaces they need — and helps space
            owners unlock the untapped value sitting in their buildings every day of the week.
          </p>
          <p className="mt-4 text-[15px] leading-8 text-(--text-secondary)">
            Whether you&apos;re a congregation searching for a Sunday home, a ministry hosting a regional conference, a couple looking for a meaningful
            wedding venue, or a nonprofit needing a hall for a community event — ChurchSpaces is where your search begins and ends.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { label: "Worship Venues", desc: "Main sanctuaries, chapels, and prayer halls available for hire or long-term lease" },
              { label: "Conference & Event Centres", desc: "Purpose-equipped spaces for summits, seminars, retreats, and ministry training" },
              { label: "Wedding & Celebration Venues", desc: "Beautiful, meaningful spaces for ceremonies, receptions, and life moments" },
              { label: "Community Halls & Multi-Use Spaces", desc: "Flexible venues for outreach, youth programs, meetings, and more" },
              { label: "Full Church Premises for Sale", desc: "Complete properties for growing congregations ready to plant roots" },
              { label: "Short-Term & Occasional Hire", desc: "One-off bookings for events, funerals, memorials, graduations, and more" },
            ].map(({ label, desc }) => (
              <li key={label} className="border-t border-(--border) pt-3">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-(--text-secondary)">{desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-3xl text-foreground">Why ChurchSpaces Exists</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-8 text-(--text-secondary)">
            <p>
              Thousands of churches sit with underutilised buildings six days a week. Thousands of ministries spend months searching for the right space
              with no structured place to look. Event planners want venues with character and meaning. Couples want something beyond the standard function hall.
            </p>
            <p className="font-medium text-foreground">ChurchSpaces solves all of this — in one place.</p>
            <p>
              We believe sacred spaces should be active spaces. Every listing on ChurchSpaces is structured with the details that matter: property type,
              seating and floor capacity, available amenities, location, verified images, pricing, availability windows, and direct contact channels.
              No guesswork. No back-and-forth. Just clarity.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl text-foreground">Built for the Faith Community, Open to Everyone</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-8 text-(--text-secondary)">
            <p>
              ChurchSpaces was designed with the faith community at its core — but its doors are open to any individual, organisation, or business
              looking for the kind of venue that carries history, architecture, atmosphere, and soul.
            </p>
            <p>
              Corporate teams host off-sites here. Photographers book sessions here. Community organisations hold galas here. Couples say their vows here.
            </p>
            <p>
              What unites every transaction on ChurchSpaces is a shared understanding: these are not just buildings. They are places where people
              gather for what matters most.
            </p>
          </div>
        </section>

        <section className="border-t border-(--border) pt-14">
          <h2 className="font-display text-3xl text-foreground">Our Mission</h2>
          <p className="mt-4 text-[15px] leading-8 text-(--text-secondary)">
            To empower faith communities to steward their spaces well — and to connect every person searching for a meaningful venue with a space
            that exceeds their expectations.
          </p>
          <p className="mt-4 text-[15px] leading-8 text-(--text-secondary)">
            We are just getting started. ChurchSpaces is building the most comprehensive, trusted, and innovative platform for sacred and community
            spaces the world has ever seen.
          </p>
          <p className="mt-6 font-display text-2xl text-foreground">
            Your space. Your community. Your platform.
          </p>
        </section>

      </div>
    </div>
  );
}
