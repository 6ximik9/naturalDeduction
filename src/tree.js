import * as d3 from 'd3';
import {processExpression, side} from "./GentzenProof";
import {checkWithAntlr} from "./deductiveEngine";
import {typeProof} from './index';


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
  var svg = d3.select("svg"),
    width = +svg.attr("width"),
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
    // Base case: if the node is an atom, return its value
    if (node.type === "atom") {
      return { name: node.value };
    }

    // Special handling for negation
    if (node.type === "negation" && node.value) {
      return {
        name: "¬",
        children: [processNode(node.value)]
      };
    }

    const children = [];

    // Handle the left child if exists, including parenthesis
    if (node.left) {
      children.push(processParenthesis(node.left));
    }

    // Handle the right child if exists, including parenthesis
    if (node.right) {
      children.push(processParenthesis(node.right));
    }

    // Return the node with its processed children
    return {
      name: getType(node.type),
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


function getType(type) {
  if (type === "implication") {
    return `⇒`;
  } else if (type === "disjunction") {
    return `∨`;
  } else if (type === "conjunction") {
    return `∧`;
  }
}
