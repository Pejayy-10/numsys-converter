"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import AnimatedBackground from "./components/AnimatedBackground";
import { ConvertNumber, ConvertToAllSystems } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

type NumberSystem = {
  name: string
  base: number
  label: string
  placeholder: string
}

const numberSystems: NumberSystem[] = [
  { name: "binary", base: 2, label: "Binary", placeholder: "1010" },
  { name: "octal", base: 8, label: "Octal", placeholder: "755" },
  { name: "decimal", base: 10, label: "Decimal", placeholder: "123" },
  { name: "hexadecimal", base: 16, label: "Hexadecimal", placeholder: "ABC" },
]

// Generate all possible conversions
const getAllConversions = () => {
  const conversions = []
  for (let i = 0; i < numberSystems.length; i++) {
    for (let j = 0; j < numberSystems.length; j++) {
      if (i !== j) {
        conversions.push({
          from: numberSystems[i],
          to: numberSystems[j],
          label: `${numberSystems[i].label} to ${numberSystems[j].label}`,
        })
      }
    }
  }
  return conversions
}

// Portal-based dropdown component
function PortalDropdown({ 
  isOpen, 
  onClose, 
  buttonRef, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  buttonRef: React.RefObject<HTMLButtonElement>; 
  children: React.ReactNode; 
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [isOpen, buttonRef])

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node
        // Check if click is outside both button and dropdown
        if (
          buttonRef.current && 
          !buttonRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          onClose()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  if (!isOpen) return null

  return createPortal(
    <div 
      ref={dropdownRef}
      className="fixed z-[99999] bg-slate-600/90 backdrop-blur-md border border-slate-400/50 rounded-lg shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
        width: position.width
      }}
    >
      {children}
    </div>,
    document.body
  )
}

