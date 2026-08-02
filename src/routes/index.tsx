import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Mail, Instagram, MessageCircle, ChevronDown } from "lucide-react";

import portraitAsset from "@/assets/chalif-portrait.png.asset.json";
import hardware1 from "@/assets/project-hardware-1.jpg";
import hardware2 from "@/assets/project-hardware-2.jpg";
import forex1 from "@/assets/project-forex-1.jpg";
import forex2 from "@/assets/project-forex-2.jpg";

const portrait = portraitAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chalif Ali Hussein — IT Systems Specialist & Forex Trader" },
      {
        name: "description",
        content:
          "Chalif Ali Hussein: IT systems, network infrastructure, computer hardware, cyber security, Windows Server and forex market analysis.",
      },
      { property: "og:title", content: "Chalif Ali Hussein — IT Systems Specialist" },
      {
        property: "og:description",
        content:
          "Portfolio, projects and skills: IT systems, networking, hardware, cyber security and forex trading.",
      },
    ],
  }),
  component: Index,
});

const BOOT_LINES = [
  "> INIT SYSTEM CORE...",
  "> LOADING WEAPON MODULES...",
  "> ARMING NETWORK PROTOCOLS...",
  "> CALIBRATING TRADING ENGINE...",
  "> AUTHENTICATING OPERATOR: CHALIF A. H.",
  "> ALL SYSTEMS LOCKED & LOADED.",
];

const DISCIPLINES = [
  "IT SYSTEMS",
  "NETWORK INFRASTRUCTURE",
  "COMPUTER HARDWARE",
  "CYBER SECURITY",
  "WINDOWS SERVER",
];

const PROJECTS = [
  {
    image: hardware1,
    tag: "Computer Hardware",
    title: "Computer System Repair & Maintenance",
    text: "Complete desktop disassembly, diagnostics and repair including monitor calibration and hardware troubleshooting.",
  },
  {
    image: hardware2,
    tag: "Computer Hardware",
    title: "Motherboard & Component Assembly",
    text: "Motherboard inspection, CPU installation, RAM upgrades and cooling system maintenance for optimal performance.",
  },
  {
    image: forex1,
    tag: "Forex Trading",
    title: "BTC/USD Live Chart Analysis",
    text: "Live market analysis — identifying entry zones, support/resistance and momentum shifts on lower timeframes.",
  },
  {
    image: forex2,
    tag: "Forex Trading",
    title: "Multi-Monitor Trading Setup",
    text: "Active forex market analysis across multiple monitors — applying strict risk management and intermediate strategies.",
  },
];

const SKILLS = [
  { name: "Computer Hardware", value: 95 },
  { name: "IT Systems", value: 90 },
  { name: "Network Infrastructure", value: 85 },
  { name: "Cyber Security", value: 80 },
  { name: "Windows Server", value: 85 },
  { name: "Technical Support", value: 92 },
  { name: "Forex Trading & Market Analysis", value: 70 },
];

const EXPERTISE = [
  { title: "IT Systems", text: "System administration, troubleshooting" },
  { title: "Networking", text: "LAN/WAN setup, routing, cabling" },
  { title: "Hardware", text: "Assembly, repair, diagnostics" },
  { title: "Cyber Security", text: "Threat detection, data protection" },
  { title: "Windows Server", text: "Active Directory, Group Policy" },
  { title: "Technical Support", text: "Help desk, user training" },
];

