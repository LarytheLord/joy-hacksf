"use client"

import { Button } from "@/components/ui/button"
import { Code2, Play, Users, Split, Globe, ArrowRight, Github, Twitter, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Joy Hacks</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/explore"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Explore
              </Link>
              <Link
                href="/community"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Community
              </Link>
              <Link href="/create" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Create
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-4"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="gradient-bg-blue-purple text-white rounded-full px-4 transition-all duration-200 hover:scale-105"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Code meets
              <br />
              <span className="gradient-text animate-pulse">creativity</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed font-light">
              Share your code snippets alongside their live results.
              <br />A new way to showcase and discover programming magic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gradient-bg-blue-purple hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-3 text-base font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Get started for free
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-blue-600 hover:text-blue-700 rounded-full px-8 py-3 text-base font-medium group backdrop-blur-sm border border-blue-200 shadow-sm"
                >
                  Explore reels
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform animate-pulse" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border border-blue-100/50">
              <div className="grid md:grid-cols-2 gap-8 h-96 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl"></div>
                {/* Code Side */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-xl border border-gray-700">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-red-500 rounded-full hover:animate-pulse cursor-pointer"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full hover:animate-pulse cursor-pointer"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full hover:animate-pulse cursor-pointer"></div>
                    </div>
                    <span className="text-sm text-gray-400 ml-2 font-mono">animation.js</span>
                  </div>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="text-purple-400">const</div>
                    <div className="text-blue-400">createRipple = (x, y) =&gt; {"{"}</div>
                    <div className="text-green-400 ml-4">const ripple = document</div>
                    <div className="text-green-400 ml-6">.createElement('div')</div>
                    <div className="text-yellow-400 ml-4">ripple.style.left = x + 'px'</div>
                    <div className="text-yellow-400 ml-4">ripple.style.top = y + 'px'</div>
                    <div className="text-pink-400 ml-4">ripple.classList.add('ripple')</div>
                    <div className="text-gray-300 ml-4">return ripple</div>
                    <div className="text-blue-400">{"}"}</div>
                  </div>
                </div>

                {/* Result Side */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 flex items-center justify-center border border-blue-100 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-300/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-300/10 rounded-full blur-3xl"></div>
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full animate-ping animation-delay-200"></div>
                      <div className="absolute inset-4 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full animate-ping animation-delay-400"></div>
                      <div className="absolute inset-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Interactive ripple effect</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Built for developers</h2>
            <p className="text-xl text-gray-600 font-light">Everything you need to share and discover amazing code</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Split,
                title: "Split-screen magic",
                description:
                  "See your code and its live output side by side in an elegant, distraction-free interface.",
              },
              {
                icon: Globe,
                title: "Multiple formats",
                description: "Support for text output, images, interactive demos, and embedded web components.",
              },
              {
                icon: Users,
                title: "Developer community",
                description: "Connect with fellow developers, share knowledge, and discover inspiring code snippets.",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Simple. Powerful. Elegant.
            </h2>
            <p className="text-xl text-gray-600 font-light">Three steps to transform your code into visual stories</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Write your code",
                description: "Create your snippet in any language. Add context and choose your output format.",
              },
              {
                step: "02",
                title: "See it live",
                description: "Watch your code come to life with real-time execution and beautiful presentation.",
              },
              {
                step: "03",
                title: "Share & discover",
                description: "Publish to the community feed and explore amazing creations from other developers.",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-gray-100 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 -right-6 text-gray-300">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                Code that tells
                <br />a story
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light">
                Transform static code snippets into engaging, interactive experiences. Perfect for tutorials,
                portfolios, and sharing your latest discoveries.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time code execution",
                  "Beautiful syntax highlighting",
                  "Interactive output display",
                  "One-click sharing",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50">
                <img
                  src="/placeholder.svg?height=400&width=500"
                  alt="Code showcase interface"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Join thousands of developers sharing their code creations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="gradient-bg-blue-purple hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-3 text-base font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Start creating for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 py-3 text-base font-medium backdrop-blur-sm border border-blue-200 shadow-sm"
              >
                Explore reels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Joy Hacks</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The platform where code meets creativity. Share, discover, and learn from the global developer
              community.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {[
            {
              title: "Product",
              links: [
                { name: "Explore", href: "/explore" },
                { name: "Create", href: "/create" },
                { name: "Profile", href: "/profile" },
                { name: "Documentation", href: "/docs" },
              ],
            },
            {
              title: "Community",
              links: [
                { name: "Featured", href: "/featured" },
                { name: "Developers", href: "/community" },
                { name: "Blog", href: "/blog" },
                { name: "Newsletter", href: "/newsletter" },
              ],
            },
            {
              title: "Support",
              links: [
                { name: "Help Center", href: "/help" },
                { name: "Contact", href: "/contact" },
                { name: "Status", href: "/status" },
                { name: "Feedback", href: "/feedback" },
              ],
            },
          ].map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</div>
</footer>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .gradient-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(to right, #3b82f6, #8b5cf6);
        }
        .gradient-bg-blue-purple {
          background-image: linear-gradient(to right, #3b82f6, #8b5cf6);
        }
      `}</style>
</div>
)
}
