// Generated from Grammar.g4 by ANTLR 4.13.2
// jshint ignore: start
import antlr4 from 'antlr4';
import GrammarListener from './GrammarListener.js';
const serializedATN = [4,1,19,146,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,1,0,1,0,1,0,3,0,32,8,0,1,0,1,0,1,0,1,1,1,1,1,1,5,1,40,8,1,10,1,
12,1,43,9,1,1,2,1,2,1,2,5,2,48,8,2,10,2,12,2,51,9,2,1,3,1,3,1,3,5,3,56,8,
3,10,3,12,3,59,9,3,1,4,1,4,1,4,5,4,64,8,4,10,4,12,4,67,9,4,1,5,4,5,70,8,
5,11,5,12,5,71,1,5,1,5,1,5,4,5,77,8,5,11,5,12,5,78,1,5,1,5,3,5,83,8,5,1,
6,1,6,1,6,1,6,1,6,1,6,1,7,1,7,1,7,1,7,1,7,1,7,3,7,97,8,7,1,8,1,8,1,8,1,8,
1,9,1,9,1,9,3,9,106,8,9,1,10,1,10,1,10,1,10,3,10,112,8,10,1,10,1,10,1,10,
3,10,117,8,10,5,10,119,8,10,10,10,12,10,122,9,10,3,10,124,8,10,1,10,1,10,
1,11,1,11,1,11,1,11,1,11,5,11,133,8,11,10,11,12,11,136,9,11,3,11,138,8,11,
1,11,1,11,1,12,1,12,1,13,1,13,1,13,0,0,14,0,2,4,6,8,10,12,14,16,18,20,22,
24,26,0,2,1,0,14,15,1,0,6,8,151,0,31,1,0,0,0,2,36,1,0,0,0,4,44,1,0,0,0,6,
52,1,0,0,0,8,60,1,0,0,0,10,82,1,0,0,0,12,84,1,0,0,0,14,96,1,0,0,0,16,98,
1,0,0,0,18,105,1,0,0,0,20,107,1,0,0,0,22,127,1,0,0,0,24,141,1,0,0,0,26,143,
1,0,0,0,28,29,3,2,1,0,29,30,5,1,0,0,30,32,1,0,0,0,31,28,1,0,0,0,31,32,1,
0,0,0,32,33,1,0,0,0,33,34,3,4,2,0,34,35,5,0,0,1,35,1,1,0,0,0,36,41,3,4,2,
0,37,38,5,2,0,0,38,40,3,4,2,0,39,37,1,0,0,0,40,43,1,0,0,0,41,39,1,0,0,0,
41,42,1,0,0,0,42,3,1,0,0,0,43,41,1,0,0,0,44,49,3,6,3,0,45,46,5,10,0,0,46,
48,3,6,3,0,47,45,1,0,0,0,48,51,1,0,0,0,49,47,1,0,0,0,49,50,1,0,0,0,50,5,
1,0,0,0,51,49,1,0,0,0,52,57,3,8,4,0,53,54,5,11,0,0,54,56,3,8,4,0,55,53,1,
0,0,0,56,59,1,0,0,0,57,55,1,0,0,0,57,58,1,0,0,0,58,7,1,0,0,0,59,57,1,0,0,
0,60,65,3,10,5,0,61,62,5,12,0,0,62,64,3,10,5,0,63,61,1,0,0,0,64,67,1,0,0,
0,65,63,1,0,0,0,65,66,1,0,0,0,66,9,1,0,0,0,67,65,1,0,0,0,68,70,5,13,0,0,
69,68,1,0,0,0,70,71,1,0,0,0,71,69,1,0,0,0,71,72,1,0,0,0,72,73,1,0,0,0,73,
83,3,12,6,0,74,83,3,12,6,0,75,77,5,13,0,0,76,75,1,0,0,0,77,78,1,0,0,0,78,
76,1,0,0,0,78,79,1,0,0,0,79,80,1,0,0,0,80,83,3,14,7,0,81,83,3,14,7,0,82,
69,1,0,0,0,82,74,1,0,0,0,82,76,1,0,0,0,82,81,1,0,0,0,83,11,1,0,0,0,84,85,
5,3,0,0,85,86,7,0,0,0,86,87,3,24,12,0,87,88,5,4,0,0,88,89,3,14,7,0,89,13,
1,0,0,0,90,91,5,3,0,0,91,92,3,4,2,0,92,93,5,4,0,0,93,97,1,0,0,0,94,97,3,
18,9,0,95,97,3,16,8,0,96,90,1,0,0,0,96,94,1,0,0,0,96,95,1,0,0,0,97,15,1,
0,0,0,98,99,3,18,9,0,99,100,5,5,0,0,100,101,3,18,9,0,101,17,1,0,0,0,102,
106,3,20,10,0,103,106,3,24,12,0,104,106,3,26,13,0,105,102,1,0,0,0,105,103,
1,0,0,0,105,104,1,0,0,0,106,19,1,0,0,0,107,108,5,8,0,0,108,123,5,3,0,0,109,
112,3,18,9,0,110,112,3,22,11,0,111,109,1,0,0,0,111,110,1,0,0,0,112,120,1,
0,0,0,113,116,5,2,0,0,114,117,3,18,9,0,115,117,3,22,11,0,116,114,1,0,0,0,
116,115,1,0,0,0,117,119,1,0,0,0,118,113,1,0,0,0,119,122,1,0,0,0,120,118,
1,0,0,0,120,121,1,0,0,0,121,124,1,0,0,0,122,120,1,0,0,0,123,111,1,0,0,0,
123,124,1,0,0,0,124,125,1,0,0,0,125,126,5,4,0,0,126,21,1,0,0,0,127,128,5,
9,0,0,128,137,5,3,0,0,129,134,3,18,9,0,130,131,5,2,0,0,131,133,3,18,9,0,
132,130,1,0,0,0,133,136,1,0,0,0,134,132,1,0,0,0,134,135,1,0,0,0,135,138,
1,0,0,0,136,134,1,0,0,0,137,129,1,0,0,0,137,138,1,0,0,0,138,139,1,0,0,0,
139,140,5,4,0,0,140,23,1,0,0,0,141,142,5,9,0,0,142,25,1,0,0,0,143,144,7,
1,0,0,144,27,1,0,0,0,16,31,41,49,57,65,71,78,82,96,105,111,116,120,123,134,
137];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class GrammarParser extends antlr4.Parser {

    static grammarFileName = "Grammar.g4";
    static literalNames = [ null, "'\\u22A2'", "','", "'('", "')'", "'='", 
                            "'\\u22A5'", "'\\u22A4'", null, null, null, 
                            null, null, null, "'\\u2200'", "'\\u2203'" ];
    static symbolicNames = [ null, null, null, null, null, null, null, null, 
                             "UPPERCASE_LETTER", "LOWERCASE_LETTER", "IMPL", 
                             "DIS", "CON", "NEG", "FORALL", "EXISTS", "TRUE", 
                             "FALSE", "COMMENT", "WS" ];
    static ruleNames = [ "formula", "atomList", "implication", "disjunction", 
                         "conjunction", "negation", "quantifier", "parenthesis", 
                         "equality", "term", "relationSymb", "functionSymb", 
                         "constantSymb", "atom" ];

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
	        this.state = 31;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,0,this._ctx);
	        if(la_===1) {
	            this.state = 28;
	            this.atomList();
	            this.state = 29;
	            this.match(GrammarParser.T__0);

	        }
	        this.state = 33;
	        this.implication();
	        this.state = 34;
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
	        this.state = 36;
	        this.implication();
	        this.state = 41;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 37;
	            this.match(GrammarParser.T__1);
	            this.state = 38;
	            this.implication();
	            this.state = 43;
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
	        this.state = 44;
	        this.disjunction();
	        this.state = 49;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===10) {
	            this.state = 45;
	            this.match(GrammarParser.IMPL);
	            this.state = 46;
	            this.disjunction();
	            this.state = 51;
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



	disjunction() {
	    let localctx = new DisjunctionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, GrammarParser.RULE_disjunction);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 52;
	        this.conjunction();
	        this.state = 57;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===11) {
	            this.state = 53;
	            this.match(GrammarParser.DIS);
	            this.state = 54;
	            this.conjunction();
	            this.state = 59;
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
	        this.state = 60;
	        this.negation();
	        this.state = 65;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===12) {
	            this.state = 61;
	            this.match(GrammarParser.CON);
	            this.state = 62;
	            this.negation();
	            this.state = 67;
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
	        this.state = 82;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,7,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 69; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            do {
	                this.state = 68;
	                this.match(GrammarParser.NEG);
	                this.state = 71; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            } while(_la===13);
	            this.state = 73;
	            this.quantifier();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 74;
	            this.quantifier();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 76; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            do {
	                this.state = 75;
	                this.match(GrammarParser.NEG);
	                this.state = 78; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            } while(_la===13);
	            this.state = 80;
	            this.parenthesis();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 81;
	            this.parenthesis();
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



	quantifier() {
	    let localctx = new QuantifierContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, GrammarParser.RULE_quantifier);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 84;
	        this.match(GrammarParser.T__2);
	        this.state = 85;
	        _la = this._input.LA(1);
	        if(!(_la===14 || _la===15)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 86;
	        this.constantSymb();
	        this.state = 87;
	        this.match(GrammarParser.T__3);
	        this.state = 88;
	        this.parenthesis();
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



	parenthesis() {
	    let localctx = new ParenthesisContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, GrammarParser.RULE_parenthesis);
	    try {
	        this.state = 96;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,8,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 90;
	            this.match(GrammarParser.T__2);
	            this.state = 91;
	            this.implication();
	            this.state = 92;
	            this.match(GrammarParser.T__3);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 94;
	            this.term();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 95;
	            this.equality();
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
	    this.enterRule(localctx, 16, GrammarParser.RULE_equality);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 98;
	        this.term();
	        this.state = 99;
	        this.match(GrammarParser.T__4);
	        this.state = 100;
	        this.term();
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
	    this.enterRule(localctx, 18, GrammarParser.RULE_term);
	    try {
	        this.state = 105;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,9,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new RelationClauseContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 102;
	            this.relationSymb();
	            break;

	        case 2:
	            localctx = new ConstantClauseContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 103;
	            this.constantSymb();
	            break;

	        case 3:
	            localctx = new VariableClauseContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 104;
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



	relationSymb() {
	    let localctx = new RelationSymbContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, GrammarParser.RULE_relationSymb);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 107;
	        this.match(GrammarParser.UPPERCASE_LETTER);
	        this.state = 108;
	        this.match(GrammarParser.T__2);
	        this.state = 123;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) === 0 && ((1 << _la) & 960) !== 0)) {
	            this.state = 111;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,10,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 109;
	                this.term();
	                break;

	            case 2:
	                this.state = 110;
	                this.functionSymb();
	                break;

	            }
	            this.state = 120;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===2) {
	                this.state = 113;
	                this.match(GrammarParser.T__1);
	                this.state = 116;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,11,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 114;
	                    this.term();
	                    break;

	                case 2:
	                    this.state = 115;
	                    this.functionSymb();
	                    break;

	                }
	                this.state = 122;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	        }

	        this.state = 125;
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



	functionSymb() {
	    let localctx = new FunctionSymbContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, GrammarParser.RULE_functionSymb);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 127;
	        this.match(GrammarParser.LOWERCASE_LETTER);
	        this.state = 128;
	        this.match(GrammarParser.T__2);
	        this.state = 137;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) === 0 && ((1 << _la) & 960) !== 0)) {
	            this.state = 129;
	            this.term();
	            this.state = 134;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===2) {
	                this.state = 130;
	                this.match(GrammarParser.T__1);
	                this.state = 131;
	                this.term();
	                this.state = 136;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	        }

	        this.state = 139;
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



	constantSymb() {
	    let localctx = new ConstantSymbContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, GrammarParser.RULE_constantSymb);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 141;
	        this.match(GrammarParser.LOWERCASE_LETTER);
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
	    this.enterRule(localctx, 26, GrammarParser.RULE_atom);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 143;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) === 0 && ((1 << _la) & 448) !== 0))) {
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


}

