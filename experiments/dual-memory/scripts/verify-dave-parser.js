// Runs Dave Raggett's own parser.js and compiler.js (read only, mounted) on the
// DSL text embedded in his app.js, and prints what they produce. Proof for the
// private study note; nothing here is reused in the harness.
const SRC = Deno.args[0] ?? "dave-demo-src";
const { DAGParser } = await import(`${SRC}/parser.js`);
const { WebGPUCompiler } = await import(`${SRC}/compiler.js`);

const app = await Deno.readTextFile(`${SRC}/app.js`);
const m = app.match(/const defaultModelDSL = `([\s\S]*?)`;/);
if (!m) throw new Error("defaultModelDSL not found in app.js");
const dsl = m[1];
console.log(`DSL lines (real newlines): ${dsl.split("\n").length}`);
console.log(`DSL contains literal backslash-n: ${dsl.includes("\\n")}`);

const astAsServed = DAGParser.parse(dsl);
console.log(`parse(dsl) as served -> ${astAsServed.length} nodes`);

// What the parser would see if its split matched real newlines:
const fixedParse = (text) => {
  const patched = DAGParser.parse(text.replaceAll("\n", "\\n"));
  return patched;
};
const astIfSplitWorked = fixedParse(dsl);
console.log(`parse(dsl) with newlines turned into literal \\n -> ${astIfSplitWorked.length} nodes`);
for (const n of astIfSplitWorked) {
  console.log(`  ${n.isOutput ? "output " : ""}${n.isMutable ? "mutable " : ""}${n.id} = ${n.op}(${n.inputs.join(", ")}) attrs=${JSON.stringify(n.attributes)}`);
}

const compiledAsServed = WebGPUCompiler.compile(astAsServed);
console.log(`\ncompile(as served): plan=${compiledAsServed.executionPlan.length} nodes, wgsl=${compiledAsServed.wgslCode.length} bytes`);
const compiledFull = WebGPUCompiler.compile(astIfSplitWorked);
console.log(`compile(full AST): plan=${compiledFull.executionPlan.length} nodes, wgsl=${compiledFull.wgslCode.length} bytes`);
console.log("\n===== WGSL generated from the full AST =====");
console.log(compiledFull.wgslCode);
console.log("===== identifiers the DSL declares but the WGSL never reads =====");
for (const id of ["A", "B", "W_head", "M_work", "beta", "steps", "decay", "threshold"]) {
  const body = compiledFull.wgslCode.split("fn main")[1] ?? "";
  console.log(`  ${id}: ${body.includes(id) ? "mentioned" : "absent"} in main()`);
}
