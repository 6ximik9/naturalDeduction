grammar Grammar;

//formula: implication EOF;
formula: (atomList '⊢')? implication EOF;

atomList: implication (',' implication)*;

implication:  disjunction
              (IMPL  disjunction)*;

disjunction:  conjunction
             ( DIS conjunction)*;

conjunction: negation
             ( CON negation)* ;

negation: NEG+ parenthesis
          | parenthesis;

parenthesis: '(' implication ')' | atom;

atom: LETTER;

LETTER : [A-Z]+|[a-z]+|[α-ω]|[Α-Ω]|'⊥'|'⊤'|'⊢';

IMPL: '⇒'|'->'|'→';
DIS: '∨'|'OR'|'or'|'|'|'||';
CON: '∧'|'AND'|'and'|'&'|'&&';
NEG: '~'|'¬'|'!';

WS : [ \t\r\n]+ -> skip;
