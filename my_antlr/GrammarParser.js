// Generated from Grammar.g4 by ANTLR 4.13.2
// jshint ignore: start
import antlr4 from 'antlr4';
import GrammarListener from './GrammarListener.js';
const serializedATN = [4,1,32,230,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,1,0,3,0,52,8,0,1,0,1,0,3,
0,56,8,0,1,0,1,0,1,0,1,0,3,0,62,8,0,1,1,1,1,1,1,5,1,67,8,1,10,1,12,1,70,
9,1,1,2,1,2,1,2,3,2,75,8,2,1,3,1,3,1,3,5,3,80,8,3,10,3,12,3,83,9,3,1,4,1,
4,1,4,5,4,88,8,4,10,4,12,4,91,9,4,1,5,4,5,94,8,5,11,5,12,5,95,1,5,1,5,3,
5,100,8,5,1,6,1,6,1,6,3,6,105,8,6,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,7,1,
7,3,7,117,8,7,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,129,8,8,1,9,1,
9,1,9,1,9,1,9,1,9,1,9,3,9,138,8,9,1,10,1,10,1,10,1,10,1,11,1,11,1,11,5,11,
147,8,11,10,11,12,11,150,9,11,1,12,1,12,1,12,5,12,155,8,12,10,12,12,12,158,
9,12,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,1,13,3,13,170,8,13,1,14,
1,14,1,14,1,14,1,14,1,14,3,14,178,8,14,1,15,1,15,1,15,5,15,183,8,15,10,15,
12,15,186,9,15,1,16,1,16,1,17,1,17,1,17,1,17,1,17,1,18,1,18,1,19,1,19,1,
20,1,20,1,21,1,21,1,21,1,21,1,21,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,
1,22,1,22,1,22,1,22,1,22,1,22,3,22,220,8,22,1,23,1,23,1,24,1,24,1,24,1,24,
3,24,228,8,24,1,24,0,0,25,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,
34,36,38,40,42,44,46,48,0,4,1,0,15,20,1,0,27,30,2,0,27,27,29,29,2,0,6,6,
26,26,234,0,61,1,0,0,0,2,63,1,0,0,0,4,71,1,0,0,0,6,76,1,0,0,0,8,84,1,0,0,
0,10,99,1,0,0,0,12,104,1,0,0,0,14,116,1,0,0,0,16,128,1,0,0,0,18,137,1,0,
0,0,20,139,1,0,0,0,22,143,1,0,0,0,24,151,1,0,0,0,26,169,1,0,0,0,28,177,1,
0,0,0,30,179,1,0,0,0,32,187,1,0,0,0,34,189,1,0,0,0,36,194,1,0,0,0,38,196,
1,0,0,0,40,198,1,0,0,0,42,200,1,0,0,0,44,219,1,0,0,0,46,221,1,0,0,0,48,227,
1,0,0,0,50,52,3,2,1,0,51,50,1,0,0,0,51,52,1,0,0,0,52,53,1,0,0,0,53,55,5,
1,0,0,54,56,3,2,1,0,55,54,1,0,0,0,55,56,1,0,0,0,56,57,1,0,0,0,57,62,5,0,
0,1,58,59,3,2,1,0,59,60,5,0,0,1,60,62,1,0,0,0,61,51,1,0,0,0,61,58,1,0,0,
0,62,1,1,0,0,0,63,68,3,4,2,0,64,65,5,2,0,0,65,67,3,4,2,0,66,64,1,0,0,0,67,
70,1,0,0,0,68,66,1,0,0,0,68,69,1,0,0,0,69,3,1,0,0,0,70,68,1,0,0,0,71,74,
3,6,3,0,72,73,5,9,0,0,73,75,3,4,2,0,74,72,1,0,0,0,74,75,1,0,0,0,75,5,1,0,
0,0,76,81,3,8,4,0,77,78,5,10,0,0,78,80,3,8,4,0,79,77,1,0,0,0,80,83,1,0,0,
0,81,79,1,0,0,0,81,82,1,0,0,0,82,7,1,0,0,0,83,81,1,0,0,0,84,89,3,10,5,0,
85,86,5,11,0,0,86,88,3,10,5,0,87,85,1,0,0,0,88,91,1,0,0,0,89,87,1,0,0,0,
89,90,1,0,0,0,90,9,1,0,0,0,91,89,1,0,0,0,92,94,5,12,0,0,93,92,1,0,0,0,94,
95,1,0,0,0,95,93,1,0,0,0,95,96,1,0,0,0,96,97,1,0,0,0,97,100,3,10,5,0,98,
100,3,12,6,0,99,93,1,0,0,0,99,98,1,0,0,0,100,11,1,0,0,0,101,105,3,14,7,0,
102,105,3,16,8,0,103,105,3,18,9,0,104,101,1,0,0,0,104,102,1,0,0,0,104,103,
1,0,0,0,105,13,1,0,0,0,106,107,5,3,0,0,107,108,5,13,0,0,108,109,3,36,18,
0,109,110,5,4,0,0,110,111,3,10,5,0,111,117,1,0,0,0,112,113,5,13,0,0,113,
114,3,36,18,0,114,115,3,10,5,0,115,117,1,0,0,0,116,106,1,0,0,0,116,112,1,
0,0,0,117,15,1,0,0,0,118,119,5,3,0,0,119,120,5,14,0,0,120,121,3,36,18,0,
121,122,5,4,0,0,122,123,3,10,5,0,123,129,1,0,0,0,124,125,5,14,0,0,125,126,
3,36,18,0,126,127,3,10,5,0,127,129,1,0,0,0,128,118,1,0,0,0,128,124,1,0,0,
0,129,17,1,0,0,0,130,131,5,3,0,0,131,132,3,4,2,0,132,133,5,4,0,0,133,138,
1,0,0,0,134,138,3,20,10,0,135,138,3,28,14,0,136,138,3,48,24,0,137,130,1,
0,0,0,137,134,1,0,0,0,137,135,1,0,0,0,137,136,1,0,0,0,138,19,1,0,0,0,139,
140,3,22,11,0,140,141,7,0,0,0,141,142,3,22,11,0,142,21,1,0,0,0,143,148,3,
24,12,0,144,145,5,21,0,0,145,147,3,24,12,0,146,144,1,0,0,0,147,150,1,0,0,
0,148,146,1,0,0,0,148,149,1,0,0,0,149,23,1,0,0,0,150,148,1,0,0,0,151,156,
3,26,13,0,152,153,5,22,0,0,153,155,3,26,13,0,154,152,1,0,0,0,155,158,1,0,
0,0,156,154,1,0,0,0,156,157,1,0,0,0,157,25,1,0,0,0,158,156,1,0,0,0,159,160,
5,3,0,0,160,161,3,22,11,0,161,162,5,4,0,0,162,170,1,0,0,0,163,170,3,42,21,
0,164,170,3,44,22,0,165,170,3,34,17,0,166,170,3,38,19,0,167,170,3,36,18,
0,168,170,3,46,23,0,169,159,1,0,0,0,169,163,1,0,0,0,169,164,1,0,0,0,169,
165,1,0,0,0,169,166,1,0,0,0,169,167,1,0,0,0,169,168,1,0,0,0,170,27,1,0,0,
0,171,172,3,40,20,0,172,173,5,3,0,0,173,174,3,30,15,0,174,175,5,4,0,0,175,
178,1,0,0,0,176,178,3,40,20,0,177,171,1,0,0,0,177,176,1,0,0,0,178,29,1,0,
0,0,179,184,3,32,16,0,180,181,5,2,0,0,181,183,3,32,16,0,182,180,1,0,0,0,
183,186,1,0,0,0,184,182,1,0,0,0,184,185,1,0,0,0,185,31,1,0,0,0,186,184,1,
0,0,0,187,188,3,22,11,0,188,33,1,0,0,0,189,190,5,30,0,0,190,191,5,3,0,0,
191,192,3,30,15,0,192,193,5,4,0,0,193,35,1,0,0,0,194,195,7,1,0,0,195,37,
1,0,0,0,196,197,7,2,0,0,197,39,1,0,0,0,198,199,7,2,0,0,199,41,1,0,0,0,200,
201,5,5,0,0,201,202,5,3,0,0,202,203,3,22,11,0,203,204,5,4,0,0,204,43,1,0,
0,0,205,206,5,21,0,0,206,207,5,3,0,0,207,208,3,22,11,0,208,209,5,2,0,0,209,
210,3,22,11,0,210,211,5,4,0,0,211,220,1,0,0,0,212,213,5,22,0,0,213,214,5,
3,0,0,214,215,3,22,11,0,215,216,5,2,0,0,216,217,3,22,11,0,217,218,5,4,0,
0,218,220,1,0,0,0,219,205,1,0,0,0,219,212,1,0,0,0,220,45,1,0,0,0,221,222,
7,3,0,0,222,47,1,0,0,0,223,228,5,7,0,0,224,228,5,8,0,0,225,228,3,26,13,0,
226,228,3,40,20,0,227,223,1,0,0,0,227,224,1,0,0,0,227,225,1,0,0,0,227,226,
1,0,0,0,228,49,1,0,0,0,20,51,55,61,68,74,81,89,95,99,104,116,128,137,148,
156,169,177,184,219,227];


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
	    var _la = 0;
	    try {
	        this.state = 61;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,2,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 51;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if((((_la) & ~0x1f) === 0 && ((1 << _la) & 2086695400) !== 0)) {
	                this.state = 50;
	                this.atomList();
	            }

	            this.state = 53;
	            this.match(GrammarParser.T__0);
	            this.state = 55;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if((((_la) & ~0x1f) === 0 && ((1 << _la) & 2086695400) !== 0)) {
	                this.state = 54;
	                this.atomList();
	            }

	            this.state = 57;
	            this.match(GrammarParser.EOF);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 58;
	            this.atomList();
	            this.state = 59;
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
	        this.state = 63;
	        this.implication();
	        this.state = 68;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 64;
	            this.match(GrammarParser.T__1);
	            this.state = 65;
	            this.implication();
	            this.state = 70;
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
	        this.state = 71;
	        this.disjunction();
	        this.state = 74;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 72;
	            this.match(GrammarParser.IMPL);
	            this.state = 73;
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
	        this.state = 76;
	        this.conjunction();
	        this.state = 81;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===10) {
	            this.state = 77;
	            this.match(GrammarParser.DIS);
	            this.state = 78;
	            this.conjunction();
	            this.state = 83;
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
	        this.state = 84;
	        this.negation();
	        this.state = 89;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===11) {
	            this.state = 85;
	            this.match(GrammarParser.CON);
	            this.state = 86;
	            this.negation();
	            this.state = 91;
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
	    try {
	        this.state = 99;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 12:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 93; 
	            this._errHandler.sync(this);
	            var _alt = 1;
	            do {
	            	switch (_alt) {
	            	case 1:
	            		this.state = 92;
	            		this.match(GrammarParser.NEG);
	            		break;
	            	default:
	            		throw new antlr4.error.NoViableAltException(this);
	            	}
	            	this.state = 95; 
	            	this._errHandler.sync(this);
	            	_alt = this._interp.adaptivePredict(this._input,7, this._ctx);
	            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
	            this.state = 97;
	            this.negation();
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
	            this.state = 98;
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
	        this.state = 104;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,9,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 101;
	            this.forallQuant();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 102;
	            this.existQuant();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 103;
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
	        this.state = 116;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 106;
	            this.match(GrammarParser.T__2);
	            this.state = 107;
	            this.match(GrammarParser.FORALL);
	            this.state = 108;
	            this.variable();
	            this.state = 109;
	            this.match(GrammarParser.T__3);
	            this.state = 110;
	            this.negation();
	            break;
	        case 13:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 112;
	            this.match(GrammarParser.FORALL);
	            this.state = 113;
	            this.variable();
	            this.state = 114;
	            this.negation();
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
	        this.state = 128;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 118;
	            this.match(GrammarParser.T__2);
	            this.state = 119;
	            this.match(GrammarParser.EXISTS);
	            this.state = 120;
	            this.variable();
	            this.state = 121;
	            this.match(GrammarParser.T__3);
	            this.state = 122;
	            this.negation();
	            break;
	        case 14:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 124;
	            this.match(GrammarParser.EXISTS);
	            this.state = 125;
	            this.variable();
	            this.state = 126;
	            this.negation();
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
	        this.state = 137;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,12,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 130;
	            this.match(GrammarParser.T__2);
	            this.state = 131;
	            this.implication();
	            this.state = 132;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 134;
	            this.equality();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 135;
	            this.predicate();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 136;
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
	        this.state = 139;
	        this.addExpr();
	        this.state = 140;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) === 0 && ((1 << _la) & 2064384) !== 0))) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 141;
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
	        this.state = 143;
	        this.multExpr();
	        this.state = 148;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===21) {
	            this.state = 144;
	            this.match(GrammarParser.PLUS);
	            this.state = 145;
	            this.multExpr();
	            this.state = 150;
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
	        this.state = 151;
	        this.basicTerm();
	        this.state = 156;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===22) {
	            this.state = 152;
	            this.match(GrammarParser.MULT);
	            this.state = 153;
	            this.basicTerm();
	            this.state = 158;
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
	        this.state = 169;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,15,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 159;
	            this.match(GrammarParser.T__2);
	            this.state = 160;
	            this.addExpr();
	            this.state = 161;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 163;
	            this.successorFunc();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 164;
	            this.arithmeticFunc();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 165;
	            this.functionApp();
	            break;

	        case 5:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 166;
	            this.constant();
	            break;

	        case 6:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 167;
	            this.variable();
	            break;

	        case 7:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 168;
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
	        this.state = 177;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,16,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 171;
	            this.relationSymb();
	            this.state = 172;
	            this.match(GrammarParser.T__2);
	            this.state = 173;
	            this.termList();
	            this.state = 174;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 176;
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
	        this.state = 179;
	        this.term();
	        this.state = 184;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 180;
	            this.match(GrammarParser.T__1);
	            this.state = 181;
	            this.term();
	            this.state = 186;
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
	        this.state = 187;
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
	        this.state = 189;
	        this.match(GrammarParser.LOWERCASE_LETTER);
	        this.state = 190;
	        this.match(GrammarParser.T__2);
	        this.state = 191;
	        this.termList();
	        this.state = 192;
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
	        this.state = 194;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) === 0 && ((1 << _la) & 2013265920) !== 0))) {
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
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 196;
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



	relationSymb() {
	    let localctx = new RelationSymbContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 40, GrammarParser.RULE_relationSymb);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 198;
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
	    this.enterRule(localctx, 42, GrammarParser.RULE_successorFunc);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 200;
	        this.match(GrammarParser.T__4);
	        this.state = 201;
	        this.match(GrammarParser.T__2);
	        this.state = 202;
	        this.addExpr();
	        this.state = 203;
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
	        this.state = 219;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 21:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 205;
	            this.match(GrammarParser.PLUS);
	            this.state = 206;
	            this.match(GrammarParser.T__2);
	            this.state = 207;
	            this.addExpr();
	            this.state = 208;
	            this.match(GrammarParser.T__1);
	            this.state = 209;
	            this.addExpr();
	            this.state = 210;
	            this.match(GrammarParser.T__3);
	            break;
	        case 22:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 212;
	            this.match(GrammarParser.MULT);
	            this.state = 213;
	            this.match(GrammarParser.T__2);
	            this.state = 214;
	            this.addExpr();
	            this.state = 215;
	            this.match(GrammarParser.T__1);
	            this.state = 216;
	            this.addExpr();
	            this.state = 217;
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
	        this.state = 221;
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
	    this.enterRule(localctx, 48, GrammarParser.RULE_atom);
	    try {
	        this.state = 227;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,19,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 223;
	            this.match(GrammarParser.TRUE);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 224;
	            this.match(GrammarParser.FALSE);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 225;
	            this.basicTerm();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 226;
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

	negation() {
	    return this.getTypedRuleContext(NegationContext,0);
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


	quantified() {
	    return this.getTypedRuleContext(QuantifiedContext,0);
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

	negation() {
	    return this.getTypedRuleContext(NegationContext,0);
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

	negation() {
	    return this.getTypedRuleContext(NegationContext,0);
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

	constant() {
	    return this.getTypedRuleContext(ConstantContext,0);
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

	UPPERCASE_LETTER() {
	    return this.getToken(GrammarParser.UPPERCASE_LETTER, 0);
	};

	UPPERCASE_GREEK_LETTER() {
	    return this.getToken(GrammarParser.UPPERCASE_GREEK_LETTER, 0);
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

	UPPERCASE_LETTER() {
	    return this.getToken(GrammarParser.UPPERCASE_LETTER, 0);
	};

	UPPERCASE_GREEK_LETTER() {
	    return this.getToken(GrammarParser.UPPERCASE_GREEK_LETTER, 0);
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
