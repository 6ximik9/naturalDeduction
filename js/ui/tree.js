import * as d3 from 'd3';
import {processExpression, side} from "../proofs/gentzen/GentzenProof";
import {checkWithAntlr} from "../core/deductiveEngine";
import {typeProof} from '../index';


function getMaxDepth(node) {
  if (!node.children) return 1;
  return 1 + Math.max(...node.children.map(getMaxDepth));
}

function getMaxWidth(node) {
  let levelWidth = [1];
  let width = 0;

  function countNodesAtDepth(node, depth) {
    if (node.children) {
      levelWidth[depth] = (levelWidth[depth] || 0) + node.children.length;
      node.children.forEach(child => countNodesAtDepth(child, depth + 1));
    }
  }

  countNodesAtDepth(node, 1);
  width = Math.max(...levelWidth);
  return width;
}



export function createTreeD3(treeJ) {
  var svg = d3.select("#sequentTreeSvg");
  if (svg.empty()) {
      svg = d3.select("#button-container svg");
  }
  if (svg.empty()) {
      svg = d3.select("svg");
  }

  // Clear previous content to avoid overlapping trees
  svg.selectAll("*").remove();

  var width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(0,40)");

  var root = d3.hierarchy(transformToD3S(treeJ));
  var depth = getMaxDepth(root);
  var width = getMaxWidth(root);

  var tree = d3.tree().size([height, depth * 100]); // Використовуємо глибину для визначення ширини дерева

  tree(root);


// Лінії
  var link = g.selectAll(".link")
    .data(root.links())
    .enter().append("line")
    .attr("class", "link")
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });

// Вузли
  var node = g.selectAll(".node")
    .data(root.descendants())
    .enter().filter(function(d) {
      // Фільтруємо вузли, ігноруючи ті, які мають ім'я "()"
      return d.data.name !== "()";
    }).append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

// Круги для вузлів
  node.append("circle")
    .attr("r", 20); // Розмір кіл можна налаштовувати

// Текст у кругах
  node.append("text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle") // Центрування тексту
    .text(function (d) {
      return d.data.name;
    });


  // Змінна для зберігання максимального y-координати
  var maxY = 0;
  var maxX = 0;


  // Використовуємо d3.each для обходу по всіх вузлах
  node.each(function(d) {
    // Оновлюємо maxY за необхідності
    maxY = Math.max(maxY, d.y);
    maxX = Math.max(maxX, d.x);
  });


  return [maxX, maxY];


}


function transformToD3S(node) {
  function processNode(node) {
    if (node.type === "constant" || node.type === "variable" || node.type === "number") {
      // Variables use 'name' property, constants and numbers use 'value' property
      const displayName = node.type === "variable" ? node.name : node.value;
      return { name: displayName || node.name || node.value || "?" };
    }

    if (node.type === "atom") {
      return { name: node.value };
    }

    if (node.type === "negation") {
      const operand = node.operand || node.value;
      const negSymbols = "¬".repeat(node.count || 1);
      return {
        name: negSymbols,
        children: [processNode(operand)]
      };
    }

    if (node.type === "quantifier") {
      return {
        name: node.quantifier === "∀" ? "∀" : "∃",
        children: [
          { name: node.variable },
          processNode(node.expression)
        ]
      };
    }

    if (node.type === "forall" || node.type === "exists") {
      const symbol = node.type === "forall" ? "∀" : "∃";
      return {
        name: symbol,
        children: [
          { name: node.variable },
          processNode(node.operand)
        ]
      };
    }

    if (node.type === "predicate") {
      const symbolName = node.symbol ? (node.symbol.name || node.symbol.value) : node.name;
      const terms = node.terms || [];
      return {
        name: symbolName,
        children: terms.map(arg => processNode(arg))
      };
    }

    if (node.type === "relation") {
      const terms = node.value || [];
      return {
        name: node.name,
        children: terms.map(arg => processNode(arg))
      };
    }

    if (node.type === "function") {
      const terms = node.terms || node.value || [];
      return {
        name: node.name,
        children: terms.map(arg => processNode(arg))
      };
    }

    if (node.type === "successor") {
      // Defensive handling of successor term
      const term = node.term || node.operand || node.value;
      if (term) {
        return {
          name: "s",
          children: [processNode(term)]
        };
      } else {
        return { name: "s(?)" }; // Fallback if no term found
      }
    }

    if (node.type === "equality") {
      return {
        name: node.operator,
        children: [
          processNode(node.left),
          processNode(node.right)
        ]
      };
    }

    if (node.type === "addition" || node.type === "multiplication") {
      const symbol = node.type === "addition" ? "+" : "*";
      // Support both operands array and left/right structure
      let children = [];
      if (node.operands && node.operands.length > 0) {
        // Legacy operands array structure
        children = node.operands.map(operand => processNode(operand));
      } else if (node.left && node.right) {
        // New left/right structure from MyGrammarListener
        children = [processNode(node.left), processNode(node.right)];
      }
      return {
        name: symbol,
        children: children
      };
    }

    if (node.type === "parenthesis") {
      return {
        name: "()",
        children: [
          { name: "(" },
          processNode(node.value),
          { name: ")" }
        ]
      };
    }

    if (node.type === "sequent") {
      const children = [];
      // Add premises
      if (Array.isArray(node.premises)) {
          node.premises.forEach(premise => children.push(processNode(premise)));
      } else {
          children.push(processNode(node.premises));
      }
      
      // Add turnstile
      children.push({ name: "⊢" });
      
      // Add conclusion
      if (Array.isArray(node.conclusion)) {
          node.conclusion.forEach(concl => children.push(processNode(concl)));
      } else {
          children.push(processNode(node.conclusion));
      }
      
      return {
        name: "sequent",
        children: children
      };
    }

    // Handle new left/right structure
    if (node.left && node.right) {
      return {
        name: getType(node),
        children: [processParenthesis(node.left), processParenthesis(node.right)]
      };
    }

    // Legacy support for operands structure
    if (node.operands && node.operands.length > 0) {
      return {
        name: getType(node),
        children: node.operands.map(operand => processParenthesis(operand))
      };
    }

    // Fallback for other structures
    const children = [];
    if (node.left) {
      children.push(processParenthesis(node.left));
    }
    if (node.right) {
      children.push(processParenthesis(node.right));
    }

    return {
      name: getType(node),
      children: children
    };
  }

  function processParenthesis(node) {
    if (node.type === "parenthesis") {
      return {
        name: "()",
        children: [
          { name: "(" },
          processNode(node.value),
          { name: ")" }
        ]
      };
    } else {
      return processNode(node);
    }
  }

  return processNode(node);
}

function getType(node) {
  switch (node.type) {
    case "implication": return "⇒";
    case "disjunction": return "∨";
    case "conjunction": return "∧";
    case "equality": return node.operator || "=";
    case "addition": return "+";
    case "multiplication": return "*";
    case "negation": return "¬".repeat(node.count || 1);
    case "forall": return "∀";
    case "exists": return "∃";
    case "successor": return "s";
    case "predicate": return node.symbol ? (node.symbol.name || node.symbol.value) : node.name;
    case "relation": return node.name;
    case "function": return node.name;
    case "sequent": return "⊢";
    default: return node.type;
  }
}
