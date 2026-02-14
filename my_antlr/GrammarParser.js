// Generated from Grammar.g4 by ANTLR 4.13.2
// jshint ignore: start
import antlr4 from 'antlr4';
import GrammarListener from './GrammarListener.js';
const serializedATN = [4,1,32,225,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,1,0,3,0,50,8,0,1,0,1,0,3,0,54,8,0,
1,0,1,0,1,0,1,0,3,0,60,8,0,1,1,1,1,1,1,5,1,65,8,1,10,1,12,1,68,9,1,1,2,1,
2,1,2,3,2,73,8,2,1,3,1,3,1,3,5,3,78,8,3,10,3,12,3,81,9,3,1,4,1,4,1,4,5,4,
86,8,4,10,4,12,4,89,9,4,1,5,4,5,92,8,5,11,5,12,5,93,1,5,1,5,3,5,98,8,5,1,
6,1,6,1,6,3,6,103,8,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,3,7,115,8,
7,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,127,8,8,1,9,1,9,1,9,1,9,1,
9,1,9,1,9,3,9,136,8,9,1,10,1,10,1,10,1,10,1,11,1,11,1,11,5,11,145,8,11,10,
11,12,11,148,9,11,1,12,1,12,1,12,5,12,153,8,12,10,12,12,12,156,9,12,1,13,
1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,3,13,167,8,13,1,14,1,14,1,14,1,14,
1,14,1,14,3,14,175,8,14,1,15,1,15,1,15,5,15,180,8,15,10,15,12,15,183,9,15,
1,16,1,16,1,17,1,17,1,17,1,17,1,17,1,18,1,18,1,19,1,19,1,20,1,20,1,20,1,
20,1,20,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,
1,21,3,21,215,8,21,1,22,1,22,1,23,1,23,1,23,1,23,3,23,223,8,23,1,23,0,0,
24,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,0,
4,1,0,15,20,2,0,28,28,30,30,2,0,27,27,29,29,2,0,6,6,26,26,229,0,59,1,0,0,
0,2,61,1,0,0,0,4,69,1,0,0,0,6,74,1,0,0,0,8,82,1,0,0,0,10,97,1,0,0,0,12,102,
1,0,0,0,14,114,1,0,0,0,16,126,1,0,0,0,18,135,1,0,0,0,20,137,1,0,0,0,22,141,
1,0,0,0,24,149,1,0,0,0,26,166,1,0,0,0,28,174,1,0,0,0,30,176,1,0,0,0,32,184,
1,0,0,0,34,186,1,0,0,0,36,191,1,0,0,0,38,193,1,0,0,0,40,195,1,0,0,0,42,214,
1,0,0,0,44,216,1,0,0,0,46,222,1,0,0,0,48,50,3,2,1,0,49,48,1,0,0,0,49,50,
1,0,0,0,50,51,1,0,0,0,51,53,5,1,0,0,52,54,3,2,1,0,53,52,1,0,0,0,53,54,1,
0,0,0,54,55,1,0,0,0,55,60,5,0,0,1,56,57,3,2,1,0,57,58,5,0,0,1,58,60,1,0,
0,0,59,49,1,0,0,0,59,56,1,0,0,0,60,1,1,0,0,0,61,66,3,4,2,0,62,63,5,2,0,0,
63,65,3,4,2,0,64,62,1,0,0,0,65,68,1,0,0,0,66,64,1,0,0,0,66,67,1,0,0,0,67,
3,1,0,0,0,68,66,1,0,0,0,69,72,3,6,3,0,70,71,5,9,0,0,71,73,3,4,2,0,72,70,
1,0,0,0,72,73,1,0,0,0,73,5,1,0,0,0,74,79,3,8,4,0,75,76,5,10,0,0,76,78,3,
8,4,0,77,75,1,0,0,0,78,81,1,0,0,0,79,77,1,0,0,0,79,80,1,0,0,0,80,7,1,0,0,
0,81,79,1,0,0,0,82,87,3,10,5,0,83,84,5,11,0,0,84,86,3,10,5,0,85,83,1,0,0,
0,86,89,1,0,0,0,87,85,1,0,0,0,87,88,1,0,0,0,88,9,1,0,0,0,89,87,1,0,0,0,90,
92,5,12,0,0,91,90,1,0,0,0,92,93,1,0,0,0,93,91,1,0,0,0,93,94,1,0,0,0,94,95,
1,0,0,0,95,98,3,12,6,0,96,98,3,12,6,0,97,91,1,0,0,0,97,96,1,0,0,0,98,11,
1,0,0,0,99,103,3,14,7,0,100,103,3,16,8,0,101,103,3,18,9,0,102,99,1,0,0,0,
102,100,1,0,0,0,102,101,1,0,0,0,103,13,1,0,0,0,104,105,5,3,0,0,105,106,5,
13,0,0,106,107,3,36,18,0,107,108,5,4,0,0,108,109,3,4,2,0,109,115,1,0,0,0,
110,111,5,13,0,0,111,112,3,36,18,0,112,113,3,4,2,0,113,115,1,0,0,0,114,104,
1,0,0,0,114,110,1,0,0,0,115,15,1,0,0,0,116,117,5,3,0,0,117,118,5,14,0,0,
118,119,3,36,18,0,119,120,5,4,0,0,120,121,3,4,2,0,121,127,1,0,0,0,122,123,
5,14,0,0,123,124,3,36,18,0,124,125,3,4,2,0,125,127,1,0,0,0,126,116,1,0,0,
0,126,122,1,0,0,0,127,17,1,0,0,0,128,129,5,3,0,0,129,130,3,4,2,0,130,131,
5,4,0,0,131,136,1,0,0,0,132,136,3,20,10,0,133,136,3,28,14,0,134,136,3,46,
23,0,135,128,1,0,0,0,135,132,1,0,0,0,135,133,1,0,0,0,135,134,1,0,0,0,136,
19,1,0,0,0,137,138,3,22,11,0,138,139,7,0,0,0,139,140,3,22,11,0,140,21,1,
0,0,0,141,146,3,24,12,0,142,143,5,21,0,0,143,145,3,24,12,0,144,142,1,0,0,
0,145,148,1,0,0,0,146,144,1,0,0,0,146,147,1,0,0,0,147,23,1,0,0,0,148,146,
1,0,0,0,149,154,3,26,13,0,150,151,5,22,0,0,151,153,3,26,13,0,152,150,1,0,
0,0,153,156,1,0,0,0,154,152,1,0,0,0,154,155,1,0,0,0,155,25,1,0,0,0,156,154,
1,0,0,0,157,158,5,3,0,0,158,159,3,22,11,0,159,160,5,4,0,0,160,167,1,0,0,
0,161,167,3,40,20,0,162,167,3,42,21,0,163,167,3,34,17,0,164,167,3,36,18,
0,165,167,3,44,22,0,166,157,1,0,0,0,166,161,1,0,0,0,166,162,1,0,0,0,166,
163,1,0,0,0,166,164,1,0,0,0,166,165,1,0,0,0,167,27,1,0,0,0,168,169,3,38,
19,0,169,170,5,3,0,0,170,171,3,30,15,0,171,172,5,4,0,0,172,175,1,0,0,0,173,
175,3,38,19,0,174,168,1,0,0,0,174,173,1,0,0,0,175,29,1,0,0,0,176,181,3,32,
16,0,177,178,5,2,0,0,178,180,3,32,16,0,179,177,1,0,0,0,180,183,1,0,0,0,181,
179,1,0,0,0,181,182,1,0,0,0,182,31,1,0,0,0,183,181,1,0,0,0,184,185,3,22,
11,0,185,33,1,0,0,0,186,187,5,30,0,0,187,188,5,3,0,0,188,189,3,30,15,0,189,
190,5,4,0,0,190,35,1,0,0,0,191,192,7,1,0,0,192,37,1,0,0,0,193,194,7,2,0,
0,194,39,1,0,0,0,195,196,5,5,0,0,196,197,5,3,0,0,197,198,3,22,11,0,198,199,
5,4,0,0,199,41,1,0,0,0,200,201,5,21,0,0,201,202,5,3,0,0,202,203,3,22,11,
0,203,204,5,2,0,0,204,205,3,22,11,0,205,206,5,4,0,0,206,215,1,0,0,0,207,
208,5,22,0,0,208,209,5,3,0,0,209,210,3,22,11,0,210,211,5,2,0,0,211,212,3,
22,11,0,212,213,5,4,0,0,213,215,1,0,0,0,214,200,1,0,0,0,214,207,1,0,0,0,
215,43,1,0,0,0,216,217,7,3,0,0,217,45,1,0,0,0,218,223,5,7,0,0,219,223,5,
8,0,0,220,223,3,26,13,0,221,223,3,38,19,0,222,218,1,0,0,0,222,219,1,0,0,
0,222,220,1,0,0,0,222,221,1,0,0,0,223,47,1,0,0,0,20,49,53,59,66,72,79,87,
93,97,102,114,126,135,146,154,166,174,181,214,222];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class GrammarParser extends antlr4.Parser {

    static grammarFileName = "Grammar.g4";
    static literalNames = [ null, "'\\u22A2'", "','", "'('", "')'", "'s'", 
                            "'0'", "'\\u22A4'", "'\\u22A5'", null, null, 
                            null, null, null, null, "'<'", "'>'", "'<='", 
                            "'>='", "'='", null, null, null, null, "'pred'", 
                            "'sub'" ];
    static symbolicNames = [ null, null, null, null, null, null, null, "TRUE", 
                             "FALSE", "IMPL", "DIS", "CON", "NEG", "FORALL", 
                             "EXISTS", "LT", "GT", "LE", "GE", "EQUAL", 
                             "NOTEQUAL", "PLUS", "MULT", "EXP", "PRED", 
                             "SUB", "NUMBER", "UPPERCASE_GREEK_LETTER", 
                             "LOWERCASE_GREEK_LETTER", "UPPERCASE_LETTER", 
                             "LOWERCASE_LETTER", "COMMENT", "WS" ];
    static ruleNames = [ "formula", "atomList", "implication", "disjunction", 
                         "conjunction", "negation", "quantified", "forallQuant", 
                         "existQuant", "atomic", "equality", "addExpr", 
                         "multExpr", "basicTerm", "predicate", "termList", 
                         "term", "functionApp", "variable", "relationSymb", 
                         "successorFunc", "arithmeticFunc", "numberSymb", 
                         "atom" ];

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
	    var _la = 0;
	    try {
	        this.state = 59;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,2,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 49;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if((((_la) & ~0x1f) === 0 && ((1 << _la) & 2086695400) !== 0)) {
	                this.state = 48;
	                this.atomList();
	            }

	            this.state = 51;
	            this.match(GrammarParser.T__0);
	            this.state = 53;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if((((_la) & ~0x1f) === 0 && ((1 << _la) & 2086695400) !== 0)) {
	                this.state = 52;
	                this.atomList();
	            }

	            this.state = 55;
	            this.match(GrammarParser.EOF);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 56;
	            this.atomList();
	            this.state = 57;
	            this.match(GrammarParser.EOF);
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



	atomList() {
	    let localctx = new AtomListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, GrammarParser.RULE_atomList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 61;
	        this.implication();
	        this.state = 66;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 62;
	            this.match(GrammarParser.T__1);
	            this.state = 63;
	            this.implication();
	            this.state = 68;
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 69;
	        this.disjunction();
	        this.state = 72;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
	        if(la_===1) {
	            this.state = 70;
	            this.match(GrammarParser.IMPL);
	            this.state = 71;
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 74;
	        this.conjunction();
	        this.state = 79;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,5,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 75;
	                this.match(GrammarParser.DIS);
	                this.state = 76;
	                this.conjunction(); 
	            }
	            this.state = 81;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,5,this._ctx);
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 82;
	        this.negation();
	        this.state = 87;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,6,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 83;
	                this.match(GrammarParser.CON);
	                this.state = 84;
	                this.negation(); 
	            }
	            this.state = 89;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,6,this._ctx);
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
	        this.state = 97;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 12:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 91; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            do {
	                this.state = 90;
	                this.match(GrammarParser.NEG);
	                this.state = 93; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            } while(_la===12);
	            this.state = 95;
	            this.quantified();
	            break;
	        case 3:
	        case 5:
	        case 6:
	        case 7:
	        case 8:
	        case 13:
	        case 14:
	        case 21:
	        case 22:
	        case 26:
	        case 27:
	        case 28:
	        case 29:
	        case 30:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 96;
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
	        this.state = 102;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,9,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 99;
	            this.forallQuant();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 100;
	            this.existQuant();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 101;
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
	        this.state = 114;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 104;
	            this.match(GrammarParser.T__2);
	            this.state = 105;
	            this.match(GrammarParser.FORALL);
	            this.state = 106;
	            this.variable();
	            this.state = 107;
	            this.match(GrammarParser.T__3);
	            this.state = 108;
	            this.implication();
	            break;
	        case 13:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 110;
	            this.match(GrammarParser.FORALL);
	            this.state = 111;
	            this.variable();
	            this.state = 112;
	            this.implication();
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
	        this.state = 126;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 116;
	            this.match(GrammarParser.T__2);
	            this.state = 117;
	            this.match(GrammarParser.EXISTS);
	            this.state = 118;
	            this.variable();
	            this.state = 119;
	            this.match(GrammarParser.T__3);
	            this.state = 120;
	            this.implication();
	            break;
	        case 14:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 122;
	            this.match(GrammarParser.EXISTS);
	            this.state = 123;
	            this.variable();
	            this.state = 124;
	            this.implication();
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
	        this.state = 135;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,12,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 128;
	            this.match(GrammarParser.T__2);
	            this.state = 129;
	            this.implication();
	            this.state = 130;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 132;
	            this.equality();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 133;
	            this.predicate();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 134;
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
	        this.state = 137;
	        this.addExpr();
	        this.state = 138;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) === 0 && ((1 << _la) & 2064384) !== 0))) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 139;
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
	        this.state = 141;
	        this.multExpr();
	        this.state = 146;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===21) {
	            this.state = 142;
	            this.match(GrammarParser.PLUS);
	            this.state = 143;
	            this.multExpr();
	            this.state = 148;
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
	        this.state = 149;
	        this.basicTerm();
	        this.state = 154;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===22) {
	            this.state = 150;
	            this.match(GrammarParser.MULT);
	            this.state = 151;
	            this.basicTerm();
	            this.state = 156;
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
	        this.state = 166;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,15,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 157;
	            this.match(GrammarParser.T__2);
	            this.state = 158;
	            this.addExpr();
	            this.state = 159;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 161;
	            this.successorFunc();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 162;
	            this.arithmeticFunc();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 163;
	            this.functionApp();
	            break;

	        case 5:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 164;
	            this.variable();
	            break;

	        case 6:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 165;
	            this.numberSymb();
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
	        this.state = 174;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,16,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 168;
	            this.relationSymb();
	            this.state = 169;
	            this.match(GrammarParser.T__2);
	            this.state = 170;
	            this.termList();
	            this.state = 171;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 173;
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
	        this.state = 176;
	        this.term();
	        this.state = 181;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 177;
	            this.match(GrammarParser.T__1);
	            this.state = 178;
	            this.term();
	            this.state = 183;
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
	        this.state = 184;
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
	        this.state = 186;
	        this.match(GrammarParser.LOWERCASE_LETTER);
	        this.state = 187;
	        this.match(GrammarParser.T__2);
	        this.state = 188;
	        this.termList();
	        this.state = 189;
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
	        this.state = 191;
	        _la = this._input.LA(1);
	        if(!(_la===28 || _la===30)) {
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



	relationSymb() {
	    let localctx = new RelationSymbContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 38, GrammarParser.RULE_relationSymb);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 193;
	        _la = this._input.LA(1);
	        if(!(_la===27 || _la===29)) {
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
	    this.enterRule(localctx, 40, GrammarParser.RULE_successorFunc);
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
	    this.enterRule(localctx, 42, GrammarParser.RULE_arithmeticFunc);
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
	    this.enterRule(localctx, 44, GrammarParser.RULE_numberSymb);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 216;
	        _la = this._input.LA(1);
	        if(!(_la===6 || _la===26)) {
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
	    this.enterRule(localctx, 46, GrammarParser.RULE_atom);
	    try {
	        this.state = 222;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 7:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 218;
	            this.match(GrammarParser.TRUE);
	            break;
	        case 8:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 219;
	            this.match(GrammarParser.FALSE);
	            break;
	        case 3:
	        case 5:
	        case 6:
	        case 21:
	        case 22:
	        case 26:
	        case 28:
	        case 30:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 220;
	            this.basicTerm();
	            break;
	        case 27:
	        case 29:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 221;
	            this.relationSymb();
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
GrammarParser.IMPL = 9;
GrammarParser.DIS = 10;
GrammarParser.CON = 11;
GrammarParser.NEG = 12;
GrammarParser.FORALL = 13;
GrammarParser.EXISTS = 14;
GrammarParser.LT = 15;
GrammarParser.GT = 16;
GrammarParser.LE = 17;
GrammarParser.GE = 18;
GrammarParser.EQUAL = 19;
GrammarParser.NOTEQUAL = 20;
GrammarParser.PLUS = 21;
GrammarParser.MULT = 22;
GrammarParser.EXP = 23;
GrammarParser.PRED = 24;
GrammarParser.SUB = 25;
GrammarParser.NUMBER = 26;
GrammarParser.UPPERCASE_GREEK_LETTER = 27;
GrammarParser.LOWERCASE_GREEK_LETTER = 28;
GrammarParser.UPPERCASE_LETTER = 29;
GrammarParser.LOWERCASE_LETTER = 30;
GrammarParser.COMMENT = 31;
GrammarParser.WS = 32;

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
GrammarParser.RULE_relationSymb = 19;
GrammarParser.RULE_successorFunc = 20;
GrammarParser.RULE_arithmeticFunc = 21;
GrammarParser.RULE_numberSymb = 22;
GrammarParser.RULE_atom = 23;

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

	EOF() {
	    return this.getToken(GrammarParser.EOF, 0);
	};

	atomList = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(AtomListContext);
	    } else {
	        return this.getTypedRuleContext(AtomListContext,i);
	    }
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

	implication() {
	    return this.getTypedRuleContext(ImplicationContext,0);
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

	implication() {
	    return this.getTypedRuleContext(ImplicationContext,0);
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

	LT() {
	    return this.getToken(GrammarParser.LT, 0);
	};

	GT() {
	    return this.getToken(GrammarParser.GT, 0);
	};

	LE() {
	    return this.getToken(GrammarParser.LE, 0);
	};

	GE() {
	    return this.getToken(GrammarParser.GE, 0);
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

	arithmeticFunc() {
	    return this.getTypedRuleContext(ArithmeticFuncContext,0);
	};

	functionApp() {
	    return this.getTypedRuleContext(FunctionAppContext,0);
	};

	variable() {
	    return this.getTypedRuleContext(VariableContext,0);
	};

	numberSymb() {
	    return this.getTypedRuleContext(NumberSymbContext,0);
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
GrammarParser.RelationSymbContext = RelationSymbContext; 
GrammarParser.SuccessorFuncContext = SuccessorFuncContext; 
GrammarParser.ArithmeticFuncContext = ArithmeticFuncContext; 
GrammarParser.NumberSymbContext = NumberSymbContext; 
GrammarParser.AtomContext = AtomContext; 