export default function NumberSystemConverter() {
  const [fromSystem, setFromSystem] = useState("decimal")
  const [toSystem, setToSystem] = useState("binary")
  const [inputValue, setInputValue] = useState("")
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  
  // Refs for dropdown positioning
  const fromButtonRef = useRef<HTMLButtonElement>(null)
  const toButtonRef = useRef<HTMLButtonElement>(null)
  
  // Conversion results
  const [mainConversion, setMainConversion] = useState<main.ConversionResult | null>(null)
  const [autoConversions, setAutoConversions] = useState<main.AllConversionsResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const allConversions = getAllConversions()

  const handleSwapSystems = () => {
    const temp = fromSystem
    setFromSystem(toSystem)
    setToSystem(temp)
  }

  const handleConversionSelect = (from: string, to: string) => {
    setFromSystem(from)
    setToSystem(to)
  }

  const getCurrentSystemInfo = (systemName: string) => {
    return numberSystems.find((sys) => sys.name === systemName)
  }

  // Perform conversions
  const performConversions = useCallback(async (value: string, fromBase: number, toBase: number) => {
    if (!value.trim()) {
      setMainConversion(null)
      setAutoConversions(null)
      return
    }

    setIsLoading(true)
    try {
      // Get main conversion with steps
      const mainResult = await ConvertNumber(value, fromBase, toBase)
      setMainConversion(mainResult)

      // Get all conversions for auto-conversion card
      const allResult = await ConvertToAllSystems(value, fromBase)
      setAutoConversions(allResult)
    } catch (error) {
      console.error("Conversion error:", error)
      setMainConversion({
        result: "",
        steps: [],
        isValid: false,
        errorMessage: "Conversion failed"
      })
      setAutoConversions(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effect to trigger conversions when input or systems change
  useEffect(() => {
    const fromBase = getCurrentSystemInfo(fromSystem)?.base || 10
    const toBase = getCurrentSystemInfo(toSystem)?.base || 2
    
    if (inputValue.trim()) {
      const timeoutId = setTimeout(() => {
        performConversions(inputValue, fromBase, toBase)
      }, 300) // Debounce for 300ms
      
      return () => clearTimeout(timeoutId)
    } else {
      setMainConversion(null)
      setAutoConversions(null)
    }
  }, [inputValue, fromSystem, toSystem, performConversions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toUpperCase())
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <>
      <AnimatedBackground/>
      <div className="relative min-h-screen overflow-hidden">
        {/* Main Content */}
        <div className="p-6 min-h-screen flex flex-col items-center justify-center">
          {/* Centered Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent tracking-wider drop-shadow-lg mb-2">
              Number System Converter
            </h1>
            <p className="text-white/80 text-lg">Convert between binary, octal, decimal, and hexadecimal number systems</p>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
            
            {/* Left Column - Main Conversion and Auto Conversions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Main Converter Card */}
              <div className="bg-slate-700/25 backdrop-blur-md rounded-xl shadow-2xl border border-slate-500/40 p-6 space-y-6">
                {/* From Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-white/90">
                      From ({getCurrentSystemInfo(fromSystem)?.label})
                    </label>
                    <div className="relative">
                      <button
                        ref={fromButtonRef}
                        onClick={() => setShowFromDropdown(!showFromDropdown)}
                        className="flex items-center justify-between w-32 px-3 py-2 text-sm bg-slate-600/35 backdrop-blur border border-slate-400/50 rounded-lg hover:bg-slate-500/45 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white transition-colors"
                      >
                        {getCurrentSystemInfo(fromSystem)?.label}
                        <svg
                          className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFromDropdown ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <PortalDropdown 
                        isOpen={showFromDropdown} 
                        onClose={() => setShowFromDropdown(false)} 
                        buttonRef={fromButtonRef}
                      >
                        {numberSystems.map((system) => (
                          <button
                            key={system.name}
                            onClick={() => {
                              setFromSystem(system.name)
                              setShowFromDropdown(false)
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-500/45 first:rounded-t-lg last:rounded-b-lg text-white transition-colors ${
                              system.name === fromSystem ? "bg-slate-500/45" : ""
                            }`}
                          >
                            {system.label}
                          </button>
                        ))}
                      </PortalDropdown>
                    </div>
                  </div>
                  <input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={getCurrentSystemInfo(fromSystem)?.placeholder || ""}
                    className={`w-full text-lg font-mono h-12 px-4 border-2 rounded-lg focus:outline-none transition-colors text-white placeholder-white/50 bg-slate-600/35 backdrop-blur border-slate-400/50 focus:border-blue-400 ${
                      mainConversion?.isValid === false ? 'border-red-400 focus:border-red-400' : ''
                    }`}
                  />
                  {mainConversion?.isValid === false && (
                    <p className="text-red-300 text-sm mt-1">{mainConversion.errorMessage}</p>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSwapSystems}
                    className="w-10 h-10 rounded-full border-2 border-slate-400/50 bg-slate-600/35 backdrop-blur hover:border-blue-400 hover:bg-slate-500/45 transition-all duration-200 flex items-center justify-center text-white hover:text-blue-400"
                  >
                    <svg
                      className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </button>
                </div>

                {/* To Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-white/90">
                      To ({getCurrentSystemInfo(toSystem)?.label})
                    </label>
                    <div className="relative">
                      <button
                        ref={toButtonRef}
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="flex items-center justify-between w-32 px-3 py-2 text-sm bg-slate-600/35 backdrop-blur border border-slate-400/50 rounded-lg hover:bg-slate-500/45 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white transition-colors"
                      >
                        {getCurrentSystemInfo(toSystem)?.label}
                        <svg
                          className={`w-4 h-4 ml-2 transition-transform duration-200 ${showToDropdown ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <PortalDropdown 
                        isOpen={showToDropdown} 
                        onClose={() => setShowToDropdown(false)} 
                        buttonRef={toButtonRef}
                      >
                        {numberSystems.map((system) => (
                          <button
                            key={system.name}
                            onClick={() => {
                              setToSystem(system.name)
                              setShowToDropdown(false)
                            }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-500/45 first:rounded-t-lg last:rounded-b-lg text-white transition-colors ${
                              system.name === toSystem ? "bg-slate-500/45" : ""
                            }`}
                          >
                            {system.label}
                          </button>
                        ))}
                      </PortalDropdown>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      value={mainConversion?.isValid ? mainConversion.result : ""}
                      placeholder={isLoading ? "Converting..." : "Result will appear here"}
                      className="w-full text-lg font-mono h-12 px-4 pr-12 bg-slate-600/35 backdrop-blur border-2 border-slate-400/50 rounded-lg text-white placeholder-white/50"
                      readOnly
                    />
                    {mainConversion?.isValid && mainConversion.result && (
                      <button 
                        onClick={() => copyToClipboard(mainConversion.result)}
                        className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center hover:bg-slate-500/45 rounded-lg transition-colors text-white hover:text-blue-400"
                        title="Copy to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Auto Conversions Card */}
              <div className="bg-slate-700/25 backdrop-blur-md rounded-xl shadow-2xl border border-slate-500/40 p-6">
                {/* Small label */}
                <div className="text-center mb-4">
                  <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Auto Conversions</h3>
                </div>
                <div>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                      <span className="ml-3 text-white/80">Loading conversions...</span>
                    </div>
                  ) : autoConversions?.isValid ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries({
                        binary: { label: "Binary", value: autoConversions.binary },
                        octal: { label: "Octal", value: autoConversions.octal },
                        decimal: { label: "Decimal", value: autoConversions.decimal },
                        hexadecimal: { label: "Hexadecimal", value: autoConversions.hexadecimal }
                      }).filter(([key]) => key !== fromSystem).map(([key, { label, value }]) => (
                        <div key={key} className="bg-slate-600/35 backdrop-blur rounded-lg p-4 border border-slate-400/50 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white truncate mr-2">{label}</h4>
                            <button
                              onClick={() => copyToClipboard(value)}
                              className="p-1 hover:bg-slate-500/45 rounded transition-colors flex-shrink-0"
                              title="Copy to clipboard"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <p className="font-mono text-lg text-white bg-slate-500/35 backdrop-blur p-3 rounded border border-slate-400/50 break-all overflow-wrap-anywhere">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : autoConversions?.isValid === false ? (
                    <div className="flex flex-col items-center justify-center h-24 text-red-300">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Conversion Error</span>
                      <span className="text-sm mt-1">{autoConversions.errorMessage}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-white/60">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="italic">Enter a number to see all conversions</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Solution Steps */}
            <div className="lg:col-span-1">
              {/* Solution Steps Card */}
              <div className="bg-slate-700/25 backdrop-blur-md rounded-xl shadow-2xl border border-slate-500/40 h-fit p-6">
                {/* Small label */}
                <div className="text-center mb-4">
                  <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Solution Steps</h3>
                </div>
                <div 
                  className="min-h-[300px] max-h-[600px] overflow-y-auto custom-scrollbar"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                      <span className="ml-3 text-white/80">Processing...</span>
                    </div>
                  ) : mainConversion?.isValid && mainConversion.steps.length > 0 ? (
                    <div className="space-y-3">
                      {mainConversion.steps.map((step, index) => (
                        <div key={index} className="text-white">
                          {step.startsWith("Step") ? (
                            <h3 className="font-semibold text-lg text-white mb-2">{step}</h3>
                          ) : step.trim() === "" ? (
                            <div className="h-2" />
                          ) : (
                            <p className="text-sm font-mono bg-slate-600/35 backdrop-blur p-3 rounded-lg border-l-4 border-slate-400/60 break-words overflow-wrap-anywhere">
                              {step}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : mainConversion?.isValid === false ? (
                    <div className="flex flex-col items-center justify-center h-24 text-red-300">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Conversion Error</span>
                      <span className="text-sm mt-1">{mainConversion.errorMessage}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-white/60">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="italic">Enter a number to see the solution steps</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  )
}
