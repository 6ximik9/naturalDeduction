import GrammarListener from "./GrammarListener.js";

export default class MyGrammarListener extends GrammarListener {
  constructor() {
    super();
    this.stack = [];
  }

  logExit(ruleName, ctx) {
    // Uncomment for debugging
    // console.log(`Exiting rule <${ruleName}> with content: "${ctx.getText()}"`);
  }

  // Formula handling - supports sequent notation (premises ⊢ conclusion)
  exitFormula(ctx) {
    this.logExit("formula", ctx);
    // Check if this is actually a sequent by looking for the ⊢ symbol
    let hasSequentSymbol = false;
    for (let i = 0; i < ctx.getChildCount(); i++) {
      if (ctx.getChild(i).getText() === '⊢') {
        hasSequentSymbol = true;
        break;
      }
    }

    if (hasSequentSymbol) {
      // Sequent: premises ⊢ conclusion (atomList '⊢' implication EOF)
      const conclusion = this.stack.pop(); // implication
      const premises = this.stack.pop();   // atomList
      const sequent = {
        type: 'sequent',
        premises: premises,
        conclusion: conclusion
      };
      this.stack.push(sequent);
    }
    // If no sequent symbol, the implication is already on the stack
  }

  // Atom list handling for sequent premises
  exitAtomList(ctx) {
    this.logExit("atomList", ctx);
    const premises = [];
    for (let i = ctx.getChildCount() - 1; i >= 0; i -= 2) {
      premises.unshift(this.stack.pop());
    }
    this.stack.push(premises);
  }

  // Implication handling
  exitImplication(ctx) {
    this.logExit("implication", ctx);
    if (ctx.getChildCount() > 1) {
      const operands = [];
      for (let i = ctx.getChildCount() - 1; i >= 0; i -= 2) {
        operands.unshift(this.stack.pop());
      }

      // For binary operations, use left/right structure
      if (operands.length === 2) {
        const implication = {
          type: 'implication',
          left: operands[0],
          right: operands[1]
        };
        this.stack.push(implication);
      } else {
        // For multiple operands, chain them left-associatively
        let result = operands[0];
        for (let i = 1; i < operands.length; i++) {
          result = {
            type: 'implication',
            left: result,
            right: operands[i]
          };
        }
        this.stack.push(result);
      }
    }
    // If only one child, the operand is already on the stack
  }

  // Disjunction handling
  exitDisjunction(ctx) {
    this.logExit("disjunction", ctx);
    if (ctx.getChildCount() > 1) {
      const operands = [];
      for (let i = ctx.getChildCount() - 1; i >= 0; i -= 2) {
        operands.unshift(this.stack.pop());
      }

      // For binary operations, use left/right structure
      if (operands.length === 2) {
        const disjunction = {
          type: 'disjunction',
          left: operands[0],
          right: operands[1]
        };
        this.stack.push(disjunction);
      } else {
        // For multiple operands, chain them left-associatively
        let result = operands[0];
        for (let i = 1; i < operands.length; i++) {
          result = {
            type: 'disjunction',
            left: result,
            right: operands[i]
          };
        }
        this.stack.push(result);
      }
    }
    // If only one child, the operand is already on the stack
  }

  // Conjunction handling
  exitConjunction(ctx) {
    this.logExit("conjunction", ctx);
    if (ctx.getChildCount() > 1) {
      const operands = [];
      for (let i = ctx.getChildCount() - 1; i >= 0; i -= 2) {
        operands.unshift(this.stack.pop());
      }

      // For binary operations, use left/right structure
      if (operands.length === 2) {
        const conjunction = {
          type: 'conjunction',
          left: operands[0],
          right: operands[1]
        };
        this.stack.push(conjunction);
      } else {
        // For multiple operands, chain them left-associatively
        let result = operands[0];
        for (let i = 1; i < operands.length; i++) {
          result = {
            type: 'conjunction',
            left: result,
            right: operands[i]
          };
        }
        this.stack.push(result);
      }
    }
    // If only one child, the operand is already on the stack
  }

