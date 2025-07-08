package main

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// ConversionResult represents the result of a number conversion
type ConversionResult struct {
	Result      string   `json:"result"`
	Steps       []string `json:"steps"`
	IsValid     bool     `json:"isValid"`
	ErrorMessage string  `json:"errorMessage"`
}

// AllConversionsResult represents conversions to all other number systems
type AllConversionsResult struct {
	Binary      string `json:"binary"`
	Octal       string `json:"octal"`
	Decimal     string `json:"decimal"`
	Hexadecimal string `json:"hexadecimal"`
	IsValid     bool   `json:"isValid"`
	ErrorMessage string `json:"errorMessage"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ConvertNumber converts a number from one base to another with detailed steps
func (a *App) ConvertNumber(value string, fromBase int, toBase int) ConversionResult {
	// Clean the input
	value = strings.TrimSpace(strings.ToUpper(value))
	
	if value == "" {
		return ConversionResult{
			Result:      "",
			Steps:       []string{},
			IsValid:     false,
			ErrorMessage: "Input cannot be empty",
		}
	}

	// Validate input for the given base
	if !isValidForBase(value, fromBase) {
		return ConversionResult{
			Result:      "",
			Steps:       []string{},
			IsValid:     false,
			ErrorMessage: fmt.Sprintf("Invalid input '%s' for base %d", value, fromBase),
		}
	}

	// Convert to decimal first
	decimalValue, err := convertToDecimal(value, fromBase)
	if err != nil {
		return ConversionResult{
			Result:      "",
			Steps:       []string{},
			IsValid:     false,
			ErrorMessage: err.Error(),
		}
	}

	// Convert from decimal to target base
	result, steps := convertFromDecimal(decimalValue, toBase, value, fromBase)
	
	return ConversionResult{
		Result:      result,
		Steps:       steps,
		IsValid:     true,
		ErrorMessage: "",
	}
}

// ConvertToAllSystems converts a number to all other number systems
func (a *App) ConvertToAllSystems(value string, fromBase int) AllConversionsResult {
	value = strings.TrimSpace(strings.ToUpper(value))
	
	if value == "" {
		return AllConversionsResult{
			Binary:      "",
			Octal:       "",
			Decimal:     "",
			Hexadecimal: "",
			IsValid:     false,
			ErrorMessage: "Input cannot be empty",
		}
	}

	if !isValidForBase(value, fromBase) {
		return AllConversionsResult{
			Binary:      "",
			Octal:       "",
			Decimal:     "",
			Hexadecimal: "",
			IsValid:     false,
			ErrorMessage: fmt.Sprintf("Invalid input '%s' for base %d", value, fromBase),
		}
	}

	// Convert to decimal first
	decimalValue, err := convertToDecimal(value, fromBase)
	if err != nil {
		return AllConversionsResult{
			Binary:      "",
			Octal:       "",
			Decimal:     "",
			Hexadecimal: "",
			IsValid:     false,
			ErrorMessage: err.Error(),
		}
	}

	// Convert to all bases
	binary, _ := convertFromDecimal(decimalValue, 2, value, fromBase)
	octal, _ := convertFromDecimal(decimalValue, 8, value, fromBase)
	decimal, _ := convertFromDecimal(decimalValue, 10, value, fromBase)
	hexadecimal, _ := convertFromDecimal(decimalValue, 16, value, fromBase)

	return AllConversionsResult{
		Binary:      binary,
		Octal:       octal,
		Decimal:     decimal,
		Hexadecimal: hexadecimal,
		IsValid:     true,
		ErrorMessage: "",
	}
}

// isValidForBase checks if a string is valid for the given base
func isValidForBase(value string, base int) bool {
	for _, char := range value {
		digit := 0
		if char >= '0' && char <= '9' {
			digit = int(char - '0')
		} else if char >= 'A' && char <= 'F' {
			digit = int(char - 'A' + 10)
		} else {
			return false
		}
		if digit >= base {
			return false
		}
	}
	return true
}

// convertToDecimal converts a number from any base to decimal
func convertToDecimal(value string, fromBase int) (int64, error) {
	result := int64(0)
	power := int64(1)
	
	// Process from right to left
	for i := len(value) - 1; i >= 0; i-- {
		char := value[i]
		digit := 0
		
		if char >= '0' && char <= '9' {
			digit = int(char - '0')
		} else if char >= 'A' && char <= 'F' {
			digit = int(char - 'A' + 10)
		}
		
		if digit >= fromBase {
			return 0, errors.New("invalid digit for base")
		}
		
		result += int64(digit) * power
		power *= int64(fromBase)
	}
	
	return result, nil
}

// convertFromDecimal converts a decimal number to any base with steps
func convertFromDecimal(decimal int64, toBase int, originalValue string, fromBase int) (string, []string) {
	if decimal == 0 {
		steps := generateSteps(originalValue, fromBase, toBase, decimal, "0")
		return "0", steps
	}
	
	digits := "0123456789ABCDEF"
	result := ""
	steps := []string{}
	tempDecimal := decimal
	
	// Generate conversion steps
	if fromBase != 10 {
		steps = append(steps, fmt.Sprintf("Step 1: Convert %s (base %d) to decimal", originalValue, fromBase))
		
		// Show positional calculation
		positionSteps := []string{}
		for i, char := range originalValue {
			pos := len(originalValue) - 1 - i
			digit := 0
			if char >= '0' && char <= '9' {
				digit = int(char - '0')
			} else if char >= 'A' && char <= 'F' {
				digit = int(char - 'A' + 10)
			}
			
			if pos == 0 {
				positionSteps = append(positionSteps, fmt.Sprintf("%d × %d⁰ = %d", digit, fromBase, digit))
			} else {
				positionSteps = append(positionSteps, fmt.Sprintf("%d × %d^%d = %d", digit, fromBase, pos, digit*int(math.Pow(float64(fromBase), float64(pos)))))
			}
		}
		steps = append(steps, "   "+strings.Join(positionSteps, " + "))
		steps = append(steps, fmt.Sprintf("   = %d (decimal)", decimal))
		steps = append(steps, "")
	}
	
	if toBase != 10 {
		steps = append(steps, fmt.Sprintf("Step 2: Convert %d (decimal) to base %d", decimal, toBase))
		divisionSteps := []string{}
		
		// Perform division and collect steps
		for tempDecimal > 0 {
			remainder := tempDecimal % int64(toBase)
			quotient := tempDecimal / int64(toBase)
			divisionSteps = append(divisionSteps, fmt.Sprintf("   %d ÷ %d = %d remainder %s", tempDecimal, toBase, quotient, string(digits[remainder])))
			result = string(digits[remainder]) + result
			tempDecimal = quotient
		}
		
		steps = append(steps, divisionSteps...)
		steps = append(steps, fmt.Sprintf("   Reading remainders from bottom to top: %s", result))
	} else {
		result = fmt.Sprintf("%d", decimal)
	}
	
	if len(steps) == 0 {
		steps = generateSteps(originalValue, fromBase, toBase, decimal, result)
	}
	
	return result, steps
}

// generateSteps creates detailed conversion steps
func generateSteps(originalValue string, fromBase, toBase int, decimal int64, result string) []string {
	baseNames := map[int]string{
		2:  "Binary",
		8:  "Octal", 
		10: "Decimal",
		16: "Hexadecimal",
	}
	
	fromName := baseNames[fromBase]
	toName := baseNames[toBase]
	
	if fromBase == toBase {
		return []string{fmt.Sprintf("No conversion needed: %s is already in %s", originalValue, fromName)}
	}
	
	return []string{
		fmt.Sprintf("Converting %s from %s to %s", originalValue, fromName, toName),
		fmt.Sprintf("Result: %s", result),
	}
}
