import React from 'react'

interface CityIntroProps {
    cityName: string
    intro: string
    stats: string
    localInsight: string
    cta: string
}

export default function CityIntroSection({ cityName, intro, stats, localInsight, cta }: CityIntroProps) {
    return (
        <section className="bg-gradient-to-b from-gray-900 to-black py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* City-Specific Intro */}
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Professional Web Development Services in {cityName}
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                        {intro}
                    </p>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-green-400">Market Demand</h3>
                    </div>
                    <p className="text-gray-200 text-lg font-medium">{stats}</p>
                </div>

                {/* Local Insight */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">Local Market Insight</h3>
                            <p className="text-gray-300 leading-relaxed">{localInsight}</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <p className="text-xl text-green-400 font-semibold mb-4">{cta}</p>
                    <a
                        href="#contact"
                        className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
                    >
                        Get Started Today
                    </a>
                </div>
            </div>
        </section>
    )
}
