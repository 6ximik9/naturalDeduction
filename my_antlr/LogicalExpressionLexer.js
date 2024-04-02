// Generated from Grammar.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';


const serializedATN = [4,0,8,44,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,
7,4,2,5,7,5,2,6,7,6,2,7,7,7,1,0,1,0,1,1,1,1,1,2,1,2,1,2,3,2,25,8,2,1,3,1,
3,1,3,3,3,30,8,3,1,4,1,4,1,5,1,5,1,6,1,6,1,7,4,7,39,8,7,11,7,12,7,40,1,7,
1,7,0,0,8,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,1,0,3,2,0,33,33,172,172,2,0,
65,90,97,122,3,0,9,10,13,13,32,32,46,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,
0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,1,17,1,0,
0,0,3,19,1,0,0,0,5,24,1,0,0,0,7,29,1,0,0,0,9,31,1,0,0,0,11,33,1,0,0,0,13,
35,1,0,0,0,15,38,1,0,0,0,17,18,5,40,0,0,18,2,1,0,0,0,19,20,5,41,0,0,20,4,
1,0,0,0,21,25,5,8743,0,0,22,23,5,38,0,0,23,25,5,38,0,0,24,21,1,0,0,0,24,
22,1,0,0,0,25,6,1,0,0,0,26,30,5,8744,0,0,27,28,5,124,0,0,28,30,5,124,0,0,
29,26,1,0,0,0,29,27,1,0,0,0,30,8,1,0,0,0,31,32,5,8658,0,0,32,10,1,0,0,0,
33,34,7,0,0,0,34,12,1,0,0,0,35,36,7,1,0,0,36,14,1,0,0,0,37,39,7,2,0,0,38,
37,1,0,0,0,39,40,1,0,0,0,40,38,1,0,0,0,40,41,1,0,0,0,41,42,1,0,0,0,42,43,
6,7,0,0,43,16,1,0,0,0,4,0,24,29,40,1,6,0,0];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

export default class LogicalExpressionLexer extends antlr4.Lexer {

    static grammarFileName = "Grammar.g4";
    static channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	static modeNames = [ "DEFAULT_MODE" ];
	static literalNames = [ null, "'('", "')'", null, null, "'\\u21D2'" ];
	static symbolicNames = [ null, null, null, "AND", "OR", "IMPLIES", "NOT", 
                          "SINGLE_CHAR", "WS" ];
	static ruleNames = [ "T__0", "T__1", "AND", "OR", "IMPLIES", "NOT", "SINGLE_CHAR", 
                      "WS" ];

    constructor(input) {
        super(input)
        this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.atn.PredictionContextCache());
    }
}

LogicalExpressionLexer.EOF = antlr4.Token.EOF;
LogicalExpressionLexer.T__0 = 1;
LogicalExpressionLexer.T__1 = 2;
LogicalExpressionLexer.AND = 3;
LogicalExpressionLexer.OR = 4;
LogicalExpressionLexer.IMPLIES = 5;
LogicalExpressionLexer.NOT = 6;
LogicalExpressionLexer.SINGLE_CHAR = 7;
LogicalExpressionLexer.WS = 8;



