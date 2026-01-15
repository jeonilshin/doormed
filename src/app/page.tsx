'use client'

import { useState } from 'react'
import { 
  Pill, 
  Truck, 
  Calendar, 
  Shield, 
  Clock, 
  Heart, 
  CheckCircle, 
  Menu, 
  X,
  Package,
  Headphones,
  Users,
  Target,
  Eye
} from 'lucide-react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Pill className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">Doormedexpress</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-primary-500 transition">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-500 transition">How It Works</a>
              <a href="#about" className="text-gray-600 hover:text-primary-500 transition">About</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-500 transition">Contact</a>
              <button className="bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition">
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-gray-600 hover:text-primary-500">Services</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-primary-500">How It Works</a>
              <a href="#about" className="block text-gray-600 hover:text-primary-500">About</a>
              <a href="#contact" className="block text-gray-600 hover:text-primary-500">Contact</a>
              <button className="w-full bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Health, <span className="text-primary-500">Delivered.</span>
              <br />Hassle-Free.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Never miss a dose again. Doormedexpress delivers your maintenance medications 
              and supplements right to your doorstep with our convenient subscription service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-600 transition shadow-lg hover:shadow-xl">
                Start Your Subscription
              </button>
              <button className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-50 transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-500">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500">99.9%</div>
              <div className="text-gray-600">On-Time Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500">500+</div>
              <div className="text-gray-600">Products Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Key Offerings</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive subscription services designed to simplify your health management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<Pill className="h-8 w-8" />}
              title="Subscription-Based Medication Delivery"
              description="Automated refills and delivery of maintenance medications for chronic conditions like hypertension and cholesterol control."
            />
            <ServiceCard 
              icon={<Heart className="h-8 w-8" />}
              title="Supplement Delivery"
              description="Convenient, recurring delivery of vitamins, minerals, and health supplements tailored to your individual needs."
            />
            <ServiceCard 
              icon={<Calendar className="h-8 w-8" />}
              title="Hassle-Free Management"
              description="Intuitive online portal to manage subscriptions, update prescriptions, track deliveries, and adjust selections."
            />
            <ServiceCard 
              icon={<Package className="h-8 w-8" />}
              title="Discreet & Timely Delivery"
              description="Medications and supplements packaged discreetly and delivered directly to your doorstep on schedule."
            />
            <ServiceCard 
              icon={<Headphones className="h-8 w-8" />}
              title="Dedicated Customer Support"
              description="Expert assistance with prescription queries, subscription management, and general inquiries."
            />
            <ServiceCard 
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Reliable"
              description="Your health data is protected with industry-leading security measures and compliance standards."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with Doormedexpress is simple and straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard 
              number="1"
              title="Sign Up"
              description="Create your account and tell us about your medication and supplement needs."
            />
            <StepCard 
              number="2"
              title="Upload Prescription"
              description="Securely upload your prescriptions or have your doctor send them directly."
            />
            <StepCard 
              number="3"
              title="Choose Your Schedule"
              description="Select your preferred delivery frequency and customize your subscription."
            />
            <StepCard 
              number="4"
              title="Receive & Relax"
              description="Your medications arrive on time, every time. Never worry about refills again."
            />
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Doormedexpress?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              We make managing your health simple, reliable, and stress-free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard 
              icon={<Truck className="h-10 w-10" />}
              title="Convenience"
              description="Medications and supplements delivered directly, saving you time and effort."
            />
            <ValueCard 
              icon={<Clock className="h-10 w-10" />}
              title="Reliability"
              description="Never forget to re-purchase important health products with automated subscriptions."
            />
            <ValueCard 
              icon={<Shield className="h-10 w-10" />}
              title="Peace of Mind"
              description="Consistent access to essential health items ensures better health management."
            />
            <ValueCard 
              icon={<CheckCircle className="h-10 w-10" />}
              title="Simplicity"
              description="Easy-to-use platform for managing all health subscriptions in one place."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Doormedexpress</h2>
              <p className="text-lg text-gray-600 mb-6">
                Doormedexpress is an innovative online pharmacy specializing in a subscription-style 
                delivery model for a wide range of maintenance medications and health supplements.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our core focus is on essential medications for chronic conditions such as hypertension 
                and cholesterol control, alongside a comprehensive selection of vitamins and other daily supplements.
              </p>
              <p className="text-lg text-gray-600">
                We understand the critical importance of consistent medication adherence and the challenges 
                of managing recurring purchases. By leveraging a user-friendly online platform and a reliable 
                subscription service, we ensure that our customers never miss a dose or run out of their vital health products.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-primary-50 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <Target className="h-8 w-8 text-primary-500" />
                  <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-gray-600">
                  To revolutionize the way individuals manage their health by providing a seamless, 
                  subscription-based online pharmacy service, eliminating the stress and inconvenience 
                  of remembering to re-purchase essential maintenance medications and supplements.
                </p>
              </div>

              <div className="bg-secondary-50 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <Eye className="h-8 w-8 text-secondary-500" />
                  <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
                </div>
                <p className="text-gray-600">
                  To be the leading online pharmacy in providing proactive, personalized, and stress-free 
                  medication and supplement management, empowering individuals to live healthier, more consistent lives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who We Serve</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Doormedexpress is designed for anyone looking to simplify their health management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AudienceCard 
              icon={<Heart className="h-8 w-8 text-primary-500" />}
              title="Chronic Condition Patients"
              description="Individuals requiring consistent medication for conditions like hypertension or high cholesterol."
            />
            <AudienceCard 
              icon={<Clock className="h-8 w-8 text-primary-500" />}
              title="Busy Professionals"
              description="Those seeking convenience in managing health essentials without pharmacy visits."
            />
            <AudienceCard 
              icon={<Shield className="h-8 w-8 text-primary-500" />}
              title="Health-Conscious Individuals"
              description="People who regularly take vitamins and supplements for optimal wellness."
            />
            <AudienceCard 
              icon={<Users className="h-8 w-8 text-primary-500" />}
              title="Families"
              description="Households looking to streamline medication management for multiple family members."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Simplify Your Health Management?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of satisfied customers who never worry about running out of their medications again.
          </p>
          <button className="bg-white text-primary-500 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions about our services? Our dedicated support team is here to help 
                with prescription queries, subscription management, and general inquiries.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Headphones className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">24/7 Support</div>
                    <div className="text-gray-600">support@doormedexpress.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Subscription Help</div>
                    <div className="text-gray-600">subscriptions@doormedexpress.com</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pill className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">Doormedexpress</span>
              </div>
              <p className="text-gray-400">
                Your Health, Delivered. Hassle-Free.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Medication Delivery</a></li>
                <li><a href="#" className="hover:text-white transition">Supplement Subscriptions</a></li>
                <li><a href="#" className="hover:text-white transition">Prescription Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Doormedexpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component definitions
function ServiceCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition group">
      <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center text-primary-500 mb-4 group-hover:bg-primary-500 group-hover:text-white transition">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-primary-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="opacity-90">{description}</p>
    </div>
  )
}

function AudienceCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