GrammarParser.EOF = antlr4.Token.EOF;
GrammarParser.T__0 = 1;
GrammarParser.T__1 = 2;
GrammarParser.T__2 = 3;
GrammarParser.T__3 = 4;
GrammarParser.T__4 = 5;
GrammarParser.T__5 = 6;
GrammarParser.T__6 = 7;
GrammarParser.UPPERCASE_LETTER = 8;
GrammarParser.LOWERCASE_LETTER = 9;
GrammarParser.IMPL = 10;
GrammarParser.DIS = 11;
GrammarParser.CON = 12;
GrammarParser.NEG = 13;
GrammarParser.FORALL = 14;
GrammarParser.EXISTS = 15;
GrammarParser.TRUE = 16;
GrammarParser.FALSE = 17;
GrammarParser.COMMENT = 18;
GrammarParser.WS = 19;

GrammarParser.RULE_formula = 0;
GrammarParser.RULE_atomList = 1;
GrammarParser.RULE_implication = 2;
GrammarParser.RULE_disjunction = 3;
GrammarParser.RULE_conjunction = 4;
GrammarParser.RULE_negation = 5;
GrammarParser.RULE_quantifier = 6;
GrammarParser.RULE_parenthesis = 7;
GrammarParser.RULE_equality = 8;
GrammarParser.RULE_term = 9;
GrammarParser.RULE_relationSymb = 10;
GrammarParser.RULE_functionSymb = 11;
GrammarParser.RULE_constantSymb = 12;
GrammarParser.RULE_atom = 13;

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

	disjunction = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(DisjunctionContext);
	    } else {
	        return this.getTypedRuleContext(DisjunctionContext,i);
	    }
	};

	IMPL = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(GrammarParser.IMPL);
	    } else {
	        return this.getToken(GrammarParser.IMPL, i);
	    }
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

	quantifier() {
	    return this.getTypedRuleContext(QuantifierContext,0);
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


	parenthesis() {
	    return this.getTypedRuleContext(ParenthesisContext,0);
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



class QuantifierContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_quantifier;
    }

	constantSymb() {
	    return this.getTypedRuleContext(ConstantSymbContext,0);
	};

	parenthesis() {
	    return this.getTypedRuleContext(ParenthesisContext,0);
	};

	FORALL() {
	    return this.getToken(GrammarParser.FORALL, 0);
	};

	EXISTS() {
	    return this.getToken(GrammarParser.EXISTS, 0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterQuantifier(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitQuantifier(this);
		}
	}


}



class ParenthesisContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_parenthesis;
    }

	implication() {
	    return this.getTypedRuleContext(ImplicationContext,0);
	};

	term() {
	    return this.getTypedRuleContext(TermContext,0);
	};

	equality() {
	    return this.getTypedRuleContext(EqualityContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterParenthesis(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitParenthesis(this);
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
	        listener.enterEquality(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitEquality(this);
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


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class VariableClauseContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	atom() {
	    return this.getTypedRuleContext(AtomContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterVariableClause(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitVariableClause(this);
		}
	}


}

GrammarParser.VariableClauseContext = VariableClauseContext;

class RelationClauseContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	relationSymb() {
	    return this.getTypedRuleContext(RelationSymbContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterRelationClause(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitRelationClause(this);
		}
	}


}

GrammarParser.RelationClauseContext = RelationClauseContext;

class ConstantClauseContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	constantSymb() {
	    return this.getTypedRuleContext(ConstantSymbContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterConstantClause(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitConstantClause(this);
		}
	}


}

GrammarParser.ConstantClauseContext = ConstantClauseContext;

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

	functionSymb = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(FunctionSymbContext);
	    } else {
	        return this.getTypedRuleContext(FunctionSymbContext,i);
	    }
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



class FunctionSymbContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_functionSymb;
    }

	LOWERCASE_LETTER() {
	    return this.getToken(GrammarParser.LOWERCASE_LETTER, 0);
	};

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
	        listener.enterFunctionSymb(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitFunctionSymb(this);
		}
	}


}



class ConstantSymbContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = GrammarParser.RULE_constantSymb;
    }

	LOWERCASE_LETTER() {
	    return this.getToken(GrammarParser.LOWERCASE_LETTER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.enterConstantSymb(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof GrammarListener ) {
	        listener.exitConstantSymb(this);
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

	UPPERCASE_LETTER() {
	    return this.getToken(GrammarParser.UPPERCASE_LETTER, 0);
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
GrammarParser.QuantifierContext = QuantifierContext; 
GrammarParser.ParenthesisContext = ParenthesisContext; 
GrammarParser.EqualityContext = EqualityContext; 
GrammarParser.TermContext = TermContext; 
GrammarParser.RelationSymbContext = RelationSymbContext; 
GrammarParser.FunctionSymbContext = FunctionSymbContext; 
GrammarParser.ConstantSymbContext = ConstantSymbContext; 
GrammarParser.AtomContext = AtomContext; 
