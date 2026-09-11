import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

// ── Work item data ────────────────────────────────────────────
// fit: 'contain' for wordmark/poster logos where cropping cuts off text;
// 'cover' (default) for photos/illustrations that tolerate a center-crop.

interface WorkItem {
  title: string;
  tag: string;
  desc: string;
  accent: string;
  logo: string;
  fit?: 'contain' | 'cover';
  to?: string;
  href?: string;
}

interface Lane {
  id: string;
  label: string;
  items: WorkItem[];
}

const LANES: Lane[] = [
  {
    id: 'hcd',
    label: 'Human-Centered Design',
    items: [
      { title: 'Saver Sports', tag: 'Youth Sports', desc: 'Empowers young athletes through community support.', accent: '#7ea740', logo: '/SaverLogo.jpeg', fit: 'contain', to: '/ProjectSaverSports' },
      { title: 'Sparkathon', tag: 'Entrepreneurship Event', desc: 'A human-centered design, community pitch competition hosted by Pomona Ventures.', accent: '#4093b9', logo: '/Sparkathon.png', fit: 'contain', to: '/Sparkathon' },
      { title: 'Cross-campus Staff Community', tag: 'Community', desc: 'Staff collaboration across campuses fosters a stronger community.', accent: '#7273cb', logo: '/Tccs.png', to: '/project-two' },
      { title: 'Intergenerational Connectivity', tag: 'Community', desc: 'Intergenerational connections create meaningful relationships.', accent: '#3b9a8f', logo: '/banner.png', to: '/project-one' },
      { title: 'Edulis Labs', tag: 'GTM Strategy', desc: 'A GTM strategy for a startup challenging norms.', accent: '#9f6ecf', logo: '/EdulisLogo.png', fit: 'contain', to: '/Edulis' },
    ],
  },
  {
    id: 'startup',
    label: 'Startups & Operating',
    items: [
      { title: 'Crescent Fund & Crater Ventures', tag: 'VC', desc: "Investing in SoCal's biggest dreamers at early stages.", accent: '#399a7a', logo: '/crater.jpeg', href: 'https://crater.vc/' },
      { title: 'Madison Reed & True Ventures', tag: 'Data Science', desc: 'Data science with Madison Reed as part of the True Ventures Fellowship.', accent: '#8c6ece', logo: '/TVLogo2.jpg', fit: 'contain', href: 'https://trueventures.com' },
      { title: 'Verita AI', tag: 'Human Data', desc: 'Special Projects Lead (Operations) at a multimodal data startup.', accent: '#c09040', logo: '/Verita.png', href: 'https://verita-ai.com' },
      { title: 'InstaLILY', tag: 'AI Startup', desc: 'Growth at InstaLILY, an AI startup for the physical economy.', accent: '#5e87ca', logo: '/instalily-logo.png', fit: 'contain', href: 'https://www.instalily.ai/' },
    ],
  },
  {
    id: 'fun',
    label: 'Fun & Personal',
    items: [
      { title: 'Frary Tale', tag: 'Storytelling', desc: 'Documenting journeys with Claremont Entrepreneurs for the community.', accent: '#c96173', logo: '/FraryTale_resized_16_9.png', to: '/FraryTale' },
      { title: 'Ground', tag: 'Wellness', desc: 'An accessible, light-hearted way to ground ourselves in the present.', accent: '#66ba85', logo: '/Ground.png', fit: 'contain', to: '/Ground' },
      { title: 'Coldplay', tag: 'Music', desc: 'My favorite band of all time.', accent: '#ccb94e', logo: '/parachutes.png', to: '/coldplay' },
    ],
  },
];

// ── Tilt — a light touch, pointer/motion-safe ─────────────────

const canTilt = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Work row ───────────────────────────────────────────────────

const WorkRow: React.FC<{ item: WorkItem; index: number; isLast: boolean }> = ({ item, index, isLast }) => {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!canTilt() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(700px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 3).toFixed(2)}deg) translateY(-1px)`;
  };
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  const kind = item.to ? 'case study' : 'company ↗';

  const inner = (
    <>
      <img
        src={item.logo}
        alt=""
        className="work-row-logo"
        style={{ objectFit: item.fit ?? 'cover' }}
      />
      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-beezee font-bold text-[15px] text-[#001d36]">{item.title}</span>
          <span
            className="font-beezee text-[10.5px] tracking-wide uppercase px-2 py-0.5 rounded whitespace-nowrap"
            style={{ color: item.accent, background: 'rgba(0,29,54,0.05)' }}
          >
            {item.tag}
          </span>
        </div>
        <p className="font-beezee text-[13.5px] leading-snug text-[#001d36]/60" style={{ maxWidth: '58ch' }}>
          {item.desc}
        </p>
      </div>
      <span className="font-beezee text-[12.5px] text-[#001d36]/55 whitespace-nowrap self-center">
        {kind} →
      </span>
    </>
  );

  const rowStyle: React.CSSProperties | undefined = isLast ? { borderBottom: 'none' } : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
    >
      {item.to ? (
        <Link
          ref={ref}
          to={item.to}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="work-row"
          style={rowStyle}
        >
          {inner}
        </Link>
      ) : (
        <a
          ref={ref}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="work-row"
          style={rowStyle}
        >
          {inner}
        </a>
      )}
    </motion.div>
  );
};

// ── Lane ─────────────────────────────────────────────────────

const WorkLane: React.FC<{ lane: Lane }> = ({ lane }) => (
  <div id={lane.id === 'fun' ? 'fun-stuff' : undefined} className="mb-10 scroll-mt-24">
    <div className="flex items-baseline gap-2.5 mb-2">
      <h2 className="font-patrickReg text-[1.4rem] text-[#001d36]">{lane.label}</h2>
      <span className="font-beezee text-xs text-[#001d36]/35 tabular-nums">{lane.items.length}</span>
    </div>
    <div>
      {lane.items.map((item, i) => (
        <WorkRow key={item.title} item={item} index={i} isLast={i === lane.items.length - 1} />
      ))}
    </div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────

const Work: React.FC = () => {
  return (
    <section className="container mx-auto px-6 md:px-8 py-16 max-w-[860px]">

      <motion.h1
        className="font-patrickReg text-[2.1rem] md:text-[2.5rem] text-[#001d36] mb-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        Selected work
      </motion.h1>
      <motion.p
        className="font-beezee text-[14.5px] text-[#001d36]/60 leading-relaxed mb-8"
        style={{ maxWidth: '62ch' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        Human-centered design, startups I've built and invested in, and a few things I make for fun.
      </motion.p>

      <div className="flex flex-wrap gap-2.5 mb-9">
        <a
          className="glass-pill"
          style={{ '--pill-tint': 'rgba(59,154,143,0.14)', '--pill-border': 'rgba(59,154,143,0.35)' } as React.CSSProperties}
          href="mailto:jayyy.suh@gmail.com"
        >
          ✉ Email me
        </a>
        <a
          className="glass-pill"
          style={{ '--pill-tint': 'rgba(94,135,202,0.14)', '--pill-border': 'rgba(94,135,202,0.35)' } as React.CSSProperties}
          href="https://www.linkedin.com/in/jayhyunsuh/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn ↗
        </a>
      </div>

      {LANES.map(lane => (
        <WorkLane key={lane.id} lane={lane} />
      ))}

    </section>
  );
};

export default Work;
