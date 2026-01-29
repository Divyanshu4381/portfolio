"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="text-center z-10 space-y-8 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-9xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4"
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-white">
                        Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Oops! The page you're looking for seems to have vanished into the digital void.
                        It might have been moved or deleted.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                >
                    <Link href="/">
                        <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 rounded-full text-lg font-medium transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
                            <Home className="mr-2 h-5 w-5" />
                            Back to Home
                        </Button>
                    </Link>

                    <Link href="/blog">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-medium">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Read Blog
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Decorative Grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}
            />
        </div>
    )
}
