import {CharStreams, CommonTokenStream, ParseTreeWalker} from 'antlr4';
import GrammarLexer from '../my_antlr/GrammarLexer.js';
import GrammarParser from '../my_antlr/GrammarParser.js';
import MyGrammarListener from '../my_antlr/MyGrammarListener.js';

/**
 * Core test utility to parse and optionally validate AST structure
 */
export function parseAndCheck(formula, options = {}) {
  const { 
    showAST = false, 
    expectedType = null,
    quiet = false 
  } = options;

  if (!quiet) console.log(`Testing: ${formula}`);
  
  try {
    const chars = CharStreams.fromString(formula);
    const lexer = new GrammarLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new GrammarParser(tokens);
    
    // Explicitly do NOT remove listeners or add custom ones for now to debug
    // lexer.removeErrorListeners();
    // parser.removeErrorListeners();
    
    let tree = parser.formula();

    const listener = new MyGrammarListener();
    ParseTreeWalker.DEFAULT.walk(listener, tree);
    const result = listener.stack.pop();

    if (showAST) {
      console.log('AST:', JSON.stringify(result, null, 2));
    }

    if (expectedType && result.type !== expectedType) {
      throw new Error(`Type mismatch: expected ${expectedType}, got ${result.type}`);
    }

    if (!quiet) console.log('  ✓ OK');
    return result;
  } catch (error) {
    if (!quiet) console.log(`  ✗ FAILED: ${error.message}`);
    // console.log(error.stack);
    return null;
  }
}

/**
 * Runs a group of tests
 */
export function runTestGroup(name, tests, commonOptions = {}) {
  console.log(`\n=== ${name} ===\n`);
  let passed = 0;
  tests.forEach(t => {
    const formula = Array.isArray(t) ? t[0] : t;
    const result = parseAndCheck(formula, commonOptions);
    if (result) passed++;
  });
  console.log(`\nResult: ${passed}/${tests.length} passed`);
  return passed === tests.length;
}
