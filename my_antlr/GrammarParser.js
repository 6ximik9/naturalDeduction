// Generated from Grammar.g4 by ANTLR 4.13.2
// jshint ignore: start
import antlr4 from 'antlr4';
import GrammarListener from './GrammarListener.js';
const serializedATN = [4,1,25,225,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,1,0,1,0,1,0,3,0,54,8,0,1,
0,1,0,1,0,1,1,1,1,1,1,5,1,62,8,1,10,1,12,1,65,9,1,1,2,1,2,1,2,3,2,70,8,2,
1,3,1,3,1,3,5,3,75,8,3,10,3,12,3,78,9,3,1,4,1,4,1,4,5,4,83,8,4,10,4,12,4,
86,9,4,1,5,4,5,89,8,5,11,5,12,5,90,1,5,1,5,3,5,95,8,5,1,6,1,6,1,6,3,6,100,
8,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,3,7,112,8,7,1,8,1,8,1,8,1,8,
1,8,1,8,1,8,1,8,1,8,1,8,3,8,124,8,8,1,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,133,
8,9,1,10,1,10,1,10,1,10,1,11,1,11,1,11,5,11,142,8,11,10,11,12,11,145,9,11,
1,12,1,12,1,12,5,12,150,8,12,10,12,12,12,153,9,12,1,13,1,13,1,13,1,13,1,
13,1,13,1,13,1,13,1,13,1,13,3,13,165,8,13,1,14,1,14,1,14,1,14,1,14,1,14,
3,14,173,8,14,1,15,1,15,1,15,5,15,178,8,15,10,15,12,15,181,9,15,1,16,1,16,
1,17,1,17,1,17,1,17,1,17,1,18,1,18,1,19,1,19,1,20,1,20,1,21,1,21,1,21,1,
21,1,21,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,
1,22,3,22,215,8,22,1,23,1,23,1,24,1,24,1,24,1,24,3,24,223,8,24,1,24,0,0,
25,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,
0,4,1,0,19,20,2,0,10,10,12,12,2,0,9,9,11,11,2,0,6,6,23,23,227,0,53,1,0,0,
0,2,58,1,0,0,0,4,66,1,0,0,0,6,71,1,0,0,0,8,79,1,0,0,0,10,94,1,0,0,0,12,99,
1,0,0,0,14,111,1,0,0,0,16,123,1,0,0,0,18,132,1,0,0,0,20,134,1,0,0,0,22,138,
1,0,0,0,24,146,1,0,0,0,26,164,1,0,0,0,28,172,1,0,0,0,30,174,1,0,0,0,32,182,
1,0,0,0,34,184,1,0,0,0,36,189,1,0,0,0,38,191,1,0,0,0,40,193,1,0,0,0,42,195,
1,0,0,0,44,214,1,0,0,0,46,216,1,0,0,0,48,222,1,0,0,0,50,51,3,2,1,0,51,52,
5,1,0,0,52,54,1,0,0,0,53,50,1,0,0,0,53,54,1,0,0,0,54,55,1,0,0,0,55,56,3,
4,2,0,56,57,5,0,0,1,57,1,1,0,0,0,58,63,3,4,2,0,59,60,5,2,0,0,60,62,3,4,2,
0,61,59,1,0,0,0,62,65,1,0,0,0,63,61,1,0,0,0,63,64,1,0,0,0,64,3,1,0,0,0,65,
63,1,0,0,0,66,69,3,6,3,0,67,68,5,13,0,0,68,70,3,4,2,0,69,67,1,0,0,0,69,70,
1,0,0,0,70,5,1,0,0,0,71,76,3,8,4,0,72,73,5,14,0,0,73,75,3,8,4,0,74,72,1,
0,0,0,75,78,1,0,0,0,76,74,1,0,0,0,76,77,1,0,0,0,77,7,1,0,0,0,78,76,1,0,0,
0,79,84,3,10,5,0,80,81,5,15,0,0,81,83,3,10,5,0,82,80,1,0,0,0,83,86,1,0,0,
0,84,82,1,0,0,0,84,85,1,0,0,0,85,9,1,0,0,0,86,84,1,0,0,0,87,89,5,16,0,0,
88,87,1,0,0,0,89,90,1,0,0,0,90,88,1,0,0,0,90,91,1,0,0,0,91,92,1,0,0,0,92,
95,3,12,6,0,93,95,3,12,6,0,94,88,1,0,0,0,94,93,1,0,0,0,95,11,1,0,0,0,96,
100,3,14,7,0,97,100,3,16,8,0,98,100,3,18,9,0,99,96,1,0,0,0,99,97,1,0,0,0,
99,98,1,0,0,0,100,13,1,0,0,0,101,102,5,3,0,0,102,103,5,17,0,0,103,104,3,
36,18,0,104,105,5,4,0,0,105,106,3,12,6,0,106,112,1,0,0,0,107,108,5,17,0,
0,108,109,3,36,18,0,109,110,3,12,6,0,110,112,1,0,0,0,111,101,1,0,0,0,111,
107,1,0,0,0,112,15,1,0,0,0,113,114,5,3,0,0,114,115,5,18,0,0,115,116,3,36,
18,0,116,117,5,4,0,0,117,118,3,12,6,0,118,124,1,0,0,0,119,120,5,18,0,0,120,
121,3,36,18,0,121,122,3,12,6,0,122,124,1,0,0,0,123,113,1,0,0,0,123,119,1,
0,0,0,124,17,1,0,0,0,125,126,5,3,0,0,126,127,3,4,2,0,127,128,5,4,0,0,128,
133,1,0,0,0,129,133,3,20,10,0,130,133,3,28,14,0,131,133,3,48,24,0,132,125,
1,0,0,0,132,129,1,0,0,0,132,130,1,0,0,0,132,131,1,0,0,0,133,19,1,0,0,0,134,
135,3,22,11,0,135,136,7,0,0,0,136,137,3,22,11,0,137,21,1,0,0,0,138,143,3,
24,12,0,139,140,5,21,0,0,140,142,3,24,12,0,141,139,1,0,0,0,142,145,1,0,0,
0,143,141,1,0,0,0,143,144,1,0,0,0,144,23,1,0,0,0,145,143,1,0,0,0,146,151,
3,26,13,0,147,148,5,22,0,0,148,150,3,26,13,0,149,147,1,0,0,0,150,153,1,0,
0,0,151,149,1,0,0,0,151,152,1,0,0,0,152,25,1,0,0,0,153,151,1,0,0,0,154,155,
5,3,0,0,155,156,3,22,11,0,156,157,5,4,0,0,157,165,1,0,0,0,158,165,3,42,21,
0,159,165,3,34,17,0,160,165,3,36,18,0,161,165,3,38,19,0,162,165,3,46,23,
0,163,165,3,40,20,0,164,154,1,0,0,0,164,158,1,0,0,0,164,159,1,0,0,0,164,
160,1,0,0,0,164,161,1,0,0,0,164,162,1,0,0,0,164,163,1,0,0,0,165,27,1,0,0,
0,166,167,3,40,20,0,167,168,5,3,0,0,168,169,3,30,15,0,169,170,5,4,0,0,170,
173,1,0,0,0,171,173,3,40,20,0,172,166,1,0,0,0,172,171,1,0,0,0,173,29,1,0,
0,0,174,179,3,32,16,0,175,176,5,2,0,0,176,178,3,32,16,0,177,175,1,0,0,0,
178,181,1,0,0,0,179,177,1,0,0,0,179,180,1,0,0,0,180,31,1,0,0,0,181,179,1,
0,0,0,182,183,3,22,11,0,183,33,1,0,0,0,184,185,5,12,0,0,185,186,5,3,0,0,
186,187,3,30,15,0,187,188,5,4,0,0,188,35,1,0,0,0,189,190,7,1,0,0,190,37,
1,0,0,0,191,192,3,46,23,0,192,39,1,0,0,0,193,194,7,2,0,0,194,41,1,0,0,0,
195,196,5,5,0,0,196,197,5,3,0,0,197,198,3,22,11,0,198,199,5,4,0,0,199,43,
1,0,0,0,200,201,5,21,0,0,201,202,5,3,0,0,202,203,3,22,11,0,203,204,5,2,0,
0,204,205,3,22,11,0,205,206,5,4,0,0,206,215,1,0,0,0,207,208,5,22,0,0,208,
209,5,3,0,0,209,210,3,22,11,0,210,211,5,2,0,0,211,212,3,22,11,0,212,213,
5,4,0,0,213,215,1,0,0,0,214,200,1,0,0,0,214,207,1,0,0,0,215,45,1,0,0,0,216,
217,7,3,0,0,217,47,1,0,0,0,218,223,5,7,0,0,219,223,5,8,0,0,220,223,3,26,
13,0,221,223,3,40,20,0,222,218,1,0,0,0,222,219,1,0,0,0,222,220,1,0,0,0,222,
221,1,0,0,0,223,49,1,0,0,0,18,53,63,69,76,84,90,94,99,111,123,132,143,151,
164,172,179,214,222];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class GrammarParser extends antlr4.Parser {

    static grammarFileName = "Grammar.g4";
    static literalNames = [ null, "'\\u22A2'", "','", "'('", "')'", "'s'", 
                            "'0'", "'\\u22A4'", "'\\u22A5'", null, null, 
                            null, null, null, null, null, null, null, null, 
                            "'='", null, "'+'", "'*'" ];
    static symbolicNames = [ null, null, null, null, null, null, null, "TRUE", 
                             "FALSE", "UPPERCASE_GREEK_LETTER", "LOWERCASE_GREEK_LETTER", 
                             "UPPERCASE_LETTER", "LOWERCASE_LETTER", "IMPL", 
                             "DIS", "CON", "NEG", "FORALL", "EXISTS", "EQUAL", 
                             "NOTEQUAL", "PLUS", "MULT", "NUMBER", "COMMENT", 
                             "WS" ];
    static ruleNames = [ "formula", "atomList", "implication", "disjunction", 
                         "conjunction", "negation", "quantified", "forallQuant", 
                         "existQuant", "atomic", "equality", "addExpr", 
                         "multExpr", "basicTerm", "predicate", "termList", 
                         "term", "functionApp", "variable", "constant", 
                         "relationSymb", "successorFunc", "arithmeticFunc", 
                         "numberSymb", "atom" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = GrammarParser.ruleNames;
        this.literalNames = GrammarParser.literalNames;
        this.symbolicNames = GrammarParser.symbolicNames;
    }



	formula() {
	    let localctx = new FormulaContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, GrammarParser.RULE_formula);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 53;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,0,this._ctx);
	        if(la_===1) {
	            this.state = 50;
	            this.atomList();
	            this.state = 51;
	            this.match(GrammarParser.T__0);

	        }
	        this.state = 55;
	        this.implication();
	        this.state = 56;
	        this.match(GrammarParser.EOF);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	atomList() {
	    let localctx = new AtomListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, GrammarParser.RULE_atomList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 58;
	        this.implication();
	        this.state = 63;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 59;
	            this.match(GrammarParser.T__1);
	            this.state = 60;
	            this.implication();
	            this.state = 65;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	implication() {
	    let localctx = new ImplicationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, GrammarParser.RULE_implication);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 66;
	        this.disjunction();
	        this.state = 69;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===13) {
	            this.state = 67;
	            this.match(GrammarParser.IMPL);
	            this.state = 68;
	            this.implication();
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	disjunction() {
	    let localctx = new DisjunctionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, GrammarParser.RULE_disjunction);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 71;
	        this.conjunction();
	        this.state = 76;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===14) {
	            this.state = 72;
	            this.match(GrammarParser.DIS);
	            this.state = 73;
	            this.conjunction();
	            this.state = 78;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	conjunction() {
	    let localctx = new ConjunctionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, GrammarParser.RULE_conjunction);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 79;
	        this.negation();
	        this.state = 84;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===15) {
	            this.state = 80;
	            this.match(GrammarParser.CON);
	            this.state = 81;
	            this.negation();
	            this.state = 86;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	negation() {
	    let localctx = new NegationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, GrammarParser.RULE_negation);
	    var _la = 0;
	    try {
	        this.state = 94;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 16:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 88; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            do {
	                this.state = 87;
	                this.match(GrammarParser.NEG);
	                this.state = 90; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            } while(_la===16);
	            this.state = 92;
	            this.quantified();
	            break;
	        case 3:
	        case 5:
	        case 6:
	        case 7:
	        case 8:
	        case 9:
	        case 10:
	        case 11:
	        case 12:
	        case 17:
	        case 18:
	        case 23:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 93;
	            this.quantified();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	quantified() {
	    let localctx = new QuantifiedContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, GrammarParser.RULE_quantified);
	    try {
	        this.state = 99;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,7,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 96;
	            this.forallQuant();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 97;
	            this.existQuant();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 98;
	            this.atomic();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	forallQuant() {
	    let localctx = new ForallQuantContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, GrammarParser.RULE_forallQuant);
	    try {
	        this.state = 111;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 101;
	            this.match(GrammarParser.T__2);
	            this.state = 102;
	            this.match(GrammarParser.FORALL);
	            this.state = 103;
	            this.variable();
	            this.state = 104;
	            this.match(GrammarParser.T__3);
	            this.state = 105;
	            this.quantified();
	            break;
	        case 17:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 107;
	            this.match(GrammarParser.FORALL);
	            this.state = 108;
	            this.variable();
	            this.state = 109;
	            this.quantified();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	existQuant() {
	    let localctx = new ExistQuantContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, GrammarParser.RULE_existQuant);
	    try {
	        this.state = 123;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 113;
	            this.match(GrammarParser.T__2);
	            this.state = 114;
	            this.match(GrammarParser.EXISTS);
	            this.state = 115;
	            this.variable();
	            this.state = 116;
	            this.match(GrammarParser.T__3);
	            this.state = 117;
	            this.quantified();
	            break;
	        case 18:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 119;
	            this.match(GrammarParser.EXISTS);
	            this.state = 120;
	            this.variable();
	            this.state = 121;
	            this.quantified();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	atomic() {
	    let localctx = new AtomicContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, GrammarParser.RULE_atomic);
	    try {
	        this.state = 132;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,10,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 125;
	            this.match(GrammarParser.T__2);
	            this.state = 126;
	            this.implication();
	            this.state = 127;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 129;
	            this.equality();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 130;
	            this.predicate();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 131;
	            this.atom();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	equality() {
	    let localctx = new EqualityContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, GrammarParser.RULE_equality);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 134;
	        this.addExpr();
	        this.state = 135;
	        _la = this._input.LA(1);
	        if(!(_la===19 || _la===20)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 136;
	        this.addExpr();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	addExpr() {
	    let localctx = new AddExprContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, GrammarParser.RULE_addExpr);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 138;
	        this.multExpr();
	        this.state = 143;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===21) {
	            this.state = 139;
	            this.match(GrammarParser.PLUS);
	            this.state = 140;
	            this.multExpr();
	            this.state = 145;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	multExpr() {
	    let localctx = new MultExprContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, GrammarParser.RULE_multExpr);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 146;
	        this.basicTerm();
	        this.state = 151;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===22) {
	            this.state = 147;
	            this.match(GrammarParser.MULT);
	            this.state = 148;
	            this.basicTerm();
	            this.state = 153;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	basicTerm() {
	    let localctx = new BasicTermContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 26, GrammarParser.RULE_basicTerm);
	    try {
	        this.state = 164;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,13,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 154;
	            this.match(GrammarParser.T__2);
	            this.state = 155;
	            this.addExpr();
	            this.state = 156;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 158;
	            this.successorFunc();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 159;
	            this.functionApp();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 160;
	            this.variable();
	            break;

	        case 5:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 161;
	            this.constant();
	            break;

	        case 6:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 162;
	            this.numberSymb();
	            break;

	        case 7:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 163;
	            this.relationSymb();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	predicate() {
	    let localctx = new PredicateContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 28, GrammarParser.RULE_predicate);
	    try {
	        this.state = 172;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,14,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 166;
	            this.relationSymb();
	            this.state = 167;
	            this.match(GrammarParser.T__2);
	            this.state = 168;
	            this.termList();
	            this.state = 169;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 171;
	            this.relationSymb();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	termList() {
	    let localctx = new TermListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 30, GrammarParser.RULE_termList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 174;
	        this.term();
	        this.state = 179;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 175;
	            this.match(GrammarParser.T__1);
	            this.state = 176;
	            this.term();
	            this.state = 181;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	term() {
	    let localctx = new TermContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 32, GrammarParser.RULE_term);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 182;
	        this.addExpr();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	functionApp() {
	    let localctx = new FunctionAppContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 34, GrammarParser.RULE_functionApp);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 184;
	        this.match(GrammarParser.LOWERCASE_LETTER);
	        this.state = 185;
	        this.match(GrammarParser.T__2);
	        this.state = 186;
	        this.termList();
	        this.state = 187;
	        this.match(GrammarParser.T__3);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	variable() {
	    let localctx = new VariableContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 36, GrammarParser.RULE_variable);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 189;
	        _la = this._input.LA(1);
	        if(!(_la===10 || _la===12)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	constant() {
	    let localctx = new ConstantContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 38, GrammarParser.RULE_constant);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 191;
	        this.numberSymb();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	relationSymb() {
	    let localctx = new RelationSymbContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 40, GrammarParser.RULE_relationSymb);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 193;
	        _la = this._input.LA(1);
	        if(!(_la===9 || _la===11)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	successorFunc() {
	    let localctx = new SuccessorFuncContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 42, GrammarParser.RULE_successorFunc);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 195;
	        this.match(GrammarParser.T__4);
	        this.state = 196;
	        this.match(GrammarParser.T__2);
	        this.state = 197;
	        this.addExpr();
	        this.state = 198;
	        this.match(GrammarParser.T__3);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	arithmeticFunc() {
	    let localctx = new ArithmeticFuncContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 44, GrammarParser.RULE_arithmeticFunc);
	    try {
	        this.state = 214;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 21:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 200;
	            this.match(GrammarParser.PLUS);
	            this.state = 201;
	            this.match(GrammarParser.T__2);
	            this.state = 202;
	            this.addExpr();
	            this.state = 203;
	            this.match(GrammarParser.T__1);
	            this.state = 204;
	            this.addExpr();
	            this.state = 205;
	            this.match(GrammarParser.T__3);
	            break;
	        case 22:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 207;
	            this.match(GrammarParser.MULT);
	            this.state = 208;
	            this.match(GrammarParser.T__2);
	            this.state = 209;
	            this.addExpr();
	            this.state = 210;
	            this.match(GrammarParser.T__1);
	            this.state = 211;
	            this.addExpr();
	            this.state = 212;
	            this.match(GrammarParser.T__3);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	numberSymb() {
	    let localctx = new NumberSymbContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 46, GrammarParser.RULE_numberSymb);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 216;
	        _la = this._input.LA(1);
	        if(!(_la===6 || _la===23)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	atom() {
	    let localctx = new AtomContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 48, GrammarParser.RULE_atom);
	    try {
	        this.state = 222;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,17,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 218;
	            this.match(GrammarParser.TRUE);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 219;
	            this.match(GrammarParser.FALSE);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 220;
	            this.basicTerm();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 221;
	            this.relationSymb();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

GrammarParser.EOF = antlr4.Token.EOF;
GrammarParser.T__0 = 1;
GrammarParser.T__1 = 2;
GrammarParser.T__2 = 3;
GrammarParser.T__3 = 4;
GrammarParser.T__4 = 5;
GrammarParser.T__5 = 6;
GrammarParser.TRUE = 7;
GrammarParser.FALSE = 8;
GrammarParser.UPPERCASE_GREEK_LETTER = 9;
GrammarParser.LOWERCASE_GREEK_LETTER = 10;
GrammarParser.UPPERCASE_LETTER = 11;
GrammarParser.LOWERCASE_LETTER = 12;
GrammarParser.IMPL = 13;
GrammarParser.DIS = 14;
GrammarParser.CON = 15;
GrammarParser.NEG = 16;
GrammarParser.FORALL = 17;
GrammarParser.EXISTS = 18;
GrammarParser.EQUAL = 19;
GrammarParser.NOTEQUAL = 20;
GrammarParser.PLUS = 21;
GrammarParser.MULT = 22;
GrammarParser.NUMBER = 23;
GrammarParser.COMMENT = 24;
GrammarParser.WS = 25;

GrammarParser.RULE_formula = 0;
GrammarParser.RULE_atomList = 1;
GrammarParser.RULE_implication = 2;
GrammarParser.RULE_disjunction = 3;
GrammarParser.RULE_conjunction = 4;
GrammarParser.RULE_negation = 5;
GrammarParser.RULE_quantified = 6;
GrammarParser.RULE_forallQuant = 7;
GrammarParser.RULE_existQuant = 8;
GrammarParser.RULE_atomic = 9;
GrammarParser.RULE_equality = 10;
GrammarParser.RULE_addExpr = 11;
GrammarParser.RULE_multExpr = 12;
GrammarParser.RULE_basicTerm = 13;
GrammarParser.RULE_predicate = 14;
GrammarParser.RULE_termList = 15;
GrammarParser.RULE_term = 16;
GrammarParser.RULE_functionApp = 17;
GrammarParser.RULE_variable = 18;
GrammarParser.RULE_constant = 19;
GrammarParser.RULE_relationSymb = 20;
GrammarParser.RULE_successorFunc = 21;
GrammarParser.RULE_arithmeticFunc = 22;
GrammarParser.RULE_numberSymb = 23;
GrammarParser.RULE_atom = 24;

class FormulaContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_formula;
    }

	implication() {
	    return this.getTypedRuleContext(ImplicationContext,0);
	};

	EOF() {
	    return this.getToken(GrammarParser.EOF, 0);
	};

	atomList() {
	    return this.getTypedRuleContext(AtomListContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterFormula(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitFormula(this);
		}
	}


}



class AtomListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_atomList;
    }

	implication = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ImplicationContext);
	    } else {
	        return this.getTypedRuleContext(ImplicationContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterAtomList(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitAtomList(this);
		}
	}


}



class ImplicationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_implication;
    }

	disjunction() {
	    return this.getTypedRuleContext(DisjunctionContext,0);
	};

	IMPL() {
	    return this.getToken(GrammarParser.IMPL, 0);
	};

	implication() {
	    return this.getTypedRuleContext(ImplicationContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterImplication(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitImplication(this);
		}
	}


}



class DisjunctionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_disjunction;
    }

	conjunction = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ConjunctionContext);
	    } else {
	        return this.getTypedRuleContext(ConjunctionContext,i);
	    }
	};

	DIS = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(GrammarParser.DIS);
	    } else {
	        return this.getToken(GrammarParser.DIS, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterDisjunction(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitDisjunction(this);
		}
	}


}



class ConjunctionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_conjunction;
    }

	negation = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(NegationContext);
	    } else {
	        return this.getTypedRuleContext(NegationContext,i);
	    }
	};

	CON = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(GrammarParser.CON);
	    } else {
	        return this.getToken(GrammarParser.CON, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterConjunction(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitConjunction(this);
		}
	}


}



class NegationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_negation;
    }

	quantified() {
	    return this.getTypedRuleContext(QuantifiedContext,0);
	};

	NEG = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(GrammarParser.NEG);
	    } else {
	        return this.getToken(GrammarParser.NEG, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterNegation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitNegation(this);
		}
	}


}



class QuantifiedContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_quantified;
    }

	forallQuant() {
	    return this.getTypedRuleContext(ForallQuantContext,0);
	};

	existQuant() {
	    return this.getTypedRuleContext(ExistQuantContext,0);
	};

	atomic() {
	    return this.getTypedRuleContext(AtomicContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterQuantified(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitQuantified(this);
		}
	}


}



class ForallQuantContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_forallQuant;
    }

	FORALL() {
	    return this.getToken(GrammarParser.FORALL, 0);
	};

	variable() {
	    return this.getTypedRuleContext(VariableContext,0);
	};

	quantified() {
	    return this.getTypedRuleContext(QuantifiedContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterForallQuant(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitForallQuant(this);
		}
	}


}



class ExistQuantContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_existQuant;
    }

	EXISTS() {
	    return this.getToken(GrammarParser.EXISTS, 0);
	};

	variable() {
	    return this.getTypedRuleContext(VariableContext,0);
	};

	quantified() {
	    return this.getTypedRuleContext(QuantifiedContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterExistQuant(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitExistQuant(this);
		}
	}


}



class AtomicContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_atomic;
    }

	implication() {
	    return this.getTypedRuleContext(ImplicationContext,0);
	};

	equality() {
	    return this.getTypedRuleContext(EqualityContext,0);
	};

	predicate() {
	    return this.getTypedRuleContext(PredicateContext,0);
	};

	atom() {
	    return this.getTypedRuleContext(AtomContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterAtomic(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitAtomic(this);
		}
	}


}



class EqualityContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_equality;
    }

	addExpr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(AddExprContext);
	    } else {
	        return this.getTypedRuleContext(AddExprContext,i);
	    }
	};

	EQUAL() {
	    return this.getToken(GrammarParser.EQUAL, 0);
	};

	NOTEQUAL() {
	    return this.getToken(GrammarParser.NOTEQUAL, 0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterEquality(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitEquality(this);
		}
	}


}



class AddExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_addExpr;
    }

	multExpr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(MultExprContext);
	    } else {
	        return this.getTypedRuleContext(MultExprContext,i);
	    }
	};

	PLUS = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(GrammarParser.PLUS);
	    } else {
	        return this.getToken(GrammarParser.PLUS, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterAddExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitAddExpr(this);
		}
	}


}



class MultExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_multExpr;
    }

	basicTerm = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(BasicTermContext);
	    } else {
	        return this.getTypedRuleContext(BasicTermContext,i);
	    }
	};

	MULT = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(GrammarParser.MULT);
	    } else {
	        return this.getToken(GrammarParser.MULT, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterMultExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitMultExpr(this);
		}
	}


}



class BasicTermContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_basicTerm;
    }

	addExpr() {
	    return this.getTypedRuleContext(AddExprContext,0);
	};

	successorFunc() {
	    return this.getTypedRuleContext(SuccessorFuncContext,0);
	};

	functionApp() {
	    return this.getTypedRuleContext(FunctionAppContext,0);
	};

	variable() {
	    return this.getTypedRuleContext(VariableContext,0);
	};

	constant() {
	    return this.getTypedRuleContext(ConstantContext,0);
	};

	numberSymb() {
	    return this.getTypedRuleContext(NumberSymbContext,0);
	};

	relationSymb() {
	    return this.getTypedRuleContext(RelationSymbContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterBasicTerm(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitBasicTerm(this);
		}
	}


}



class PredicateContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_predicate;
    }

	relationSymb() {
	    return this.getTypedRuleContext(RelationSymbContext,0);
	};

	termList() {
	    return this.getTypedRuleContext(TermListContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterPredicate(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitPredicate(this);
		}
	}


}



class TermListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_termList;
    }

	term = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(TermContext);
	    } else {
	        return this.getTypedRuleContext(TermContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterTermList(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitTermList(this);
		}
	}


}



class TermContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_term;
    }

	addExpr() {
	    return this.getTypedRuleContext(AddExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterTerm(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitTerm(this);
		}
	}


}



class FunctionAppContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_functionApp;
    }

	LOWERCASE_LETTER() {
	    return this.getToken(GrammarParser.LOWERCASE_LETTER, 0);
	};

	termList() {
	    return this.getTypedRuleContext(TermListContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterFunctionApp(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitFunctionApp(this);
		}
	}


}



class VariableContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_variable;
    }

	LOWERCASE_LETTER() {
	    return this.getToken(GrammarParser.LOWERCASE_LETTER, 0);
	};

	LOWERCASE_GREEK_LETTER() {
	    return this.getToken(GrammarParser.LOWERCASE_GREEK_LETTER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterVariable(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitVariable(this);
		}
	}


}



class ConstantContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_constant;
    }

	numberSymb() {
	    return this.getTypedRuleContext(NumberSymbContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterConstant(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitConstant(this);
		}
	}


}



class RelationSymbContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_relationSymb;
    }

	UPPERCASE_LETTER() {
	    return this.getToken(GrammarParser.UPPERCASE_LETTER, 0);
	};

	UPPERCASE_GREEK_LETTER() {
	    return this.getToken(GrammarParser.UPPERCASE_GREEK_LETTER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterRelationSymb(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitRelationSymb(this);
		}
	}


}



class SuccessorFuncContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_successorFunc;
    }

	addExpr() {
	    return this.getTypedRuleContext(AddExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterSuccessorFunc(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitSuccessorFunc(this);
		}
	}


}



class ArithmeticFuncContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_arithmeticFunc;
    }

	PLUS() {
	    return this.getToken(GrammarParser.PLUS, 0);
	};

	addExpr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(AddExprContext);
	    } else {
	        return this.getTypedRuleContext(AddExprContext,i);
	    }
	};

	MULT() {
	    return this.getToken(GrammarParser.MULT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterArithmeticFunc(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitArithmeticFunc(this);
		}
	}


}



class NumberSymbContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_numberSymb;
    }

	NUMBER() {
	    return this.getToken(GrammarParser.NUMBER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterNumberSymb(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitNumberSymb(this);
		}
	}


}



class AtomContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_atom;
    }

	TRUE() {
	    return this.getToken(GrammarParser.TRUE, 0);
	};

	FALSE() {
	    return this.getToken(GrammarParser.FALSE, 0);
	};

	basicTerm() {
	    return this.getTypedRuleContext(BasicTermContext,0);
	};

	relationSymb() {
	    return this.getTypedRuleContext(RelationSymbContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitAtom(this);
		}
	}


}




GrammarParser.FormulaContext = FormulaContext; 
GrammarParser.AtomListContext = AtomListContext; 
GrammarParser.ImplicationContext = ImplicationContext; 
GrammarParser.DisjunctionContext = DisjunctionContext; 
GrammarParser.ConjunctionContext = ConjunctionContext; 
GrammarParser.NegationContext = NegationContext; 
GrammarParser.QuantifiedContext = QuantifiedContext; 
GrammarParser.ForallQuantContext = ForallQuantContext; 
GrammarParser.ExistQuantContext = ExistQuantContext; 
GrammarParser.AtomicContext = AtomicContext; 
GrammarParser.EqualityContext = EqualityContext; 
GrammarParser.AddExprContext = AddExprContext; 
GrammarParser.MultExprContext = MultExprContext; 
GrammarParser.BasicTermContext = BasicTermContext; 
GrammarParser.PredicateContext = PredicateContext; 
GrammarParser.TermListContext = TermListContext; 
GrammarParser.TermContext = TermContext; 
GrammarParser.FunctionAppContext = FunctionAppContext; 
GrammarParser.VariableContext = VariableContext; 
GrammarParser.ConstantContext = ConstantContext; 
GrammarParser.RelationSymbContext = RelationSymbContext; 
GrammarParser.SuccessorFuncContext = SuccessorFuncContext; 
GrammarParser.ArithmeticFuncContext = ArithmeticFuncContext; 
GrammarParser.NumberSymbContext = NumberSymbContext; 
GrammarParser.AtomContext = AtomContext; 