function BootScreen({ done }: { done: boolean }) {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const line = setInterval(() => setShown((n) => Math.min(n + 1, BOOT_LINES.length)), 300);
    const bar = setInterval(() => setProgress((p) => Math.min(p + 4, 100)), 70);
    return () => {
      clearInterval(line);
      clearInterval(bar);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-background px-6 py-8 transition-opacity duration-700 sm:px-12 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold tracking-[0.3em]">CH</span>
        <span className="label-xs">System Boot</span>
      </div>

      <div>
        <p className="label-xs">CHALIF // ALI HUSSEIN</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-border">
            <div className="h-px bg-foreground transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">
            LOADING {String(progress).padStart(3, "0")}%
          </span>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {BOOT_LINES.slice(0, shown).map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}

function Index() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BootScreen done={booted} />

      {/* HERO */}
      <section className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-between px-6 py-8 sm:px-12">
          <div className="label-xs leading-relaxed">
            <p>KIGALI, RWANDA</p>
            <p>+250 794 744 054</p>
          </div>

          <div className="animate-fade-up py-16">
            <p className="label-xs">I&apos;AM|</p>
            <h1 className="mt-3 text-6xl font-bold tracking-tight sm:text-8xl">CHALIF</h1>
            <p className="mt-1 text-2xl font-light tracking-[0.3em] text-muted-foreground sm:text-3xl">
              ALI HUSSEIN
            </p>
            <p className="mt-10 text-sm text-muted-foreground">
              IT Systems • Network • Hardware • Cyber • Windows Server
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {DISCIPLINES.map((d) => (
                <span key={d} className="label-xs">
                  {d}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#profile"
                className="inline-flex items-center gap-2 border border-border px-5 py-3 text-xs tracking-[0.2em] transition-colors hover:bg-accent"
              >
                <Download className="size-4" /> DOWNLOAD CV
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border border-border px-5 py-3 text-xs tracking-[0.2em] transition-colors hover:bg-accent"
              >
                <Mail className="size-4" /> CONTACT ME
              </a>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex gap-4 text-muted-foreground">
              <Instagram className="size-4" />
              <MessageCircle className="size-4" />
            </div>
            <a href="#projects" className="label-xs flex flex-col items-center gap-1">
              PROJECTS
              <ChevronDown className="size-4" />
            </a>
          </div>
        </div>

        <div className="relative min-h-[60vh] lg:min-h-screen">
          <img
            src={portrait}
            alt="Chalif Ali Hussein, IT systems specialist"
            width={605}
            height={1075}
            className="absolute inset-0 size-full object-cover grayscale"
          />
          <p className="absolute bottom-6 right-6 max-w-[80%] text-right text-xs italic text-foreground/80 sm:text-sm">
            &quot;NO HATE FORMED AGAINST ME SHALL PROSPER&quot;
          </p>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="border-t border-border px-6 py-24 sm:px-12">
        <h2 className="label-xs">Projects</h2>
        <div className="mt-10 grid gap-px bg-border sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <article key={p.title} className="group bg-background p-6">
              <div className="overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-[4/3] w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
              <p className="label-xs mt-5">{p.tag}</p>
              <h3 className="mt-2 text-lg font-medium">{p.title}</h3>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section className="border-t border-border px-6 py-24 sm:px-12">
        <h2 className="label-xs">Skills</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {SKILLS.map((s) => (
            <div key={s.name}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm">{s.name}</h3>
                <span className="text-xs text-muted-foreground">{s.value}%</span>
              </div>
              <div className="mt-3 h-px w-full bg-border">
                <div className="h-px bg-foreground" style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CV */}
      <section id="profile" className="grid border-t border-border lg:grid-cols-[0.8fr_1.2fr]">
        <aside
          id="contact"
          className="space-y-10 border-border px-6 py-16 sm:px-12 lg:border-r"
        >
          <img
            src={portrait}
            alt="Chalif Ali Hussein"
            loading="lazy"
            width={605}
            height={1075}
            className="aspect-square w-40 object-cover object-top grayscale"
          />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">CHALIF</h2>
            <p className="text-xl font-light tracking-[0.25em] text-muted-foreground">
              ALI HUSSEIN
            </p>
            <p className="mt-2 text-sm text-muted-foreground">IT Systems Specialist</p>
          </div>

          <div>
            <h3 className="label-xs">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>📍 Kigali, Rwanda</li>
              <li>📞 0794744054</li>
              <li>✉ chalifhussein@gmail.com</li>
              <li>📷 @chalif01_</li>
            </ul>
          </div>

          <div>
            <h3 className="label-xs">Personal</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Age</span>
                <span className="text-foreground">20 Years</span>
              </li>
              <li className="flex justify-between">
                <span>Status</span>
                <span className="text-foreground">Single</span>
              </li>
              <li className="flex justify-between">
                <span>Nationality</span>
                <span className="text-foreground">Rwandan</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="label-xs">Languages</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Kinyarwanda</span>
                <span className="text-foreground">Native</span>
              </li>
              <li className="flex justify-between">
                <span>English</span>
                <span className="text-foreground">Fluent</span>
              </li>
              <li className="flex justify-between">
                <span>French</span>
                <span className="text-foreground">Intermediate</span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="divide-y divide-border">
          <div className="px-6 py-14 sm:px-12">
            <p className="label-xs">01</p>
            <h3 className="mt-2 text-xl font-medium">Profile</h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Dedicated and passionate IT professional with expertise in computer systems, network
              infrastructure and cyber security. Currently pursuing TVET certification in Computer
              Systems. Eager to apply technical knowledge and problem-solving skills in a
              professional environment while continuously expanding expertise in emerging
              technologies.
            </p>
          </div>

          <div className="px-6 py-14 sm:px-12">
            <p className="label-xs">02</p>
            <h3 className="mt-2 text-xl font-medium">Education</h3>
            <p className="label-xs mt-6">2023 — Present</p>
            <h4 className="mt-2 text-base font-medium">TVET — Computer System</h4>
            <p className="text-sm text-muted-foreground">Southern Province, Rwanda</p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>• Computer hardware maintenance and repair</li>
              <li>• Network installation and configuration</li>
              <li>• Operating system administration</li>
              <li>• IT security fundamentals</li>
            </ul>
          </div>

          <div className="px-6 py-14 sm:px-12">
            <p className="label-xs">03</p>
            <h3 className="mt-2 text-xl font-medium">Expertise</h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {EXPERTISE.map((e) => (
                <div key={e.title}>
                  <h4 className="text-sm font-medium">{e.title}</h4>
                  <p className="text-sm text-muted-foreground">{e.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-14 sm:px-12">
            <p className="label-xs">04</p>
            <h3 className="mt-2 text-xl font-medium">Interests &amp; Goals</h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Forex market analysis, emerging technologies, and building reliable infrastructure.
              Long-term goal: becoming a certified systems and security engineer while trading
              consistently with disciplined risk management.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-10 text-center sm:px-12">
        <p className="label-xs">© {new Date().getFullYear()} CHALIF ALI HUSSEIN</p>
      </footer>
    </main>
  );
}
