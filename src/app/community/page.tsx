\"use client"

import { Button } from "@/components/ui/button"
import { Code2, Users, Globe } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Our Community</h2>
            <p className="text-xl text-gray-600 font-light">Connect with developers from around the world</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Share Knowledge",
                description: "Learn from other developers and share your expertise with the community."
              },
              {
                icon: Code2,
                title: "Collaborate",
                description: "Work together on projects and solve coding challenges as a team."
              },
              {
                icon: Globe,
                title: "Global Network",
                description: "Connect with developers from different countries and cultures."
              }
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
    </div>
  )
}