"use client"

export default function LogoStrip() {
  const logos = ["Logoipsum", "Logoipsum", "Logoipsum", "Logoipsum", "Logoipsum"]

  return (
    <section className="bg-gray-800 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60 scroll-animate">
          {logos.map((logo, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="font-semibold text-lg">{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
