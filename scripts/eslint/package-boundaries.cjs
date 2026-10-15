/* global __dirname */
const path = require("node:path");
const { preProcessFile } = require("typescript");

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
    let importedReferences = [];
    const explicitModule = /\.[mc]ts$/.test(filename) && !/\.d\.[mc]ts$/.test(filename);

    function check(source, node) {
      if (!source || typeof source.value !== "string") {
        context.report({ node, messageId: "dynamic" });
        return;
      }
      const specifier = source.value.replaceAll("\\", "/");
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

    function isCommonJsRequire(identifier) {
      if (identifier.type !== "Identifier" || identifier.name !== "require") return false;
      for (let scope = context.sourceCode.getScope(identifier); scope; scope = scope.upper) {
        const variable = scope.set.get("require");
        if (!variable) continue;
        if (variable.defs.length === 0) return true;
        const hasRuntimeBinding = variable.defs.some((definition) =>
          definition.isVariableDefinition !== false &&
          definition.node.importKind !== "type" &&
          definition.parent?.importKind !== "type" &&
          !definition.node.declare && !definition.parent?.declare);
        if (hasRuntimeBinding) return false;
      }
      return true;
    }

    function checkReference(reference, value, node) {
      check({ value, loc: {
        start: context.sourceCode.getLocFromIndex(reference.pos),
        end: context.sourceCode.getLocFromIndex(reference.end),
      } }, node);
    }

    return {
      Program(node) {
        const references = preProcessFile(context.sourceCode.text, true, false);
        importedReferences = references.importedFiles;
        for (const reference of references.referencedFiles) {
          const fileName = reference.fileName.replaceAll("\\", "/");
          const specifier = path.isAbsolute(fileName) || /^[A-Za-z]:\//.test(fileName) ? fileName : `./${fileName}`;
          checkReference(reference, specifier, node);
        }
        for (const reference of references.typeReferenceDirectives) {
          checkReference(reference, reference.fileName, node);
        }
      },
      ImportDeclaration: (node) => check(node.source, node),
      ExportNamedDeclaration: (node) => { if (node.source) check(node.source, node); },
      ExportAllDeclaration: (node) => check(node.source, node),
      ImportExpression: (node) => check(node.source, node),
      TSModuleDeclaration(node) {
        // Standalone ambient declarations define modules; only augmentations
        // recognized as dependencies by TypeScript should be checked.
        if (node.id.type === "Literal" && (explicitModule || importedReferences.some((reference) => reference.pos === node.id.range[0]))) check(node.id, node);
      },
      TSImportType: (node) => check(node.argument, node),
      TSExternalModuleReference: (node) => check(node.expression, node),
      CallExpression(node) {
        const callee = node.callee;
        const isRequire = isCommonJsRequire(callee);
        const isResolve = callee.type === "MemberExpression" && isCommonJsRequire(callee.object) && (callee.computed ? callee.property.value === "resolve" : callee.property.name === "resolve");
        if (isRequire || isResolve) check(node.arguments[0], node);
      },
    };
  },
};
