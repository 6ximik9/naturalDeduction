grammar Grammar;

formula: (atomList '⊢')? implication EOF;

atomList: implication (',' implication)*;

implication:  disjunction
              (IMPL  disjunction)*;

disjunction:  conjunction
             ( DIS conjunction)*;

conjunction: negation
             ( CON negation)* ;

negation:   NEG+ quantifier
          | quantifier
          | NEG+ parenthesis
          | parenthesis;

quantifier: '(' (FORALL | EXISTS) constantSymb ')' parenthesis;

parenthesis: '(' implication ')' | term | equality;

equality: term '=' term;

term:
      relationSymb  # relationClause
    | constantSymb  # constantClause
    | atom          # variableClause
    ;

relationSymb: UPPERCASE_LETTER '(' ((term|functionSymb) (',' (term|functionSymb))*)? ')';
functionSymb: LOWERCASE_LETTER '(' (term (',' term)*)? ')';
constantSymb: LOWERCASE_LETTER|'⊥'|'⊤';
atom: UPPERCASE_LETTER;

UPPERCASE_LETTER : [A-Z][A-Za-z0-9]*|[Α-Ω];
LOWERCASE_LETTER : [a-z][A-Za-z0-9]*|[α-ω];

IMPL: '⇒'|'->'|'→'|'=>';
DIS: '∨'|'OR'|'or'|'|'|'||';
CON: '∧'|'AND'|'and'|'&'|'&&';
NEG: '~'|'¬'|'!';
FORALL: '∀';
EXISTS: '∃';

TRUE: [Tt][Rr][Uu][Ee];
FALSE: [Ff][Aa][Ll][Ss][Ee];

COMMENT : '//' ~[\r\n]* -> skip;
WS : [ \t\r\n]+ -> skip;
