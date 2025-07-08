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
  const [showConversionsDropdown, setShowConversionsDropdown] = useState(false)
  
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
    setShowConversionsDropdown(false)
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
        <nav className="bg-hunter-green shadow-lg border-b border-hunter-green/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-sinopia to-golden-brown rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-timberwolf">NumConverter</span>
              </div>

              {/* Conversions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowConversionsDropdown(!showConversionsDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-timberwolf bg-hunter-green/80 border border-hunter-green rounded-lg hover:bg-hunter-green focus:outline-none focus:ring-2 focus:ring-sinopia transition-all duration-200 w-80"
                >
                  <span className="text-center w-full">QUICK CONVERSION</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${showConversionsDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showConversionsDropdown && (
                  <div className="absolute right-0 top-12 z-30 w-80 bg-hunter-green rounded-lg shadow-xl max-h-[32rem] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-golden-brown uppercase tracking-wide px-3 py-2">
                        Available Conversions
                      </div>
                      {allConversions.map((conversion, index) => (
                        <button
                          key={index}
                          onClick={() => handleConversionSelect(conversion.from.name, conversion.to.name)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-white/30 rounded-md flex items-center justify-between group transition-colors duration-300"
                        >
                          <span className="text-timberwolf">{conversion.label}</span>
                          <svg
                            className="w-3 h-3 text-golden-brown"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="p-4 space-y-8">
          {/* Converter Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-hunter-green/20">
              {/* Header */}
              <div className="text-center space-y-4 p-8 bg-hunter-green rounded-t-2xl">
                <h1 className="text-3xl font-bold text-golden-brown bg-clip-text">
                  Number System Converter
                </h1>
                <p className="text-timberwolf text-lg">
                  Convert numbers between binary, octal, decimal, and hexadecimal systems
                </p>
              </div>
              <div className="p-8 space-y-8 overflow-visible">
                {/* From Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-eerie-black">
                      From ({getCurrentSystemInfo(fromSystem)?.label})
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowFromDropdown(!showFromDropdown)}
                        className="flex items-center justify-between w-36 px-4 py-2 text-sm bg-timberwolf border border-hunter-green/30 rounded-lg hover:bg-hunter-green/10 focus:outline-none focus:ring-2 focus:ring-sinopia text-eerie-black transition-all duration-200"
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
                        <div className="absolute top-12 right-0 z-50 w-36 bg-white border border-hunter-green/30 rounded-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
                          {numberSystems.map((system) => (
                            <button
                              key={system.name}
                              onClick={() => {
                                setFromSystem(system.name)
                                setShowFromDropdown(false)
                              }}
                              className={`w-full px-4 py-2 text-sm text-left hover:bg-timberwolf/50 first:rounded-t-lg last:rounded-b-lg text-eerie-black transition-colors duration-150 ${
                                system.name === fromSystem ? "bg-timberwolf/30" : ""
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
                    className={`w-full text-xl font-mono h-14 px-4 border-2 rounded-lg focus:outline-none transition-colors text-eerie-black placeholder-eerie-black/50 bg-white ${
                      mainConversion?.isValid === false ? 'border-red-500 focus:border-red-500' : 'border-hunter-green/30 focus:border-sinopia'
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
                    className="w-12 h-12 rounded-full border-2 border-hunter-green/30 bg-timberwolf hover:border-sinopia hover:bg-golden-brown/20 transition-all duration-200 flex items-center justify-center text-eerie-black group"
                  >
                    <svg
                      className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300"
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-eerie-black">
                      To ({getCurrentSystemInfo(toSystem)?.label})
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="flex items-center justify-between w-36 px-4 py-2 text-sm bg-timberwolf border border-hunter-green/30 rounded-lg hover:bg-hunter-green/10 focus:outline-none focus:ring-2 focus:ring-sinopia text-eerie-black transition-all duration-200"
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
                        <div className="absolute top-12 right-0 z-50 w-36 bg-white border border-hunter-green/30 rounded-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
                          {numberSystems.map((system) => (
                            <button
                              key={system.name}
                              onClick={() => {
                                setToSystem(system.name)
                                setShowToDropdown(false)
                              }}
                              className={`w-full px-4 py-2 text-sm text-left hover:bg-timberwolf/50 first:rounded-t-lg last:rounded-b-lg text-eerie-black transition-colors duration-150 ${
                                system.name === toSystem ? "bg-timberwolf/30" : ""
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
                      className="w-full text-xl font-mono h-14 px-4 pr-14 bg-timberwolf/30 border-2 border-hunter-green/30 rounded-lg text-eerie-black placeholder-eerie-black/50"
                      readOnly
                    />
                    {mainConversion?.isValid && mainConversion.result && (
                      <button 
                        onClick={() => copyToClipboard(mainConversion.result)}
                        className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center hover:bg-golden-brown/20 rounded-lg transition-colors text-eerie-black"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>

          {/* Results Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Solution Steps Card */}
            <div className="w-full bg-white rounded-2xl shadow-2xl border border-hunter-green/20 flex flex-col">
              <div className="text-center space-y-4 p-8 bg-gradient-to-r from-hunter-green to-eerie-black rounded-t-2xl">
                <h2 className="text-2xl font-bold text-golden-brown">Solution Steps</h2>
                <p className="text-timberwolf text-lg">
                  {mainConversion?.isValid ? "Step-by-step conversion process" : "Step-by-step conversion process will appear here."}
                </p>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-start">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hunter-green"></div>
                    <span className="ml-3 text-eerie-black">Processing...</span>
                  </div>
                ) : mainConversion?.isValid && mainConversion.steps.length > 0 ? (
                  <div className="space-y-4">
                    {mainConversion.steps.map((step, index) => (
                      <div key={index} className="text-eerie-black">
                        {step.startsWith("Step") ? (
                          <h3 className="font-semibold text-lg text-hunter-green mb-2">{step}</h3>
                        ) : step.trim() === "" ? (
                          <div className="h-2" />
                        ) : (
                          <p className="text-sm font-mono bg-timberwolf/20 p-3 rounded-lg border-l-4 border-golden-brown">
                            {step}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : mainConversion?.isValid === false ? (
                  <div className="flex flex-col items-center justify-center h-32 text-red-500">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-medium">Conversion Error</span>
                    <span className="text-sm mt-1">{mainConversion.errorMessage}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-eerie-black">
                    <svg className="w-12 h-12 mb-4 text-hunter-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg italic opacity-60">Enter a number to see the solution steps</span>
                  </div>
                )}
              </div>
            </div>

            {/* Auto Conversions Card */}
            <div className="w-full bg-white rounded-2xl shadow-2xl border border-hunter-green/20 flex flex-col">
              <div className="text-center space-y-4 p-8 bg-gradient-to-r from-sinopia to-golden-brown rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">Auto Conversions</h2>
                <p className="text-white/90 text-lg">
                  {inputValue ? `${getCurrentSystemInfo(fromSystem)?.label} to all other systems` : "Automatic conversions will appear here"}
                </p>
              </div>
              <div className="p-8 flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sinopia"></div>
                    <span className="ml-3 text-eerie-black">Loading conversions...</span>
                  </div>
                ) : autoConversions?.isValid ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries({
                      binary: { label: "Binary", value: autoConversions.binary },
                      octal: { label: "Octal", value: autoConversions.octal },
                      decimal: { label: "Decimal", value: autoConversions.decimal },
                      hexadecimal: { label: "Hexadecimal", value: autoConversions.hexadecimal }
                    }).filter(([key]) => key !== fromSystem).map(([key, { label, value }]) => (
                      <div key={key} className="bg-timberwolf/20 rounded-lg p-4 border border-hunter-green/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-hunter-green">{label}</h4>
                          <button
                            onClick={() => copyToClipboard(value)}
                            className="p-1 hover:bg-golden-brown/20 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4 text-eerie-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <p className="font-mono text-lg text-eerie-black bg-white p-2 rounded border">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : autoConversions?.isValid === false ? (
                  <div className="flex flex-col items-center justify-center h-32 text-red-500">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-medium">Conversion Error</span>
                    <span className="text-sm mt-1">{autoConversions.errorMessage}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-eerie-black">
                    <svg className="w-12 h-12 mb-4 text-sinopia/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-lg italic opacity-60">Enter a number to see all conversions</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