  // Negation handling
  exitNegation(ctx) {
    this.logExit("negation", ctx);
    if (ctx.getChildCount() > 1) {
      // Has negation symbols
      const operand = this.stack.pop();
      const text = ctx.getText();
      const negCount = text.match(/^[~¬!]+/);
      const negation = {
        type: 'negation',
        operand: operand,
        count: negCount ? negCount[0].length : 1
      };
      this.stack.push(negation);
    }
    // If only one child (quantified), it's already on the stack
  }

  // Quantified expressions handling
  exitQuantified(ctx) {
    this.logExit("quantified", ctx);
    // The result (forallQuant, existQuant, or atomic) is already on the stack
  }

  // Universal quantifier handling
  exitForallQuant(ctx) {
    this.logExit("forallQuant", ctx);
    const operand = this.stack.pop();  // quantified (last child)
    const variable = this.stack.pop(); // variable (second child)
    const forall = {
      type: 'forall',
      variable: variable.name || variable.value, // Extract variable name
      operand: operand
    };
    this.stack.push(forall);
  }

  // Existential quantifier handling
  exitExistQuant(ctx) {
    this.logExit("existQuant", ctx);
    const operand = this.stack.pop();  // quantified (last child)
    const variable = this.stack.pop(); // variable (second child)
    const exists = {
      type: 'exists',
      variable: variable.name || variable.value, // Extract variable name
      operand: operand
    };
    this.stack.push(exists);
  }

  // Atomic expressions handling
  exitAtomic(ctx) {
    this.logExit("atomic", ctx);
    if (ctx.getChildCount() === 3 && ctx.getChild(0).getText() === '(' && ctx.getChild(2).getText() === ')') {
      // Parenthesized formula - the content is already on the stack
      const expression = this.stack.pop();
      const parenthesis = {
        type: 'parenthesis',
        value: expression
      };
      this.stack.push(parenthesis);
    }
    // For other cases (equality, predicate, atom), the result is already on the stack
  }

  // Equality handling
  exitEquality(ctx) {
    this.logExit("equality", ctx);
    const right = this.stack.pop();
    const operator = ctx.getChild(1).getText();
    const left = this.stack.pop();
    const equality = {
      type: 'equality',
      operator: operator,
      left: left,
      right: right
    };
    this.stack.push(equality);
  }

  // Addition expression handling (renamed from arithmeticExpr)
  exitAddExpr(ctx) {
    this.logExit("addExpr", ctx);
    if (ctx.getChildCount() > 1) {
      const operands = [];
      // For addition: multExpr (PLUS multExpr)*
      // We need to collect all the multExpr operands
      const numOperands = Math.ceil(ctx.getChildCount() / 2);
      for (let i = 0; i < numOperands; i++) {
        operands.unshift(this.stack.pop());
      }

      // For binary operations, use left/right structure
      if (operands.length === 2) {
        const arithmetic = {
          type: 'addition',
          left: operands[0],
          right: operands[1]
        };
        this.stack.push(arithmetic);
      } else {
        // For multiple operands, chain them left-associatively
        let result = operands[0];
        for (let i = 1; i < operands.length; i++) {
          result = {
            type: 'addition',
            left: result,
            right: operands[i]
          };
        }
        this.stack.push(result);
      }
    }
    // If only one child, the operand is already on the stack
  }

  // Multiplication expression handling
  exitMultExpr(ctx) {
    this.logExit("multExpr", ctx);
    if (ctx.getChildCount() > 1) {
      const operands = [];
      for (let i = ctx.getChildCount() - 1; i >= 0; i -= 2) {
        operands.unshift(this.stack.pop());
      }

      // For binary operations, use left/right structure
      if (operands.length === 2) {
        const multiplication = {
          type: 'multiplication',
          left: operands[0],
          right: operands[1]
        };
        this.stack.push(multiplication);
      } else {
        // For multiple operands, chain them left-associatively
        let result = operands[0];
        for (let i = 1; i < operands.length; i++) {
          result = {
            type: 'multiplication',
            left: result,
            right: operands[i]
          };
        }
        this.stack.push(result);
      }
    }
    // If only one child, the operand is already on the stack
  }

