/* global __dirname */
const path = require("node:path");

const packagesRoot = path.resolve(__dirname, "../../packages");
const allowedDependencies = {
  "ui-tokens": new Set(),
  "ui-native": new Set(["react", "react-native", "@honeydrunk/ui-tokens"]),
};

// Keep this explicit: adding an app dependency to package.json must not authorize it.
module.exports = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      boundary: "{{packageName}} may import only its own source{{dependencies}}. Keep application navigation, authentication and product domains in consumers.",
      dynamic: "Use a literal module specifier so package boundaries can be checked.",
    },
  },
  create(context) {
    const filename = context.filename;
    const packageName = path.relative(packagesRoot, filename).split(path.sep)[0];
    const dependencies = allowedDependencies[packageName];
    if (!dependencies) return {};
    const sourceRoot = path.join(packagesRoot, packageName, "src");

    function check(source, node) {
      if (!source || typeof source.value !== "string") {
        context.report({ node, messageId: "dynamic" });
        return;
      }
      const specifier = source.value;
      if (dependencies.has(specifier)) return;
      if (specifier === "." || specifier === ".." || specifier.startsWith("./") || specifier.startsWith("../")) {
        const relative = path.relative(sourceRoot, path.resolve(path.dirname(filename), specifier));
        if (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)) return;
      }
      context.report({
        node: source,
        messageId: "boundary",
        data: {
          packageName,
          dependencies: dependencies.size ? ` or ${[...dependencies].join(", ")}` : " (platform-neutral, with no external dependencies)",
        },
      });
    }

    return {
      ImportDeclaration: (node) => check(node.source, node),
      ExportNamedDeclaration: (node) => { if (node.source) check(node.source, node); },
      ExportAllDeclaration: (node) => check(node.source, node),
      ImportExpression: (node) => check(node.source, node),
      TSImportType: (node) => check(node.argument, node),
      TSExternalModuleReference: (node) => check(node.expression, node),
      CallExpression(node) {
        const callee = node.callee;
        const isRequire = callee.type === "Identifier" && callee.name === "require";
        const isResolve = callee.type === "MemberExpression" && callee.object.type === "Identifier" && callee.object.name === "require" && (callee.computed ? callee.property.value === "resolve" : callee.property.name === "resolve");
        if (isRequire || isResolve) check(node.arguments[0], node);
      },
    };
  },
};
