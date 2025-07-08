package main

import (
	"context"
	"fmt"
	"math"
	"strconv"
	"strings"
)

// ConversionResult represents the result of a number system conversion
type ConversionResult struct {
	Result   string   `json:"result"`
	Steps    []string `json:"steps"`
	IsValid  bool     `json:"isValid"`
	ErrorMsg string   `json:"errorMsg"`
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ConvertNumber converts a number between different bases and provides step-by-step solution
func (a *App) ConvertNumber(input string, fromBase int, toBase int) ConversionResult {
	result := ConversionResult{
		Steps: make([]string, 0),
	}

	// Validate input bases
	if fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36 {
		result.IsValid = false
		result.ErrorMsg = "Base must be between 2 and 36"
		return result
	}

	// Remove spaces and convert to uppercase for consistency
	input = strings.TrimSpace(strings.ToUpper(input))

	// Validate input string against fromBase
	for _, c := range input {
		val := 0
		if c >= '0' && c <= '9' {
			val = int(c - '0')
		} else if c >= 'A' && c <= 'Z' {
			val = int(c-'A') + 10
		} else {
			result.IsValid = false
			result.ErrorMsg = fmt.Sprintf("Invalid character '%c' for base-%d", c, fromBase)
			return result
		}
		if val >= fromBase {
			result.IsValid = false
			result.ErrorMsg = fmt.Sprintf("Digit '%c' is not valid in base-%d", c, fromBase)
			return result
		}
	}

	// Convert to decimal first (if not already decimal)
	decimal := int64(0)
	if fromBase != 10 {
		result.Steps = append(result.Steps, fmt.Sprintf("Step 1: Convert %s (base-%d) to decimal", input, fromBase))

		for i, c := range input {
			val := 0
			if c >= '0' && c <= '9' {
				val = int(c - '0')
			} else {
				val = int(c-'A') + 10
			}
			power := len(input) - 1 - i
			contribution := val * int(math.Pow(float64(fromBase), float64(power)))
			decimal += int64(contribution)

			result.Steps = append(result.Steps,
				fmt.Sprintf("   %c × %d^%d = %d", c, fromBase, power, contribution))
		}
		result.Steps = append(result.Steps, fmt.Sprintf("Decimal result: %d", decimal))
	} else {
		var err error
		decimal, err = strconv.ParseInt(input, 10, 64)
		if err != nil {
			result.IsValid = false
			result.ErrorMsg = "Invalid decimal number"
			return result
		}
	}

	// Convert from decimal to target base (if not staying in decimal)
	if toBase != 10 {
		result.Steps = append(result.Steps, fmt.Sprintf("\nStep 2: Convert %d to base-%d", decimal, toBase))

		var digits []string
		temp := decimal

		for temp > 0 {
			remainder := temp % int64(toBase)
			digit := ""
			if remainder < 10 {
				digit = strconv.FormatInt(remainder, 10)
			} else {
				digit = string('A' + rune(remainder-10))
			}
			digits = append([]string{digit}, digits...)

			result.Steps = append(result.Steps,
				fmt.Sprintf("   %d ÷ %d = %d remainder %d (%s)",
					temp, toBase, temp/int64(toBase), remainder, digit))

			temp = temp / int64(toBase)
		}

		result.Result = strings.Join(digits, "")
		if result.Result == "" {
			result.Result = "0"
		}
	} else {
		result.Result = strconv.FormatInt(decimal, 10)
	}

	result.IsValid = true
	return result
}
