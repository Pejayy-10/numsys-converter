"use client"

import { useState, useEffect, useCallback } from "react"
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

export default function NumberSystemConverter() {
  const [fromSystem, setFromSystem] = useState("decimal")
  const [toSystem, setToSystem] = useState("binary")
  const [inputValue, setInputValue] = useState("")
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  
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
        {/* Navigation Bar */}
        <nav className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-16">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">NumConverter</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="p-6 min-h-screen flex items-center justify-center">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
            
            {/* Left Column - Main Conversion and Auto Conversions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Main Converter Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
                {/* Header */}
                <div className="text-center space-y-3 p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl">
                  <h1 className="text-2xl font-bold text-white">
                    Number System Converter
                  </h1>
                  <p className="text-slate-200">
                    Convert numbers between binary, octal, decimal, and hexadecimal systems
                  </p>
                </div>
                <div className="p-6 space-y-6">
                {/* From Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                      From ({getCurrentSystemInfo(fromSystem)?.label})
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowFromDropdown(!showFromDropdown)}
                        className="flex items-center justify-between w-32 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition-colors"
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
                      {showFromDropdown && (
                        <div className="absolute top-12 right-0 z-50 w-32 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {numberSystems.map((system) => (
                            <button
                              key={system.name}
                              onClick={() => {
                                setFromSystem(system.name)
                                setShowFromDropdown(false)
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-700 transition-colors ${
                                system.name === fromSystem ? "bg-blue-50 text-blue-700" : ""
                              }`}
                            >
                              {system.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={getCurrentSystemInfo(fromSystem)?.placeholder || ""}
                    className={`w-full text-lg font-mono h-12 px-4 border-2 rounded-lg focus:outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white ${
                      mainConversion?.isValid === false ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  {mainConversion?.isValid === false && (
                    <p className="text-red-500 text-sm mt-1">{mainConversion.errorMessage}</p>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSwapSystems}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-blue-600"
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
                    <label className="text-sm font-semibold text-gray-700">
                      To ({getCurrentSystemInfo(toSystem)?.label})
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="flex items-center justify-between w-32 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition-colors"
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
                      {showToDropdown && (
                        <div className="absolute top-12 right-0 z-50 w-32 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {numberSystems.map((system) => (
                            <button
                              key={system.name}
                              onClick={() => {
                                setToSystem(system.name)
                                setShowToDropdown(false)
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-700 transition-colors ${
                                system.name === toSystem ? "bg-blue-50 text-blue-700" : ""
                              }`}
                            >
                              {system.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      value={mainConversion?.isValid ? mainConversion.result : ""}
                      placeholder={isLoading ? "Converting..." : "Result will appear here"}
                      className="w-full text-lg font-mono h-12 px-4 pr-12 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
                      readOnly
                    />
                    {mainConversion?.isValid && mainConversion.result && (
                      <button 
                        onClick={() => copyToClipboard(mainConversion.result)}
                        className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center hover:bg-blue-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
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
              </div>
              
              {/* Auto Conversions Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
                <div className="text-center space-y-3 p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white">Auto Conversions</h2>
                  <p className="text-slate-200">
                    {inputValue ? `${getCurrentSystemInfo(fromSystem)?.label} to all other systems` : "Automatic conversions will appear here"}
                  </p>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                      <span className="ml-3 text-gray-600">Loading conversions...</span>
                    </div>
                  ) : autoConversions?.isValid ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries({
                        binary: { label: "Binary", value: autoConversions.binary },
                        octal: { label: "Octal", value: autoConversions.octal },
                        decimal: { label: "Decimal", value: autoConversions.decimal },
                        hexadecimal: { label: "Hexadecimal", value: autoConversions.hexadecimal }
                      }).filter(([key]) => key !== fromSystem).map(([key, { label, value }]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-700">{label}</h4>
                            <button
                              onClick={() => copyToClipboard(value)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <p className="font-mono text-lg text-gray-900 bg-white p-3 rounded border border-gray-200">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : autoConversions?.isValid === false ? (
                    <div className="flex flex-col items-center justify-center h-24 text-red-500">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Conversion Error</span>
                      <span className="text-sm mt-1">{autoConversions.errorMessage}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-500">
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
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 h-fit">
                <div className="text-center space-y-3 p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white">Solution Steps</h2>
                  <p className="text-slate-200">
                    {mainConversion?.isValid ? "Step-by-step conversion process" : "Step-by-step conversion process will appear here"}
                  </p>
                </div>
                <div className="p-6 min-h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                      <span className="ml-3 text-gray-600">Processing...</span>
                    </div>
                  ) : mainConversion?.isValid && mainConversion.steps.length > 0 ? (
                    <div className="space-y-3">
                      {mainConversion.steps.map((step, index) => (
                        <div key={index} className="text-gray-800">
                          {step.startsWith("Step") ? (
                            <h3 className="font-semibold text-lg text-slate-700 mb-2">{step}</h3>
                          ) : step.trim() === "" ? (
                            <div className="h-2" />
                          ) : (
                            <p className="text-sm font-mono bg-gray-50 p-3 rounded-lg border-l-4 border-slate-500">
                              {step}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : mainConversion?.isValid === false ? (
                    <div className="flex flex-col items-center justify-center h-24 text-red-500">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Conversion Error</span>
                      <span className="text-sm mt-1">{mainConversion.errorMessage}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-500">
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
