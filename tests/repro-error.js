import {CharStreams, CommonTokenStream} from 'antlr4';
import GrammarLexer from '../my_antlr/GrammarLexer.js';
import GrammarParser from '../my_antlr/GrammarParser.js';

const formula = "∀x ∀y (s(x) = s(y) ⇒ x = y)";
console.log("Testing:", formula);
const chars = CharStreams.fromString(formula);
const lexer = new GrammarLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new GrammarParser(tokens);
parser.formula();
console.log("Success!");
