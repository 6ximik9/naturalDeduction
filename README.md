<div align="center">
  <h1>LogicProof</h1>
  <p><strong><a href="https://6ximik9.github.io/naturalDeduction/">✨ Try it live here! ✨ </a></strong></p>
  <p>A comprehensive web-based Natural Deduction System and First-Order Logic Parser</p>
</div>

## 📖 About The Project

**LogicProof** is an advanced interactive web application designed for formal logical reasoning and proof construction. It features a robust First-Order Logic (FOL) parser built with ANTLR4, supporting various proof systems, logical paradigms, and complex mathematical theories.

Whether you are studying propositional logic, building complex Gentzen trees, or working with Robinson Arithmetic, LogicProof provides an intuitive, feature-rich environment to construct, validate, and visualize logical proofs.

## ✨ Key Features

- **Multiple Proof Systems**:
  - Natural Deduction (Gentzen tree-style)
  - Natural Deduction (Fitch linear-style)
  - Sequent Calculus
- **Logic Paradigms**: Classical and Intuitionistic Logic.
- **Logic Levels**:
  - Propositional Logic (VL)
  - Predicate Logic (PL) with quantifiers (∀, ∃)
- **Advanced Theories**: Built-in support for **Robinson Arithmetic** and **Order Axioms**.
- **Interactive Editor**: Integrated **Monaco Editor** for writing logical formulas with syntax highlighting and autocompletion.
- **Visual Proof Trees**: Dynamic rendering of proof trees using **D3.js**.
- **LaTeX Export**: Generate LaTeX code for your proofs instantly.
- **Customizable UI**: Dark/Light modes, multi-language support (English, Slovak, Ukrainian), and adjustable layouts.

## 🛠 Tech Stack

- **Core**: JavaScript (ES6+), HTML5, CSS3
- **Parser**: [ANTLR4](https://www.antlr.org/) (Custom Grammar & Listener for AST construction)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Visualization**: [D3.js](https://d3js.org/) (Proof trees), [MathJax](https://www.mathjax.org/) (Math rendering)
- **Build Tools**: Webpack, Babel, npm-run-all

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Java (Required to run the ANTLR4 tool for grammar generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/LogicProof.git
   cd LogicProof
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate the ANTLR Parser**
   ```bash
   npm run antlr
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:8080` (or the port specified by Webpack).

### Build for Production

```bash
npm run build
```
This will bundle the application into the `dist/` directory.

## 💡 Usage Guide

Once the application is running, follow these steps to build your first proof:

1. **Select Configuration**: On the welcome screen, choose your preferred proof system (e.g., Gentzen or Fitch), logic level (Propositional or Predicate), and active theories.
2. **Enter Formula**: Use the integrated Monaco Editor to type your logical formula or sequent (e.g., `A ∧ B ⊢ A`).
3. **Start Proof**: Click the "Proof" button to enter the main workspace.
4. **Apply Rules**:
   - In the left panel, browse the available logical rules (Introduction/Elimination) or Axioms.
   - Click a rule to apply it to your current proof step. The system will validate the application automatically.
5. **Analyze the Tree**: The right panel dynamically generates the proof tree. Use the zoom controls or drag to navigate complex proofs.
6. **Export**: Click the download icon in the top right of the proof container to export your finished proof as LaTeX code.

## 🧠 Architecture & Parser

At the heart of LogicProof is a powerful parsing engine generated via ANTLR4:

- **`Grammar.g4`**: The core grammar file defining the syntax of First-Order Logic, handling operator precedence and resolving left-recursion.
- **Custom AST Builder (`MyGrammarListener.js`)**: A stack-based listener that traverses the ANTLR parse tree to construct a structured JSON Abstract Syntax Tree (AST).
- **Deductive Engine**: Validates the AST against specific rules of Gentzen, Fitch, or Sequent calculus.

### Supported Syntax
The parser comprehensively supports:
- **Logical Connectives**: `⇒, ->`, `∨, or`, `∧, and`, `¬, ~`
- **Quantifiers**: `∀, forall`, `∃, exists`
- **Sequent Notation**: `P(x), ∀x(P(x) ⇒ Q(x)) ⊢ Q(x)`
- **Robinson Arithmetic**: Constants (`0`), functions (`s, +, *`), predicates (`=, ≠`)
- **Variables & Predicates**: Support for Greek letters (`α`, `β`, `Φ`, `Ψ`) and n-ary arguments.

## 🧪 Testing

The project includes comprehensive test suites to ensure logical accuracy and parser reliability.

```bash
# Test general first-order logic grammar
npm run test:grammar

# Test Robinson arithmetic axioms specifically
npm run test:robinson

# Run all tests
npm run test:all
```
*Current Status: 100% Passing coverage for formula parsing and arithmetic axioms.*

## 🌐 CI/CD & Deployment

This project includes fully automated deployment to **GitHub Pages** via GitHub Actions.

Every push to the `main` branch automatically triggers the `deploy.yml` workflow, which performs the following pipeline:
1. **Environment Setup**: Provisions Node.js 20 and Java 17.
2. **Parser Generation**: Downloads the ANTLR4 tool and generates the latest grammar files.
3. **Verification**: Installs dependencies and runs the comprehensive test suite (`npm test`) to prevent regressions.
4. **Build & Deploy**: Compiles the production bundle via Webpack (`npm run build`) and publishes the entire application directly to GitHub Pages.

*Note: You can also trigger this deployment pipeline manually from the "Actions" tab in GitHub.*

## 📁 Repository Structure

```text
├── css/                  # Styling (design.css, style.css)
├── js/                   # Core application logic
│   ├── core/             # Deductive engine, formatters, validators
│   ├── proofs/           # Gentzen, Fitch, Sequent proof implementations
│   ├── state/            # State management (MobX)
│   └── ui/               # UI components, Modals, Editor integration
├── my_antlr/             # ANTLR4 Grammar and generated parser files
├── tests/                # Test suites for parser and axioms
├── index.html            # Main entry point
├── package.json          # Dependencies and scripts
└── webpack.config.js     # Webpack configuration
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
