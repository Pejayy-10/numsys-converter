"use client"

import { useState, useEffect } from "react"

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
    const [inputValue, setInputValue] = useState("")
    const [fromSystem, setFromSystem] = useState("decimal")
    const [toSystem, setToSystem] = useState("binary")
    const [result, setResult] = useState("")
    const [error, setError] = useState("")
    const [showFromDropdown, setShowFromDropdown] = useState(false)
    const [showToDropdown, setShowToDropdown] = useState(false)
    const [showConversionsDropdown, setShowConversionsDropdown] = useState(false)

    const allConversions = getAllConversions()

    const convertNumber = (value: string, from: string, to: string): string => {
    if (!value.trim()) return ""

    try {
        const fromBase = numberSystems.find((sys) => sys.name === from)?.base || 10
        const toBase = numberSystems.find((sys) => sys.name === to)?.base || 10

        const decimalValue = Number.parseInt(value.replace(/\s/g, ""), fromBase)

        if (isNaN(decimalValue)) {
        throw new Error("Invalid number format")
    }

        const convertedValue = decimalValue.toString(toBase).toUpperCase()
        return convertedValue
    } catch (err) {
        throw new Error("Invalid input for selected number system")
    }
}

useEffect(() => {
    if (inputValue) {
        try {
        const converted = convertNumber(inputValue, fromSystem, toSystem)
        setResult(converted)
        setError("")
    } catch (err) {
        setError(err instanceof Error ? err.message : "Conversion error")
        setResult("")
        }
    } else {
        setResult("")
        setError("")
    }
}, [inputValue, fromSystem, toSystem])

const handleSwapSystems = () => {
    const temp = fromSystem
    setFromSystem(toSystem)
    setToSystem(temp)
    if (result) {
        setInputValue(result)
    }
}

const handleCopyResult = async () => {
    if (result) {
        try {
        await navigator.clipboard.writeText(result)
        alert("Result copied to clipboard!")
        } catch (err) {
        alert("Unable to copy to clipboard")
        }
    }
}

const handleConversionSelect = (from: string, to: string) => {
    setFromSystem(from)
    setToSystem(to)
    setShowConversionsDropdown(false)
}

const getCurrentSystemInfo = (systemName: string) => {
    return numberSystems.find((sys) => sys.name === systemName)
}

return (
    <div className="min-h-screen bg-gradient-to-br from-timberwolf to-golden-brown/20">
      {/* Navigation Bar */}
        <nav className="bg-eerie-black shadow-lg border-b border-hunter-green/30">
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
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-timberwolf bg-hunter-green/80 border border-hunter-green rounded-lg hover:bg-hunter-green focus:outline-none focus:ring-2 focus:ring-sinopia"
            >
                <span>Quick Conversions</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showConversionsDropdown && (
                <div className="absolute right-0 top-12 z-30 w-64 bg-eerie-black border border-hunter-green rounded-lg shadow-xl max-h-80 overflow-y-auto">
                    <div className="p-2">
                    <div className="text-xs font-semibold text-golden-brown uppercase tracking-wide px-3 py-2">
                    Available Conversions
                    </div>
                    {allConversions.map((conversion, index) => (
                        <button
                        key={index}
                        onClick={() => handleConversionSelect(conversion.from.name, conversion.to.name)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-hunter-green/30 rounded-md flex items-center justify-between group"
                        >
                        <span className="text-timberwolf">{conversion.label}</span>
                        <div className="flex items-center space-x-1 text-xs text-golden-brown">
                            <span className="bg-hunter-green/50 px-2 py-1 rounded text-timberwolf">
                            Base {conversion.from.base}
                            </span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="bg-hunter-green/50 px-2 py-1 rounded text-timberwolf">
                            Base {conversion.to.base}
                            </span>
                        </div>
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
        <div className="p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-hunter-green/20">
          {/* Header */}
            <div className="text-center space-y-4 p-8 bg-gradient-to-r from-eerie-black to-hunter-green rounded-t-2xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sinopia to-golden-brown bg-clip-text text-transparent">
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
                    className="flex items-center justify-between w-36 px-4 py-2 text-sm bg-timberwolf border border-hunter-green/30 rounded-lg hover:bg-hunter-green/10 focus:outline-none focus:ring-2 focus:ring-sinopia text-eerie-black"
                >
                    {getCurrentSystemInfo(fromSystem)?.label}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {showFromDropdown && (
                    <div className="absolute top-12 right-0 z-50 w-36 bg-white border border-hunter-green/30 rounded-lg shadow-xl">
                    {numberSystems.map((system) => (
                        <button
                            key={system.name}
                            onClick={() => {
                            setFromSystem(system.name)
                            setShowFromDropdown(false)
                            }}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-timberwolf/50 first:rounded-t-lg last:rounded-b-lg text-eerie-black"
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
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                placeholder={getCurrentSystemInfo(fromSystem)?.placeholder || ""}
                className="w-full text-xl font-mono h-14 px-4 border-2 border-hunter-green/30 rounded-lg focus:border-sinopia focus:outline-none transition-colors text-eerie-black placeholder-eerie-black/50 bg-white"
            />
            {error && (
                <p className="text-sm text-sinopia flex items-center gap-2">
                    <span className="w-2 h-2 bg-sinopia rounded-full"></span>
                    {error}
                </p>
            )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
                <button
                onClick={handleSwapSystems}
                className="w-12 h-12 rounded-full border-2 border-hunter-green/30 bg-timberwolf hover:border-sinopia hover:bg-golden-brown/20 transition-all duration-200 flex items-center justify-center text-eerie-black"
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="flex items-center justify-between w-36 px-4 py-2 text-sm bg-timberwolf border border-hunter-green/30 rounded-lg hover:bg-hunter-green/10 focus:outline-none focus:ring-2 focus:ring-sinopia text-eerie-black"
                    >
                    {getCurrentSystemInfo(toSystem)?.label}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </button>
                    {showToDropdown && (
                    <div className="absolute top-12 right-0 z-50 w-36 bg-white border border-hunter-green/30 rounded-lg shadow-xl">
                        {numberSystems.map((system) => (
                        <button
                            key={system.name}
                            onClick={() => {
                            setToSystem(system.name)
                            setShowToDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-timberwolf/50 first:rounded-t-lg last:rounded-b-lg text-eerie-black"
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
                    value={result}
                    readOnly
                    placeholder="Result will appear here"
                    className="w-full text-xl font-mono h-14 px-4 pr-14 bg-timberwolf/30 border-2 border-hunter-green/30 rounded-lg text-eerie-black placeholder-eerie-black/50"
                />
                {result && (
                    <button
                    onClick={handleCopyResult}
                    className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center hover:bg-golden-brown/20 rounded-lg transition-colors text-eerie-black"
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
    </div>
    )
}
