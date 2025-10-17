"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Phone, User, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }

  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {
    target: HTMLFormElement;
  }

  async function handleSubmit(e: HandleSubmitEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data: ContactFormData = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      message: formData.get("message")?.toString() || "",
    };

    try {
      const res: Response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("✅ Message sent successfully!");
        e.target.reset();
      } else {
        alert("❌ Failed to send message. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="relative bg-black text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 overflow-hidden"
    >
      {/* Background effects - Responsive sizing */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-5 w-20 h-20 sm:top-20 sm:left-10 sm:w-40 sm:h-40 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-xl sm:blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-24 h-24 sm:bottom-20 sm:right-20 sm:w-60 sm:h-60 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-xl sm:blur-3xl"></div>
        <div
          className="absolute inset-0 opacity-10 sm:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
            backgroundSize: "15px 15px sm:20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
        {/* Left side image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center order-2 lg:order-1"
        >
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg">
            <Image
              src="/images/getintouch.jpg"
              alt="Contact illustration"
              width={500}
              height={400}
              className="rounded-lg sm:rounded-xl w-full drop-shadow-[0_0_20px_rgba(16,185,129,0.2)] sm:drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
            />
            
            {/* Additional contact info for mobile */}
            <div className="mt-6 sm:mt-8 lg:hidden bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-500/20">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                Contact Info
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  <span>divyanshu4381@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  <span>+91 8957681217</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-b from-zinc-900 to-black border border-green-500/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl sm:shadow-2xl space-y-4 sm:space-y-5 order-1 lg:order-2"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Get In <span className="text-green-400">Touch</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              We'd love to hear from you! Whether you have a project idea or just
              want to say hi — drop a message and we'll get back to you soon.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                className="w-full bg-transparent border border-gray-700 text-white rounded-lg sm:rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 transition-all duration-300"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                className="w-full bg-transparent border border-gray-700 text-white rounded-lg sm:rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 transition-all duration-300"
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                name="phone"
                type="text"
                placeholder="Phone (Optional)"
                className="w-full bg-transparent border border-gray-700 text-white rounded-lg sm:rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 transition-all duration-300"
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-3 top-4 text-green-400 h-4 w-4 sm:h-5 sm:w-5" />
              <textarea
                name="message"
                rows={4}
                placeholder="Your Message"
                className="w-full bg-transparent border border-gray-700 text-white rounded-lg sm:rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 resize-none transition-all duration-300"
                required
              ></textarea>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60 text-sm sm:text-base cursor-pointer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </motion.button>

          {/* Contact info for desktop */}
          <div className="hidden lg:block pt-4 border-t border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-3">
              Direct Contact
            </h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-green-400" />
                <span className="text-sm">divyanshu4381@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-400" />
                <span className="text-sm">+91 8957681217</span>
              </div>
            </div>
          </div>
        </motion.form>
      </div>

      {/* Bottom decorative element */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto mt-8 sm:mt-12 text-center"
      >
        <p className="text-gray-400 text-xs sm:text-sm">
          💬 Typically replies within 2-4 hours
        </p>
      </motion.div>
    </section>
  );
}