import Link from "next/link"

export default function Page() {
  const title = "partners".toUpperCase()
  return (
    <main className="space-site">
      <section className="hero-grid" style={{ minHeight: "100vh" }}>
        <div className="hero-copy">
          <p className="eyebrow">// SPACE HOVER / MODULE</p>
          <h1>{title}</h1>
          <p className="lede">This Space Hover module is part of the recreated Cubiz aerospace platform experience.</p>
          <div className="actions"><Link href="/">RETURN HOME →</Link></div>
        </div>
      </section>
    </main>
  )
}
