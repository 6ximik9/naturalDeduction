import GrammarListener from "./GrammarListener";
import { ParseTreeListener } from "antlr4";

export default class MyGrammarListener extends GrammarListener {

  constructor() {
    super();
    this.stack = [];
  }

  exitParenthesis(ctx) {
    if (ctx.getChildCount() === 3) {
      const expression = this.stack.pop();
      const parenthesis = { type: 'parenthesis', value: expression };
      this.stack.push(parenthesis);
    }
  }

  // exitConst(ctx) {
  //   const con = { type: 'constant', value: ctx.getText() };
  //   this.stack.push(con);
  // }

  exitAtom(ctx) {
    const atom = { type: 'atom', value: ctx.getText() };
    this.stack.push(atom);
  }

  exitNegation(ctx) {
    if (ctx.getChildCount() > 1) {
      let value = this.stack.pop();
      // Заперечення можуть накладатися, тому треба їх об'єднувати
      for (let i = 1; i < ctx.getChildCount(); i++) {
        value = { type: 'negation', value: value };
      }
      this.stack.push(value);
    }
  }

  exitImplication(ctx) {
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
  }

  exitConjunction(ctx) {
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
  }

  exitDisjunction(ctx) {
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
  }
}
