grammar Grammar;

// First-Order Logic Grammar with Robinson Arithmetic Support
// Supports quantifiers, predicates, terms, functions, and Robinson Arithmetic
// Robinson Arithmetic: Constants {0}, Functions {s, +, *}, Predicates {=}

// ==========================================
// LEXER RULES
// ==========================================

// Logical constants
TRUE: '⊤';
FALSE: '⊥';

// Logical operators
IMPL: '⇒' | '->' | '→' | '=>';
DIS: '∨' | 'OR' | 'or' | '|' | '||';
CON: '∧' | 'AND' | 'and' | '&' | '&&';
NEG: '~' | '¬' | '!';

// Quantifiers
FORALL: '∀' | 'forall' | 'ALL';
EXISTS: '∃' | 'exists' | 'EX';

// Equality & Relations
LT: '<';
GT: '>';
LE: '<=';
GE: '>=';
EQUAL: '=';
NOTEQUAL: '≠' | '!=' | '<>' | '/=';

// Arithmetic
PLUS: '+' | 'add' | 'ADD' | 'sum' | 'SUM';
MULT: '*' | 'mult' | 'MULT' | 'prod' | 'PROD';

// Function/Predicate Keywords (Reserved words to avoid variable collision)
EXP: 'exp' | 'pow';
PRED: 'pred';
SUB: 'sub';

// Numbers
NUMBER: [1-9] [0-9]*;

// Letters - ordered by specificity to avoid conflicts
// Generic IDs must come AFTER specific keywords
UPPERCASE_GREEK_LETTER: [Α-Ω] [Α-Ω0-9]*;
LOWERCASE_GREEK_LETTER: [α-ω] [α-ω0-9]*;
UPPERCASE_LETTER: [A-Z] [A-Z0-9]*;
LOWERCASE_LETTER: [a-z] [a-z0-9]*;

// Comments and whitespace
COMMENT: '//' ~[\r\n]* -> skip;
WS: [ \t\r\n]+ -> skip;

// ==========================================
// PARSER RULES
// ==========================================

// Main formula rule - supports sequent notation (premises ⊢ conclusion)
formula: atomList? '⊢' atomList? EOF
       | atomList EOF;

// List of premises separated by commas
atomList: implication (',' implication)*;

// Implication has lowest precedence (except quantifiers bind tighter in some conventions,
// but here we allow quantifiers to span implications)
// RIGHT-ASSOCIATIVE: a=>b=>c means a=>(b=>c)
implication: disjunction (IMPL implication)?;

// Disjunction
disjunction: conjunction (DIS conjunction)*;

// Conjunction
conjunction: negation (CON negation)*;

// Negation and quantifiers
negation: NEG+ negation
        | quantified;

// Quantified expressions
// Non-greedy scope: ∀x A -> B means (∀x A) -> B
quantified: forallQuant
          | existQuant
          | atomic;

// Universal quantifier: (∀x)φ or ∀x φ
forallQuant: '(' FORALL variable ')' negation
           | FORALL variable negation;

// Existential quantifier: (∃x)φ or ∃x φ
existQuant: '(' EXISTS variable ')' negation
          | EXISTS variable negation;

// Atomic expressions - highest precedence
atomic: '(' implication ')'           // Parenthesized formula
      | equality                      // Equality/inequality expressions
      | predicate                     // Predicate expressions
      | atom;                         // Simple atoms (includes variables, constants, etc.)

// Equality and relational expressions
equality: addExpr (EQUAL | NOTEQUAL | LT | GT | LE | GE) addExpr;

// Arithmetic expressions - fixed to avoid left recursion
addExpr: multExpr (PLUS multExpr)*;

multExpr: basicTerm (MULT basicTerm)*;

// Basic terms - no recursion issues
basicTerm: '(' addExpr ')'            // Parenthesized arithmetic
         | successorFunc              // s(t)
         | arithmeticFunc             // +(t1, t2), *(t1, t2)
         | functionApp                // f(t1, t2, ...)
         | constant                   // A, B, C (Preferred for uppercase)
         | variable                   // x, y, z (Preferred for lowercase)
         | numberSymb;                // 0, 1, 2, ...

// Predicate expressions
predicate: relationSymb '(' termList ')'  // P(t1, t2, ...)
         | relationSymb;                  // P (nullary predicate/proposition)

// Term list for function/predicate arguments
termList: term (',' term)*;

// Terms: variables, constants, functions, arithmetic expressions
term: addExpr;                           // Terms are arithmetic expressions

// Function application
functionApp: LOWERCASE_LETTER '(' termList ')';

// Variables
variable: LOWERCASE_LETTER | LOWERCASE_GREEK_LETTER | UPPERCASE_LETTER | UPPERCASE_GREEK_LETTER;

// Constants (New: uppercase letters as constants)
constant: UPPERCASE_LETTER | UPPERCASE_GREEK_LETTER;

// Relation symbols (predicates): P, Q, R, ... (including Greek)
relationSymb: UPPERCASE_LETTER | UPPERCASE_GREEK_LETTER;

// Successor function: s(term)
successorFunc: 's' '(' addExpr ')';

// Arithmetic functions: +(t1, t2), *(t1, t2) - prefix notation
arithmeticFunc: PLUS '(' addExpr ',' addExpr ')'
              | MULT '(' addExpr ',' addExpr ')';

// Numbers: 0, 1, 2, ...
numberSymb: NUMBER | '0';

// Basic atoms (for backward compatibility and simple propositions)
// Includes all basic terms and simple propositions
atom: TRUE | FALSE
    | basicTerm                       // Variables, constants, numbers, functions
    | relationSymb;                   // Simple propositions (nullary predicates)
