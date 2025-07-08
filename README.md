# Number System Converter

A beautiful, professional desktop application for converting numbers between different number systems (Binary, Octal, Decimal, and Hexadecimal) with step-by-step solution explanations.

## Features

- **Multi-System Conversion**: Convert between Binary (base 2), Octal (base 8), Decimal (base 10), and Hexadecimal (base 16)
- **Step-by-Step Solutions**: Detailed explanation of the conversion process for educational purposes
- **Auto Conversions**: Instantly see conversions to all other number systems
- **Modern UI**: Beautiful glassmorphism design with animated background
- **Real-time Validation**: Input validation with helpful error messages
- **Copy to Clipboard**: One-click copying of conversion results
- **Responsive Design**: Clean, professional interface that adapts to different screen sizes

## Design

The application features a modern glassmorphism design with:
- Elegant semi-transparent cards with backdrop blur effects
- Gradient text styling for the main title
- Animated scrolling background
- Consistent slate color scheme throughout
- Professional typography and spacing

## Screenshots

The application displays:
- A centered main title "Number System Converter"
- Main conversion card with input/output fields and dropdowns
- Auto conversions card showing results in all other number systems
- Solution steps card with detailed conversion explanations

## Getting Started

### Prerequisites

- [Go](https://golang.org/dl/) (version 1.18 or higher)
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd numsys-converter
```

2. Install Wails CLI (if not already installed):
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### Running the Application

#### Development Mode
```bash
wails dev
```

#### Building for Production
```bash
wails build
```

The built executable will be available in the `build/bin/` directory.

## Tech Stack

### Backend
- **Go**: Core application logic and number system conversion algorithms
- **Wails v2**: Desktop application framework for Go + Web frontend

### Frontend
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

### Key Libraries
- **Glassmorphism Effects**: Custom Tailwind CSS classes
- **Animated Background**: Custom React component
- **Copy to Clipboard**: Browser Clipboard API

## Project Structure

```
numsys-converter/
├── app.go                 # Main Go application logic
├── main.go               # Application entry point
├── wails.json           # Wails configuration
├── go.mod               # Go module dependencies
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.tsx      # Main React component
│   │   ├── components/  # Reusable components
│   │   └── assets/      # Static assets
│   ├── package.json     # Node.js dependencies
│   └── vite.config.ts   # Vite configuration
├── build/               # Build output
└── README.md           # This file
```

## Core Functionality

### Number System Conversion
The application supports conversion between:
- **Binary (Base 2)**: Uses digits 0-1
- **Octal (Base 8)**: Uses digits 0-7
- **Decimal (Base 10)**: Uses digits 0-9
- **Hexadecimal (Base 16)**: Uses digits 0-9 and letters A-F

### Conversion Algorithm
1. **Input Validation**: Ensures the input is valid for the source number system
2. **Decimal Conversion**: Converts the input to decimal as an intermediate step
3. **Target Conversion**: Converts from decimal to the target number system
4. **Step Generation**: Creates detailed explanation steps for educational purposes

### Features in Detail

#### Main Conversion Card
- Source system dropdown (From)
- Input field with validation
- Target system dropdown (To)
- Result field with copy-to-clipboard functionality
- Swap button to quickly reverse conversion direction

#### Auto Conversions Card
- Automatically converts input to all other number systems
- Shows results in a clean grid layout
- Individual copy buttons for each result

#### Solution Steps Card
- Step-by-step breakdown of the conversion process
- Shows positional notation calculations
- Explains division method for target base conversion
- Educational content for learning number systems

## Development

### Backend Development
The Go backend handles all conversion logic and is located in `app.go`. Key functions:
- `ConvertNumber()`: Main conversion with step-by-step explanation
- `ConvertToAllSystems()`: Bulk conversion to all number systems
- `isValidForBase()`: Input validation
- `convertToDecimal()`: Base to decimal conversion
- `convertFromDecimal()`: Decimal to target base conversion

### Frontend Development
The React frontend is built with TypeScript and Tailwind CSS:
- Modern React hooks for state management
- Real-time conversion with debouncing
- Responsive design with CSS Grid
- Custom glassmorphism styling

### Building and Deployment
```bash
# Development with hot reload
wails dev

# Production build
wails build

# Build for specific platform
wails build -platform windows/amd64
```

## Usage Examples

1. **Binary to Decimal**: Enter `1010` in Binary mode, select Decimal as target → Result: `10`
2. **Decimal to Hexadecimal**: Enter `255` in Decimal mode, select Hexadecimal as target → Result: `FF`
3. **Hexadecimal to Binary**: Enter `ABC` in Hexadecimal mode, select Binary as target → Result: `101010111100`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Fran**
- Email: frandilbertperuso@gmail.com

**Caddi**
- Email: ktiking928@gmail.com

**Jude**
- Email: zoken@gmail.com

## Acknowledgments

- [Wails](https://wails.io/) for the excellent Go + Web framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [React](https://reactjs.org/) for the powerful UI library
- The Go and JavaScript communities for excellent tooling and resources

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.13, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB
- **Storage**: 100MB free space
- **Display**: 1024x768 resolution

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or modern Linux distribution
- **RAM**: 8GB or higher
- **Storage**: 500MB free space
- **Display**: 1920x1080 resolution or higher

---

Made with ❤️ by Fran, Caddi, and Jude
