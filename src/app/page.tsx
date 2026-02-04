'use client'

import { useState, useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  Menu, 
  X,
  ArrowRight,
  ChevronDown,
  Play
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollScale, setScrollScale] = useState(1)
  const [problemImageScale, setProblemImageScale] = useState(1.15)
  const [navVisible, setNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [handParallax, setHandParallax] = useState({ y: 0, x: 0, isSticky: false, isAbsoluteAtBottom: false })
  const lenisRef = useRef<Lenis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logoDriveOff, setLogoDriveOff] = useState(false)
  const horizontalRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Start logo drive-off animation after 1.5 seconds
    const driveOffTimer = setTimeout(() => {
      setLogoDriveOff(true)
    }, 1500)

    // Hide loader after logo drives off (2.5 seconds total)
    const loaderTimer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    return () => {
      clearTimeout(driveOffTimer)
      clearTimeout(loaderTimer)
    }
  }, [])

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      wheelMultiplier: 0.6,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    // Wait for loading to finish before setting up horizontal scroll
    if (isLoading) return

    // Check if mobile
    const isMobile = window.innerWidth < 768

    // Only set up horizontal scroll on desktop
    if (!isMobile) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (horizontalRef.current && cardsRef.current) {
          const cards = cardsRef.current
          const scrollWidth = cards.scrollWidth - window.innerWidth

          const scrollTween = gsap.to(cards, {
            x: -scrollWidth,
            ease: 'none',
            scrollTrigger: {
              trigger: horizontalRef.current,
              pin: true,
              scrub: 1,
              start: 'top top',
              end: () => `+=${scrollWidth + window.innerHeight}`, // Add extra scroll before cards move
              invalidateOnRefresh: true,
            },
          })

          return () => {
            scrollTween.kill()
          }
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }
  }, [isLoading])

  useEffect(() => {
    let animationId: number
    let targetScale = 1
    let currentScale = 1
    let targetProblemScale = 1.15
    let currentProblemScale = 1.15
    let targetHandY = 0
    let targetHandX = 0
    let currentHandY = 0
    let currentHandX = 0

    const handleScroll = () => {
      const scrollY = window.scrollY
      
      // Nav show/hide logic
      if (scrollY > lastScrollY && scrollY > 100) {
        setNavVisible(false) // scrolling down
      } else {
        setNavVisible(true) // scrolling up
      }
      setLastScrollY(scrollY)
      
      // Hero image zoom
      targetScale = 1 + (scrollY * 0.0004)
      targetScale = Math.min(targetScale, 1.25)
      
      // Problem section image zoom (starts zoomed in, zooms out on scroll)
      const problemSection = document.getElementById('problem-section')
      if (problemSection) {
        const rect = problemSection.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height * 0.5)))
        targetProblemScale = 1.15 - (progress * 0.15)
      }
      
      // Hand parallax effect - becomes sticky and stops at bottom of dark green section
      // Only apply on desktop (md breakpoint and above)
      const isMobile = window.innerWidth < 768
      if (!isMobile) {
        const darkGreenSection = document.getElementById('features-dark-section')
        const peopleSection = document.getElementById('people-section')
        if (darkGreenSection && peopleSection) {
          const darkRect = darkGreenSection.getBoundingClientRect()
          const windowHeight = window.innerHeight
          
          // Check if dark green section is in view
          const isInDarkSection = darkRect.top <= windowHeight && darkRect.bottom > 0
          
          // When dark section bottom is above viewport bottom, hand should be absolute at bottom of section
          const shouldBeAbsolute = darkRect.bottom <= windowHeight && darkRect.bottom > 0
          
          setHandParallax(prev => ({ 
            ...prev, 
            isSticky: isInDarkSection && !shouldBeAbsolute,
            isAbsoluteAtBottom: shouldBeAbsolute
          }))
        }
      } else {
        // On mobile, ensure hand is never sticky
        setHandParallax(prev => ({ 
          ...prev, 
          isSticky: false,
          isAbsoluteAtBottom: false
        }))
      }
    }

    const animate = () => {
      currentScale += (targetScale - currentScale) * 0.02
      currentProblemScale += (targetProblemScale - currentProblemScale) * 0.025
      currentHandY += (targetHandY - currentHandY) * 0.03
      currentHandX += (targetHandX - currentHandX) * 0.03
      setScrollScale(currentScale)
      setProblemImageScale(currentProblemScale)
      setHandParallax(prev => ({ ...prev, y: currentHandY, x: currentHandX }))
      animationId = requestAnimationFrame(animate)
    }

    window.addEventListener('scroll', handleScroll)
    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(animationId)
    }
  }, [lastScrollY])

  return (
    <div className="min-h-screen bg-[#f0f68d]">
      {/* Loader */}
      <div 
        className={`fixed inset-0 bg-[#1a4b38] z-[9999] flex items-center justify-center transition-transform duration-1000 ease-in-out ${
          isLoading ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div 
          className={`transition-all duration-1000 ease-in-out ${
            logoDriveOff ? 'translate-x-[200vw] scale-75' : 'translate-x-0'
          } ${!logoDriveOff ? 'animate-pulse' : ''}`}
        >
          <img src="/medex.png" alt="DoorMedExpress" className="h-24 md:h-32 lg:h-36 brightness-0 invert" />
        </div>
      </div>

      {/* Hero Background with curved bottom */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#f2f7e8] rounded-b-[80px] md:rounded-b-[150px]" style={{ height: 'calc(100% - 100px)' }}></div>
        
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 py-6 px-6 md:px-12 lg:px-20 bg-[#f2f7e8] transition-transform duration-300 ease-in-out ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/medex.png" alt="DoorMed Express" className="h-10" />
          </div>

          {/* Desktop Nav - Center pill */}
          <div className="hidden md:flex items-center gap-6 bg-[#e4ecd8] rounded-full px-6 py-3">
            <div className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition cursor-pointer text-sm">
              Solution <ChevronDown className="h-4 w-4" />
            </div>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition text-sm">For Patients</a>
            <div className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition cursor-pointer text-sm">
              Partnerships <ChevronDown className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition cursor-pointer text-sm">
              Resources <ChevronDown className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition cursor-pointer text-sm">
              Contact Us <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Get Started Button */}
          <button className="hidden md:flex items-center gap-3 bg-[#1b4332] text-[#c9e265] px-4 py-3 rounded-full text-sm font-medium hover:bg-[#143528] transition">
            <div className="w-8 h-8 bg-[#c9e265]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowRight className="h-4 w-4" />
            </div>
            <span className="text-base">Get started</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#dce5d0] pt-4">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-gray-700">Solution</a>
              <a href="#" className="text-gray-700">For Patients</a>
              <a href="#" className="text-gray-700">Partnerships</a>
              <a href="#" className="text-gray-700">Resources</a>
              <a href="#" className="text-gray-700">Contact Us</a>
              <button className="bg-[#1b4332] text-[#c9e265] px-5 py-3 rounded-full text-sm font-medium">
                Get started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 lg:px-20 pt-28 md:pt-36 pb-12">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-[#2d4a3e] leading-tight">
            Your Health, Delivered.
            <br />
            Hassle-Free.
          </h1>

          {/* Subheading */}
          <p className="mt-8 text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Never forget to re-purchase your essential medications and supplements again. DoorMedExpress delivers your maintenance medications for chronic conditions and daily supplements directly to your door, automatically.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col md:flex-row justify-center gap-4 w-[50%] md:max-w-md mx-auto">
            <button className="flex items-center gap-3 bg-[#1b4332] text-[#c9e265] px-4 py-2.5 rounded-full font-medium hover:bg-[#143528] transition">
              <div className="w-8 h-8 bg-[#c9e265]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <ArrowRight className="h-4 w-4" />
              </div>
              <span className="text-base md:text-lg flex-1 text-left">Get started</span>
            </button>
            <button className="flex items-center gap-3 bg-[#e4ecd8] text-[#1b4332] px-4 py-2.5 rounded-full font-medium hover:bg-[#dce5d0] transition">
              <div className="w-8 h-8 bg-[#1b4332] rounded-full flex items-center justify-center flex-shrink-0">
                <Play className="h-4 w-4 text-[#c9e265] fill-[#c9e265]" />
              </div>
              <span className="text-base md:text-lg flex-1 text-left">Book a Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative pb-20 mt-16">
        <div className="relative px-6 md:px-12 lg:px-20">
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-[40px] overflow-hidden transition-transform duration-300 ease-out"
              style={{ transform: `scale(${scrollScale})` }}
            >
              <img 
                src="/hero.jpg" 
                alt="Healthcare Team" 
                className="w-full h-[300px] md:h-[450px] object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Chartreuse Section - The Problem */}
      <section id="problem-section" className="bg-[#f0f68d] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left Content */}
            <div>
              <span className="inline-flex items-center gap-2 text-sm text-[#1b4332]/70 mb-6">
                <span className="w-2 h-2 bg-[#1b4332]/50 rounded-full"></span>
                The Problem
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#1b4332] leading-tight">
                Forgetting to
                <br />
                Re-Purchase Your
                <br />
                Meds Shouldn&apos;t Happen
              </h2>
              <p className="mt-8 text-[#1b4332]/70 text-lg leading-relaxed max-w-md">
                Managing chronic conditions like hypertension and high cholesterol requires consistency. Missing doses because you forgot to refill your prescription can impact your health. DoorMedExpress ensures you never run out.
              </p>
              <button className="mt-8 flex items-center gap-3 bg-[#1b4332] text-[#c9e265] px-4 py-4 rounded-full font-medium hover:bg-[#143528] transition">
                <div className="w-8 h-8 bg-[#c9e265]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <span className="text-base md:text-lg">Get Started</span>
              </button>
            </div>

            {/* Right Image */}
            <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" 
                alt="Healthcare professional" 
                className="w-full h-full object-cover transition-transform duration-300 ease-out"
                style={{ transform: `scale(${problemImageScale})` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-[#e9f9df] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-sm text-[#1b4332] bg-[#d4e857] px-4 py-2 rounded-full mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            The Solution
          </span>
          
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#1b4332] leading-tight">
            Automated Medication & Supplement
            <br />
            Delivery That Never Fails
          </h2>
          
          {/* Description */}
          <p className="mt-8 text-[#1b4332]/70 text-lg leading-relaxed max-w-3xl mx-auto">
            DoorMedExpress specializes in subscription-based delivery for maintenance medications treating chronic conditions like hypertension and cholesterol control, plus a comprehensive selection of vitamins and daily supplements. Set it once, and we handle the rest.
          </p>
        </div>
      </section>

      {/* People Grid with Hand Section */}
      <section id="people-section" className="bg-[#e9f9df] pb-[120px] md:pb-[300px] px-2 md:px-4 relative">
        <div className="max-w-full mx-auto">
          {/* People Grid - 2 on mobile, 4 on desktop */}
          <div className="flex justify-center items-end gap-32 md:gap-5">
            {/* Left 2 People - Always visible, wider on mobile with big gap */}
            <div className="rounded-[30px] overflow-hidden w-[30%] md:flex-1 h-[320px] md:h-[480px] lg:h-[520px]">
              <img 
                src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80" 
                alt="Happy customer" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="rounded-[30px] overflow-hidden w-[30%] md:flex-1 h-[320px] md:h-[480px] lg:h-[520px]">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" 
                alt="Happy customer" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Center Gap for Hand - Hidden on mobile */}
            <div className="hidden md:block w-[240px] lg:w-[300px] flex-shrink-0"></div>
            
            {/* Right 2 People - Hidden on mobile */}
            <div className="hidden md:block rounded-[30px] overflow-hidden flex-1 h-[320px] md:h-[480px] lg:h-[520px]">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" 
                alt="Happy customer" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="hidden md:block rounded-[30px] overflow-hidden flex-1 h-[320px] md:h-[480px] lg:h-[520px]">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" 
                alt="Happy customer" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Hand with Phone - Normal position when not sticky, centered on mobile, overlapping cards */}
          {!handParallax.isSticky && (
            <div className="absolute left-1/2 -translate-x-[65%] md:-translate-x-[65%] bottom-0 z-20">
              <img 
                src="/hand.png" 
                alt="DoorMed Express App" 
                className="w-[310px] md:w-[460px] lg:w-[540px] h-auto max-w-none"
              />
            </div>
          )}
        </div>
      </section>

      {/* Hand with Phone - Fixed/Sticky when scrolling through dark green section - Hidden on mobile */}
      {handParallax.isSticky && (
        <div 
          className="hidden md:block fixed left-1/2 -translate-x-[65%] z-30 pointer-events-none"
          style={{ bottom: '0px' }}
        >
          <img 
            src="/hand.png" 
            alt="DoorMed Express App" 
            className="w-[260px] md:w-[460px] lg:w-[540px] h-auto"
          />
        </div>
      )}

      {/* Key Features Section - Dark Green */}
      <section id="features-dark-section" className="bg-[#1b4332] py-24 md:py-32 px-6 md:px-12 lg:px-20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left - Features List - Centered on mobile */}
            <div className="space-y-12 md:space-y-16 max-w-md mx-auto md:mx-0">
              {/* Feature 1 */}
              <div className="text-center md:text-left border-b border-white/10 pb-8 md:border-0 md:pb-0">
                <div className="w-10 h-10 bg-[#c9e265] rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <svg className="w-5 h-5 text-[#1b4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-4xl font-serif italic text-white mb-3">Automated Subscriptions</h3>
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xs mx-auto md:mx-0">
                  Set your delivery schedule once. Your maintenance medications and supplements arrive automatically every month.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center md:text-left border-b border-white/10 pb-8 md:border-0 md:pb-0">
                <div className="w-10 h-10 bg-[#c9e265] rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <svg className="w-5 h-5 text-[#1b4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-4xl font-serif italic text-white mb-3">Chronic Condition Support</h3>
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xs mx-auto md:mx-0">
                  Specialized in medications for hypertension, cholesterol control, and other chronic conditions requiring consistent adherence.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center md:text-left">
                <div className="w-10 h-10 bg-[#c9e265] rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <svg className="w-5 h-5 text-[#1b4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-4xl font-serif italic text-white mb-3">Easy Online Management</h3>
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xs mx-auto md:mx-0">
                  Intuitive portal to manage subscriptions, update prescriptions, track deliveries, and adjust your product selections anytime.
                </p>
              </div>
            </div>

            {/* Right - Video Placeholder Images - Hidden on mobile */}
            <div className="hidden md:flex flex-col gap-6">
              <div className="rounded-3xl overflow-hidden h-[300px] bg-[#2d5a45]">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" 
                  alt="Video placeholder 1" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden h-[300px] bg-[#2d5a45]">
                <img 
                  src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80" 
                  alt="Video placeholder 2" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Download App - Smaller on mobile, one line */}
          <div className="mt-12 md:mt-16 flex flex-col md:items-end items-center gap-4 md:gap-6">
            <span className="text-white text-sm md:text-lg font-medium">Download DoorMed Express</span>
            <div className="flex gap-2 md:gap-4">
              <button className="flex items-center gap-2 md:gap-4 bg-white/10 hover:bg-white/20 transition px-3 md:px-6 py-2 md:py-4 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-12 md:h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[8px] md:text-xs text-white/70">Download on the</div>
                  <div className="text-xs md:text-lg text-white font-semibold">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 md:gap-4 bg-white/10 hover:bg-white/20 transition px-3 md:px-6 py-2 md:py-4 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-12 md:h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[8px] md:text-xs text-white/70">GET IT ON</div>
                  <div className="text-xs md:text-lg text-white font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Hand at bottom of dark green section - Hidden on mobile */}
        {handParallax.isAbsoluteAtBottom && (
          <div className="hidden md:block absolute left-1/2 -translate-x-[65%] bottom-0 z-20 pointer-events-none">
            <img 
              src="/hand.png" 
              alt="DoorMed Express App" 
              className="w-[260px] md:w-[460px] lg:w-[540px] h-auto"
            />
          </div>
        )}
      </section>

      {/* Horizontal Scroll Section - Platform Features */}
      <section ref={horizontalRef} className="bg-[#e9f9df] overflow-hidden relative py-12 md:py-0">
        {/* Desktop: Horizontal scroll, Mobile: Vertical stack */}
        <div ref={cardsRef} className="flex flex-col md:flex-row md:w-fit gap-8 md:gap-8 px-6 md:px-0">
          {/* Card 1 */}
          <div className="w-full md:w-screen h-auto md:h-screen flex items-center justify-center md:px-12 lg:px-20 flex-shrink-0">
            <div className="bg-[#1b4332] rounded-[40px] p-6 md:p-14 lg:p-20 w-full max-w-full md:max-w-[90vw] h-auto md:h-[75vh] flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="text-white text-center md:text-left">
                <h2 className="text-3xl md:text-6xl lg:text-7xl font-serif italic leading-tight mb-4 md:mb-8">
                  Seamless Online
                  <br />
                  Platform
                </h2>
                <p className="text-white/80 text-sm md:text-xl leading-relaxed mb-6 md:mb-10">
                  Manage all your health subscriptions in one intuitive portal. Update prescriptions, adjust delivery schedules, and track your orders with ease.
                </p>
                <button className="flex items-center gap-3 bg-[#c9e265] text-[#1b4332] px-4 md:px-8 py-3 md:py-4 rounded-full font-medium hover:bg-[#d4e857] transition text-sm md:text-lg mx-auto md:mx-0">
                  <div className="w-8 h-8 bg-[#1b4332]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-base md:text-lg">Learn More</span>
                </button>
              </div>
              <div className="relative w-full h-[250px] md:h-full">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" 
                  alt="Platform interface" 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-full md:w-screen h-auto md:h-screen flex items-center justify-center md:px-12 lg:px-20 flex-shrink-0">
            <div className="bg-[#1b4332] rounded-[40px] p-6 md:p-14 lg:p-20 w-full max-w-full md:max-w-[90vw] h-auto md:h-[75vh] flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="text-white text-center md:text-left">
                <h2 className="text-3xl md:text-6xl lg:text-7xl font-serif italic leading-tight mb-4 md:mb-8">
                  Smart Medication
                  <br />
                  Tracking
                </h2>
                <p className="text-white/80 text-sm md:text-xl leading-relaxed mb-6 md:mb-10">
                  Our mobile app features QR code scanning for each medication, personalized dosing schedules, and persistent alarms that ensure you never miss a dose.
                </p>
                <button className="flex items-center gap-3 bg-[#c9e265] text-[#1b4332] px-4 md:px-8 py-3 md:py-4 rounded-full font-medium hover:bg-[#d4e857] transition text-sm md:text-lg mx-auto md:mx-0">
                  <div className="w-8 h-8 bg-[#1b4332]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-base md:text-lg">Explore App</span>
                </button>
              </div>
              <div className="relative w-full h-[250px] md:h-full">
                <img 
                  src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80" 
                  alt="Mobile app tracking" 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="w-full md:w-screen h-auto md:h-screen flex items-center justify-center md:px-12 lg:px-20 flex-shrink-0">
            <div className="bg-[#1b4332] rounded-[40px] p-6 md:p-14 lg:p-20 w-full max-w-full md:max-w-[90vw] h-auto md:h-[75vh] flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-12 items-center">
              <div className="text-white text-center md:text-left">
                <h2 className="text-3xl md:text-6xl lg:text-7xl font-serif italic leading-tight mb-4 md:mb-8">
                  Family Care
                  <br />
                  Connection
                </h2>
                <p className="text-white/80 text-sm md:text-xl leading-relaxed mb-6 md:mb-10">
                  Caregivers and family members can access medication schedules, receive alerts, and help ensure loved ones stay on track with their health routines.
                </p>
                <button className="flex items-center gap-3 bg-[#c9e265] text-[#1b4332] px-4 md:px-8 py-3 md:py-4 rounded-full font-medium hover:bg-[#d4e857] transition text-sm md:text-lg mx-auto md:mx-0">
                  <div className="w-8 h-8 bg-[#1b4332]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-base md:text-lg">Get Started</span>
                </button>
              </div>
              <div className="relative w-full h-[250px] md:h-full">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" 
                  alt="Family care" 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#e9f9df] pb-4 px-1 md:px-2 pb-4">
        <div className="max-w-[98%] mx-auto">
          {/* Badge */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs text-[#1b4332] bg-[#d4e857] px-3 py-1.5 rounded-full mb-8">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Why Choose DoorMedExpress
            </span>
            
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#1b4332] leading-tight">
              Enjoy the Benefits of Automated
              <br />
              Medication Delivery
            </h2>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            {/* Benefit 1 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 pb-4 w-full flex flex-col justify-between h-full min-h-[200px]">
              <div className="w-10 h-10 bg-[#d4e857] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1b4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="mt-auto">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-[#1b4332] mb-4 leading-tight">Cost-Effective Care</h3>
                <p className="text-[#1b4332]/60 text-sm leading-relaxed mb-0">
                  Competitive pricing on maintenance medications with transparent costs. No hidden fees, just reliable delivery of your essential medications at affordable rates.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 pb-4 w-full flex flex-col justify-between h-full min-h-[200px]">
              <div className="w-10 h-10 bg-[#d4e857] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1b4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="mt-auto">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-[#1b4332] mb-4 leading-tight">Reliable Service</h3>
                <p className="text-[#1b4332]/60 text-sm leading-relaxed mb-0">
                  Dependable monthly delivery with tracking and quality assurance. Our automated system ensures you never run out of critical medications for chronic conditions.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-4 md:p-8 w-full flex flex-col justify-between h-full min-h-[200px]">
              <div className="w-10 h-10 bg-[#d4e857] rounded-lg flex items-center justify-center mb-24">
                <svg className="w-5 h-5 text-[#1b4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="mt-auto">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-[#1b4332] mb-4 leading-tight">Personal Support</h3>
                <p className="text-[#1b4332]/60 text-sm leading-relaxed mb-0">
                  Dedicated customer service and pharmacy support specialists available to assist you. Expert guidance for medication management with personalized care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-[#e9f9df] py-16 md:py-24 px-1 md:px-2">
        <div className="max-w-[98%] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left - Heading Only */}
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#1b4332] leading-tight">
                Why Customers
                <br />
                Trust DoorMedExpress
              </h2>
            </div>
            
            {/* Right - Image with Overlapping Stats */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden h-[400px] md:h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80" 
                  alt="Healthcare professionals" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Stat 1 - Top Left overlapping image */}
              <div className="absolute -top-4 -left-8 bg-[#d4e857] rounded-2xl p-6 w-48 z-10">
                <div className="text-5xl font-bold text-[#1b4332] mb-2">82<span className="text-3xl">%</span></div>
                <p className="text-[#1b4332] text-sm leading-tight">
                  Of patients say they are more engaged with their health using DoorMedExpress.
                </p>
              </div>
              
              {/* Stat 2 - Bottom Left overlapping image */}
              <div className="absolute bottom-8 -left-8 bg-[#d4e857] rounded-2xl p-6 w-48 z-10">
                <div className="text-5xl font-bold text-[#1b4332] mb-2">75<span className="text-3xl">%</span></div>
                <p className="text-[#1b4332] text-sm leading-tight">
                  Of patients say automated delivery improved their medication adherence.
                </p>
              </div>
              
              {/* Stat 3 - Bottom Center overlapping image */}
              <div className="absolute bottom-8 left-1/3 bg-[#d4e857] rounded-2xl p-6 w-48 z-10">
                <div className="text-5xl font-bold text-[#1b4332] mb-2">40<span className="text-3xl">%</span></div>
                <p className="text-[#1b4332] text-sm leading-tight">
                  Reduced medication gaps in patients with chronic conditions using our service.
                </p>
              </div>
              
              {/* Trust Badge */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 bg-[#1b4332] rounded-full border border-white"></div>
                  <div className="w-4 h-4 bg-[#2d5a45] rounded-full border border-white"></div>
                  <div className="w-4 h-4 bg-[#d4e857] rounded-full border border-white"></div>
                  <div className="w-4 h-4 bg-[#c9e265] rounded-full border border-white"></div>
                </div>
                <span className="text-xs text-[#1b4332] font-medium">Millions of Transactions of Trust</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1b4332] text-white py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Card */}
          <div className="bg-[#2d5a45] rounded-[40px] p-8 md:p-12 lg:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
              {/* Left - Tagline */}
              <div className="lg:col-span-1">
                <h3 className="text-2xl md:text-3xl font-serif italic leading-tight">
                  Your Health,
                  <br />
                  Delivered.
                  <br />
                  Hassle-Free.
                </h3>
              </div>

              {/* For Patients */}
              <div>
              <h4 className="text-white/50 text-xs uppercase mb-4 tracking-wider">For Patients</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Why DoorMedExpress</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Subscription Plans</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">How It Works</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Medication List</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Schedule Demo</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Get Started</a></li>
              </ul>
            </div>

            {/* For Healthcare */}
            <div>
              <h4 className="text-white/50 text-xs uppercase mb-4 tracking-wider">For Healthcare</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Healthcare Providers</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Check Eligibility</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Partner Program</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Pharmacy Network</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white/50 text-xs uppercase mb-4 tracking-wider">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">About Us</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Careers</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Blog</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">FAQs</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Contact Us</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white/50 text-xs uppercase mb-4 tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Accessibility</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Security</a></li>
                <li><a href="#" className="text-white hover:text-[#c9e265] transition text-sm">Licenses</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* App Download */}
            <div>
              <p className="text-white/50 text-xs mb-3">Download DoorMedExpress</p>
              <div className="flex gap-3">
                <a href="#" className="inline-block">
                  <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] text-white/70">Download on the</div>
                      <div className="text-xs text-white font-medium">App Store</div>
                    </div>
                  </div>
                </a>
                <a href="#" className="inline-block">
                  <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] text-white/70">GET IT ON</div>
                      <div className="text-xs text-white font-medium">Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Social & Copyright */}
            <div className="flex flex-col md:items-end gap-4">
              {/* Social Icons */}
              <div className="flex gap-4">
                <a href="#" className="text-white/70 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>

              {/* Copyright */}
              <div className="text-white/50 text-xs">
                <p>© {new Date().getFullYear()} DoorMedExpress. All rights reserved.</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </footer>

      {/* Bottom Text - Partially Cut Off */}
      <div className="bg-[#1b4332] overflow-hidden">
        <div className="text-center px-4">
          <h2 className="text-[50px] md:text-[120px] lg:text-[180px] font-bold text-white/5 leading-[0.95] tracking-tight whitespace-nowrap translate-y-[5%]" style={{ marginBottom: '-2%' }}>
            DoorMed Express
          </h2>
        </div>
      </div>
    </div>
  )
}
