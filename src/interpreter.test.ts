import { parseExpression, parseProgram } from "../include/parser.js";
import { State, interpExpression, interpProgram, interpStatement } from "./interpreter.js";

function expectStateToBe(program: string, state: State) {
  expect(interpProgram(parseProgram(program))).toEqual(state);
}

describe("interpExpression", () => {
  it("evaluates + with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x + 2"));
    const k = interpExpression({ y: 30 }, parseExpression("y + 70"));

    expect(r).toEqual(12);
    expect(k).toEqual(100);
  });
  it("Eval + with one variable", () => {
    const state = { x: 10 };
    const stmt = parseExpression("x + 10");
    interpExpression(state, stmt);
    expect(state).toEqual({ x: 10 });
  });
  it("evaluates multiplication with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x * 2"));

    expect(r).toEqual(20);
  });

  it("evaluates multiplication with two variable", () => {
    const r = interpExpression({ x: 10, y: 20 }, parseExpression("x * 2 + y / y"));

    expect(r).toEqual(21);
  });

  it("evaluates boolean with variable - true", () => {
    const r = interpExpression({ x: 10, y: 100 }, parseExpression("x > 23 || y === 100"));
    const k = interpExpression({ x: 10 }, parseExpression("x < 4 || x > 0"));
    const q = interpExpression({ x: 10 }, parseExpression("x < 100 && x > 0"));
    const w = interpExpression({ x: 10 }, parseExpression("x < 100"));
    const e = interpExpression({ x: 10 }, parseExpression("x > 1"));

    expect(r).toEqual(true);
    expect(k).toEqual(true);
    expect(q).toEqual(true);
    expect(w).toEqual(true);
    expect(e).toEqual(true);
  });

  it("evaluates boolean with two variable - false", () => {
    const r = interpExpression({ x: 10, y: 100 }, parseExpression("(x < y) && (y === 10)"));

    expect(r).toEqual(false);
  });

  it("throw an error with variable not found / invalid operator", () => {
    expect(() => interpExpression({}, parseExpression("1 && 5"))).toThrow("Invalid Operator");
    expect(() => interpExpression({}, parseExpression("(x < 1) + 5"))).toThrow("Variable not found.");
    expect(() => interpExpression({}, parseExpression("true + 5"))).toThrow("Invalid Operator");
  });
});

describe("interpStatement", () => {
  // Tests for interpStatement go here.
  it("handles let statements", () => {
    const state = {};
    const stmt = parseProgram("let x = 10;")[0];
    interpStatement(state, stmt);
    expect(state).toEqual({ x: 10 });
  });
  it("handles assignment statements", () => {
    const state = { x: 10 };
    const stmt = parseProgram("x = 20;")[0];
    interpStatement(state, stmt);
    expect(state).toEqual({ x: 20 });
  });

  it("handles if statements", () => {
    const state = { x: 5 };
    const stmt = parseProgram("if(x < 10){x = 200;} else{x = 0;} ")[0];
    interpStatement(state, stmt);
    expect(state).toEqual({ x: 200 });
  });

  it("handles while statements", () => {
    const state = { x: 1 };
    const stmt = parseProgram("while (x > 0) {x = x - 1;} ")[0];
    interpStatement(state, stmt);
    expect(state).toEqual({ x: 0 });
  });
});

describe("interpProgram", () => {
  it("handles declarations and reassignment", () => {
    // TIP: Use the grave accent to define multiline strings
    expectStateToBe(
      `      
      let x = 10;
      x = 20;
    `,
      { x: 20 }
    );
  });
});
