import Header from "@/components/header"
import Footer from "@/components/footer"
import Contact from "@/components/contact"

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container">
            <Contact />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}

