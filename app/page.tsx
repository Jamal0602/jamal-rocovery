"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

const navItems = [
  ["01", "Home", "/"],
  ["02", "Research", "/research"],
  ["03", "Services", "/services"],
  ["04", "Software", "/software"],
  ["05", "Tracker", "/tracker"],
  ["06", "Cosmic", "/cosmic"],
  ["07", "Library", "/library"],
  ["08", "Community", "/community"],
  ["09", "Cubiz", "https://cubiz-space.vercel.app"],
  ["10", "Contact", "/contact"],
]

const modules = [
  ["01 / Live tracker", "ISS · HUBBLE · TIANGONG", "LIVE TRACKER", "Real-time orbital telemetry from public TLE feeds.", "/tracker"],
  ["02 / Cosmic 3D", "SOLAR SYSTEM", "COSMIC 3D", "Interactive solar system you can fly through.", "/cosmic"],
  ["03 / Library", "ENCYCLOPEDIA", "LIBRARY", "Curated, sourced articles on planets, missions and physics.", "/library"],
  ["04 / Community", "OPEN FORUM", "COMMUNITY", "Researchers, builders and the merely curious.", "/community"],
  ["05 / Network", "12 AGENCIES", "NETWORK", "NASA · ESA · ISRO · JAXA · CNSA · SpaceX · Blue Origin.", "/partners"],
  ["06 / Cubiz Group", "PARENT ECOSYSTEM", "CUBIZ GROUP", "Where Space Hover sits in the wider Cubiz platform.", "https://cubiz-space.vercel.app"],
]

const platforms = [
  ["PLATFORM", "MPA Platform", "Multi-platform architecture"],
  ["PLATFORM", "Bill Me", "Automated enterprise invoicing"],
  ["PLATFORM", "JA Platform", "Founder's strategic hub"],
  ["▶ ACTIVE", "Space Hover", "Aerospace R&D — you are here"],
]

const stats = [
  ["50+", "Research papers"],
  ["12", "Active projects"],
  ["8", "Global partners"],
  ["3", "Patents filed"],
]

function useUtcClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return useMemo(() => {
    if (!now) return "--:--:--"
    return now.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" })
  }, [now])
}

function EarthVisual() {
  return (
    <div className="earth-panel">
      <div className="panel-caption">// EARTH · LIVE RENDER · WEBGL</div>
      <div className="orbit-field">
        <div className="star s1" />
        <div className="star s2" />
        <div className="star s3" />
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />
        <div className="planet">
          <div className="planet-shade" />
        </div>
        <div className="satellite">◆</div>
      </div>
      <div className="ticker" aria-label="ISS telemetry">
        <span>
          ◆ISS · ALT 408.2 KM◆VEL 7.660 KM/S◆LAT 41.89°◆LNG -87.62°◆SIGNAL 98.7%◆POWER 94.2%◆NASA JPL
          HORIZONS◆CELESTRAK TLE◆
        </span>
        <span>
          ◆ISS · ALT 408.2 KM◆VEL 7.660 KM/S◆LAT 41.89°◆LNG -87.62°◆SIGNAL 98.7%◆POWER 94.2%◆NASA JPL
          HORIZONS◆CELESTRAK TLE◆
        </span>
      </div>
    </div>
  )
}

export default function Home() {
  const utc = useUtcClock()

  return (
    <main className="space-site">
      <header className="topbar">
        <Link href="/" className="brand"><span>◉</span><strong>SPACE HOVER</strong><small>A CUBIZ GROUP VENTURE</small></Link>
        <nav className="navline">{navItems.map(([n, label, href]) => <Link key={label} href={href}>{n} {label}</Link>)}</nav>
        <div className="status"><span>{utc} UTC</span><b>LIVE☀</b><Link href="/signin">SIGN IN</Link><button>≡</button></div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">// HOVER ENGINE / V2.0 / A CUBIZ GROUP VENTURE</p>
          <h1>THE HEART<br />OF SPACE<br />RESEARCH.</h1>
          <p className="lede">An open, real-time aerospace platform. We do basic space research, data engineering, vehicle and probe design, and ship the software that ties it all together.</p>
          <div className="actions"><Link href="/tracker">LAUNCH TRACKER →</Link><Link href="/cosmic">ENTER COSMIC →</Link><Link href="/library">OPEN LIBRARY →</Link></div>
          <div className="mission-grid"><div><span>UTC NOW</span><strong>{utc}</strong></div><div><span>MISSION CLOCK</span><strong>T+ 000:00:00</strong><em>SINCE LAUNCH</em></div><div><span>STATUS</span><strong>NOMINAL</strong></div></div>
        </div>
        <EarthVisual />
      </section>

      <section className="split section"><div className="section-num">01 WHO WE ARE</div><h2>A multidisciplinary space R&amp;D studio.</h2><div className="copy"><p>Space Hover is the aerospace arm of Cubiz Group — a studio at the intersection of space science, engineering and design.</p><p>We work across five tracks: basic space research, data manipulation and pipelines, data research, vehicle &amp; probe design, and the guidance, navigation &amp; control systems that fly them.</p><p>Everything we publish is open, sourced and reproducible. No magic numbers — just physics.</p></div></section>

      <section className="section"><div className="section-num">02 MODULES</div><div className="module-grid">{modules.map(([meta,kicker,title,desc,href]) => <Link href={href} className="module-card" key={title}><span>{meta}</span><small>{kicker}</small><h3>{title}</h3><p>{desc}</p><b>ENTER →</b></Link>)}</div></section>

      <section className="cubiz section"><div><p className="eyebrow">// CUBIZ GROUP</p><h2>One hub. Many platforms.</h2><Link href="https://cubiz-space.vercel.app">VISIT CUBIZ →</Link></div><div className="platforms">{platforms.map(([tag,name,desc]) => <div className="platform" key={name}><span>{tag}</span><strong>{name}</strong><small>{desc}</small></div>)}</div></section>

      <section className="stats section"><div className="section-num">03 BY THE NUMBERS</div>{stats.map(([num,label]) => <div key={label}><strong>{num}</strong><span>{label}</span></div>)}</section>

      <section className="manifesto"><p>// MANIFESTO</p><blockquote>“OPEN DATA. REAL ORBITS. NO MAGIC NUMBERS. JUST PHYSICS, PUBLISHED FOR EVERYONE.”</blockquote><span>— SPACE HOVER / A CUBIZ GROUP VENTURE</span></section>

      <footer className="space-footer"><div><h3>SPACE HOVER</h3><p>A Cubiz Group venture. Open data. Real orbits. No magic numbers.</p><Link href="https://cubiz-space.vercel.app">CUBIZ-SPACE.VERCEL.APP →</Link></div><div><b>// EXPLORE</b><Link href="/">Home / About</Link><Link href="/research">Research</Link><Link href="/services">Services</Link><Link href="/software">Software</Link><Link href="/partners">Partners</Link></div><div><b>// TOOLS</b><Link href="/tracker">Live tracker</Link><Link href="/cosmic">Cosmic 3D</Link><Link href="/library">Library</Link><Link href="/community">Community</Link><Link href="/contact">Contact</Link></div><div><b>// SOURCES</b><span>NASA JPL Horizons</span><span>CelesTrak TLE</span><span>WhereTheISS.at</span><span>ESA · ISRO · JAXA</span></div></footer>
      <div className="copyright"><span>© 2026 SPACE HOVER · CUBIZ GROUP</span><span>HOVER ENGINE / V2.0 / SPACE R&amp;D</span></div>
    </main>
  )
}
