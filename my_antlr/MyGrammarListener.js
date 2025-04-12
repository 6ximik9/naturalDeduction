import GrammarListener from "./GrammarListener";

export default class MyGrammarListener extends GrammarListener {
  constructor() {
    super();
    this.stack = [];
  }

  exitParenthesis(ctx) {
    try {
      if (ctx.getChildCount() === 3) {
        const expression = this.stack.pop();
        const parenthesis = { type: 'parenthesis', value: expression };
        this.stack.push(parenthesis);
      }
    } catch (error) {
      console.error("Error in exitParenthesis:", error);
    }
  }

  exitNegation(ctx) {
    try {
      if (ctx.getChildCount() > 1) {
        let value = this.stack.pop();
        for (let i = 1; i < ctx.getChildCount(); i++) {
          value = { type: 'negation', value: value };
        }
        this.stack.push(value);
      }
    } catch (error) {
      console.error("Error in exitNegation:", error);
    }
  }

  exitImplication(ctx) {
    try {
      if (ctx.getChildCount() > 1) {
        let implication = [];
        for (let i = 0; i < ctx.getChildCount() / 2; i++) {
          implication.unshift(this.stack.pop());
        }
        while (implication.length > 1) {
          let right = implication.pop();
          let left = implication.pop();
          let conjunction = { type: 'implication', left: left, right: right };
          implication.push(conjunction);
        }
        this.stack.push(implication[0]);
      }
    } catch (error) {
      console.error("Error in exitImplication:", error);
    }
  }

  exitConjunction(ctx) {
    try {
      if (ctx.getChildCount() > 1) {
        let conjuncts = [];
        for (let i = 0; i < ctx.getChildCount() / 2; i++) {
          conjuncts.unshift(this.stack.pop());
        }
        while (conjuncts.length > 1) {
          let right = conjuncts.pop();
          let left = conjuncts.pop();
          let conjunction = { type: 'conjunction', left: left, right: right };
          conjuncts.push(conjunction);
        }
        this.stack.push(conjuncts[0]);
      }
    } catch (error) {
      console.error("Error in exitConjunction:", error);
    }
  }

  exitDisjunction(ctx) {
    try {
      if (ctx.getChildCount() > 1) {
        let disjunction = [];
        for (let i = 0; i < ctx.getChildCount() / 2; i++) {
          disjunction.unshift(this.stack.pop());
        }
        while (disjunction.length > 1) {
          let right = disjunction.pop();
          let left = disjunction.pop();
          let conjunction = { type: 'disjunction', left: left, right: right };
          disjunction.push(conjunction);
        }
        this.stack.push(disjunction[0]);
      }
    } catch (error) {
      console.error("Error in exitDisjunction:", error);
    }
  }

  exitQuantifier(ctx) {
    try {
      if (ctx.getChildCount() === 5) {
        const quantifierType = ctx.getChild(1).getText(); // ∀ або ∃
        const variable = ctx.getChild(2).getText(); // змінна (наприклад, x)
        const expression = this.stack.pop(); // вираз, до якого застосовується квантифікатор

        const quantifier = {
          type: 'quantifier',
          quantifier: quantifierType,
          variable: variable,
          expression: expression
        };

        this.stack.push(quantifier);
      }
    } catch (error) {
      console.error("Error in exitQuantifier:", error);
    }
  }

  exitEquality(ctx) {
    try {
      if (ctx.getChildCount() === 3) {
        const right = this.stack.pop();
        const left = this.stack.pop();
        const equality = { type: 'equality', left: left, right: right };
        this.stack.push(equality);
      }
    } catch (error) {
      console.error("Error in exitEquality:", error);
    }
  }

  exitRelationClause(ctx) {
    try {
      const relationText = ctx.getText();
      const match = relationText.match(/^(\w+)\((.*)\)$/);
      if (match) {
        const argumentsText = match[2];
        const argumentCount = argumentsText.split(',').length;
        const argumentsArray = [];

        for (let i = 0; i < argumentCount; i++) {
          argumentsArray.unshift(this.stack.pop());
        }

        const relation = {
          type: 'relation',
          name: match[1],
          arguments: argumentsArray
        };
        this.stack.push(relation);
      } else {
        throw new Error("Invalid relation format");
      }
    } catch (error) {
      console.error("Error in exitRelationClause:", error);
    }
  }


  exitConstantClause(ctx) {
    try {
      const constant = { type: 'constant', value: ctx.getText() };
      this.stack.push(constant);
    } catch (error) {
      console.error("Error in exitConstantClause:", error);
    }
  }

  exitVariableClause(ctx) {
    try {
      const variable = { type: 'variable', value: ctx.getText() };
      this.stack.push(variable);
    } catch (error) {
      console.error("Error in exitVariableClause:", error);
    }
  }

  exitFunctionSymb(ctx) {
    try {
      const relationText = ctx.getText();
      const match = relationText.match(/^(\w+)\((.*)\)$/);
      if (match) {
        const argumentsText = match[2];
        const argumentCount = argumentsText.split(',').length;
        const argumentsArray = [];

        for (let i = 0; i < argumentCount; i++) {
          argumentsArray.unshift(this.stack.pop());
        }

        const relation = {
          type: 'function',
          name: match[1],
          arguments: argumentsArray
        };
        this.stack.push(relation);
      } else {
        throw new Error("Invalid function format");
      }
    } catch (error) {
      console.error("Error in exitFunctionClause:", error);
    }
  }

}
