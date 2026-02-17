"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, animate } from "framer-motion"
import { ChevronRight, MousePointer2, X, Play } from "lucide-react"
import { TextReveal } from "@/components/shared/text-reveal"
import { useRouter } from "next/navigation"


export default function LandingPage() {
  const router = useRouter()
  const COLORS = ["#0ea5e9", "#8b5cf6", "#d946ef", "#0ea5e9"]
  const color = useMotionValue(COLORS[0])
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 10%, #000 40%, ${color})`
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  useEffect(() => {
    animate(color, COLORS, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    })
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black selection:bg-cyan-500/30">
      {/* Cinematic Background */}
      <motion.div
        style={{ backgroundImage }}
        className="absolute inset-0 z-0 opacity-40"
      />

      {/* Floating Particles/Glows */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px]"
        />
      </div>

      {/* Hero Content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
        >
          <Image
            src="/TVC logo white.png"
            alt="TVC Logo"
            width={16}
            height={16}
            className="h-4 w-4"
          />
          <span className="text-xs font-medium tracking-wider text-zinc-400 ">
            TVC presents
          </span>
        </motion.div>

        <TextReveal
          text="Internship Fair"
          glowWords={["Fair"]}
          className="max-w-4xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 max-w-2xl text-center text-base leading-relaxed text-zinc-400 sm:text-lg md:text-xl"
        >
          Shape Your Future with Elite Internships
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-12 flex flex-col items-center gap-4 px-4 sm:gap-6 sm:flex-row sm:px-0"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.replace("/login")}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-sm text-black hover:bg-zinc-100 sm:px-8 sm:py-4 sm:text-base"
          >
            <span className="relative z-10 font-bold">Get Started Now</span>
            <ChevronRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <motion.div
            whileHover={{ x: 5 }}
            onClick={() => setIsVideoModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer text-zinc-500 transition-colors hover:text-white px-4 py-2"
          >
            <span className="text-xs font-medium sm:text-sm">Learn how it works</span>
            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}

      </main>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
        <div className="h-full w-full bg-[grid_20px_20px] bg-[size:20px_20px]" />
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute -top-12 right-0 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Video Container */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                <video
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  playsInline
                  poster="/TVC logo white.png"
                >
                  <source src="/how-it-works-whatsapp.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Title */}
              <div className="mt-4 text-center px-2">
                <h3 className="text-lg font-bold text-white mb-2 sm:text-xl">How It Works</h3>
                <p className="text-xs text-zinc-400 max-w-2xl mx-auto sm:text-sm">
                  Learn how to navigate the Internship Portal and make the most of your job search journey.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