  // Basic term handling
  exitBasicTerm(ctx) {
    this.logExit("basicTerm", ctx);
    if (ctx.getChildCount() === 3 && ctx.getChild(0).getText() === '(' && ctx.getChild(2).getText() === ')') {
      // Parenthesized arithmetic - the content is already on the stack
      const expression = this.stack.pop();
      const parenthesis = {
        type: 'parenthesis',
        value: expression
      };
      this.stack.push(parenthesis);
    }
    // For other cases (successorFunc, functionApp, variable, constant, numberSymb), the result is already on the stack
  }

  // Predicate handling
  exitPredicate(ctx) {
    this.logExit("predicate", ctx);
    if (ctx.getChildCount() > 1) {
      // P(t1, t2, ...)
      const terms = this.stack.pop(); // termList
      const predicate = this.stack.pop(); // relationSymb
      const predicateExpr = {
        type: 'predicate',
        symbol: predicate,
        terms: terms
      };
      this.stack.push(predicateExpr);
    }
    // If only one child (relationSymb), it's already on the stack
  }

  // Term list handling
  exitTermList(ctx) {
    this.logExit("termList", ctx);
    const terms = [];
    for (let i = ctx.getChildCount() - 1; i >= 0; i -= 2) {
      terms.unshift(this.stack.pop());
    }
    this.stack.push(terms);
  }

  // Function application handling
  exitFunctionApp(ctx) {
    this.logExit("functionApp", ctx);
    const terms = this.stack.pop(); // termList
    const functionName = ctx.getChild(0).getText();
    const functionApp = {
      type: 'function',
      name: functionName,
      terms: terms
    };
    this.stack.push(functionApp);
  }

  // Successor function handling
  exitSuccessorFunc(ctx) {
    this.logExit("successorFunc", ctx);
    const term = this.stack.pop();
    const successor = {
      type: 'successor',
      term: term
    };
    this.stack.push(successor);
  }

  // Arithmetic function handling: +(t1, t2), *(t1, t2)
  exitArithmeticFunc(ctx) {
    this.logExit("arithmeticFunc", ctx);
    const right = this.stack.pop();
    const left = this.stack.pop();
    const operator = ctx.getChild(0).getText(); // + or *

    const type = operator === '+' ? 'addition' : 'multiplication';

    const arithmetic = {
      type: type,
      left: left,
      right: right
    };
    this.stack.push(arithmetic);
  }

  // Variable handling
  exitVariable(ctx) {
    this.logExit("variable", ctx);
    const variable = {
      type: 'variable',
      name: ctx.getText()
    };
    this.stack.push(variable);
  }

  // Constant handling
  exitConstant(ctx) {
    this.logExit("constant", ctx);
    // The numberSymb is already on the stack, just change its type to 'constant'
    if (this.stack.length > 0) {
      const top = this.stack[this.stack.length - 1];
      if (top.type === 'number') {
        top.type = 'constant';
      }
    }
  }

  // Relation symbol handling
  exitRelationSymb(ctx) {
    this.logExit("relationSymb", ctx);
    const symbol = {
      type: 'relation',
      name: ctx.getText()
    };
    this.stack.push(symbol);
  }

  // Number symbol handling
  exitNumberSymb(ctx) {
    this.logExit("numberSymb", ctx);
    const number = {
      type: 'number',
      value: ctx.getText()
    };
    this.stack.push(number);
  }

  // Atom handling
  exitAtom(ctx) {
    this.logExit("atom", ctx);
    // Only push an atom if it's TRUE or FALSE
    // For relationSymb and basicTerm, the result is already on the stack
    const text = ctx.getText();
    if (text === '⊤' || text === '⊥') {
      const atom = {
        type: 'atom',
        value: text
      };
      this.stack.push(atom);
    }
    // For basicTerm and relationSymb, the result is already on the stack from their respective rules
  }

  // Term handling (just passes through)
  exitTerm(ctx) {
    this.logExit("term", ctx);
    // Term is just an addExpr, so it's already on the stack
  }
}
