grammar Grammar;

// First-Order Logic Grammar with Robinson Arithmetic Support
// Supports quantifiers, predicates, terms, functions, and Robinson Arithmetic
// Robinson Arithmetic: Constants {0}, Functions {s, +, *}, Predicates {=}

// Main formula rule - supports sequent notation (premises ⊢ conclusion)
formula: (atomList '⊢')? implication EOF;

// List of premises separated by commas
atomList: implication (',' implication)*;

// Implication has lowest precedence (except quantifiers bind tighter)
implication: disjunction (IMPL disjunction)*;

// Disjunction
disjunction: conjunction (DIS conjunction)*;

// Conjunction
conjunction: negation (CON negation)*;

// Negation and quantifiers (quantifiers bind more tightly than other connectives)
negation: NEG+ quantified
        | quantified;

// Quantified expressions - quantifiers bind more strongly than logical connectives
quantified: forallQuant
          | existQuant
          | atomic;


// Universal quantifier: (∀x)φ or ∀x φ
forallQuant: '(' FORALL variable ')' quantified
           | FORALL variable quantified;

// Existential quantifier: (∃x)φ or ∃x φ
existQuant: '(' EXISTS variable ')' quantified
          | EXISTS variable quantified;

// Atomic expressions - highest precedence
atomic: '(' implication ')'           // Parenthesized formula
      | equality                      // Equality/inequality expressions
      | predicate                     // Predicate expressions
      | atom;                         // Simple atoms (includes variables, constants, etc.)

// Equality and relational expressions
equality: addExpr (EQUAL | NOTEQUAL) addExpr;

// Arithmetic expressions - fixed to avoid left recursion
addExpr: multExpr (PLUS multExpr)*;

multExpr: basicTerm (MULT basicTerm)*;

// Basic terms - no recursion issues
basicTerm: '(' addExpr ')'            // Parenthesized arithmetic
         | successorFunc              // s(t)
         | functionApp                // f(t1, t2, ...)
         | variable                   // x, y, z
         | constant                   // a, b, c, 0, 1, 2
         | numberSymb                 // 0, 1, 2, ...
         | relationSymb;              // P, Q, R (for equality between propositions)

// Predicate expressions
predicate: relationSymb '(' termList ')'  // P(t1, t2, ...)
         | relationSymb;                  // P (nullary predicate/proposition)

// Term list for function/predicate arguments
termList: term (',' term)*;

// Terms: variables, constants, functions, arithmetic expressions
term: addExpr;                           // Terms are arithmetic expressions

// Function application
functionApp: LOWERCASE_LETTER '(' termList ')';

// Variables (distinct from constants by context)
//variable: LOWERCASE_LETTER | LOWERCASE_GREEK_LETTER;
variable: LOWERCASE_LETTER | LOWERCASE_GREEK_LETTER;

// Constants (numbers are always constants, letters depend on context)
constant: numberSymb;

// Relation symbols (predicates): P, Q, R, ... (including Greek)
relationSymb: UPPERCASE_LETTER | UPPERCASE_GREEK_LETTER;

// Successor function: s(term) - using addExpr to avoid recursion
successorFunc: 's' '(' addExpr ')'
              | 's0' ;

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

// LEXER RULES

// Logical constants
TRUE: '⊤';
FALSE: '⊥';

// Letters - ordered by specificity to avoid conflicts
UPPERCASE_GREEK_LETTER: [Α-Ω] [Α-Ω0-9]*;
LOWERCASE_GREEK_LETTER: [α-ω] [α-ω0-9]*;
UPPERCASE_LETTER: [A-Z] [A-Z0-9]*;
LOWERCASE_LETTER: [a-z] [a-z0-9]*;

// Logical operators
IMPL: '⇒' | '->' | '→' | '=>';
DIS: '∨' | 'OR' | 'or' | '|' | '||';
CON: '∧' | 'AND' | 'and' | '&' | '&&';
NEG: '~' | '¬' | '!';

// Quantifiers
FORALL: '∀' | 'forall' | 'ALL';
EXISTS: '∃' | 'exists' | 'EX';

// Equality
EQUAL: '=';
NOTEQUAL: '≠' | '!=' | '<>' | '/=';

// Arithmetic
PLUS: '+';
MULT: '*';

// Numbers
NUMBER: [1-9] [0-9]*;

// Comments and whitespace
COMMENT: '//' ~[\r\n]* -> skip;
WS: [ \t\r\n]+ -> skip;
