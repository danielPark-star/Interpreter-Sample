import { Expression, Statement } from "../include/parser.js";

type RuntimeValue = number | boolean;
const PARENT_STATE_KEY = Symbol("[[PARENT]]");
export type State = { [PARENT_STATE_KEY]?: State; [key: string]: RuntimeValue };

export function interpExpression(state: State, exp: Expression): RuntimeValue {
  // TODO
  switch (exp.kind) {
    case "number":
    case "boolean":
      return exp.value;
    case "variable":
      if (state.hasOwnProperty(exp.name)) {
        return state[exp.name];
      } else if (state[PARENT_STATE_KEY]) {
        return interpExpression(state[PARENT_STATE_KEY], exp);
        // error
      } else {
        throw new Error("Variable not found.");
      }
    case "operator":
      const left = interpExpression(state, exp.left);
      const right = interpExpression(state, exp.right);
      if (typeof left === "number" && typeof right === "number") {
        switch (exp.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          case ">":
            return left > right;
          case "<":
            return left < right;
          case "===":
            return left === right;
          default:
            throw new Error("Invalid Operator");
        }
      } else {
        typeof left === "boolean" && typeof right === "boolean";
      }
      {
        switch (exp.operator) {
          case "&&":
            return left && right;
          case "||":
            return left || right;
          case "===":
            return left === right;
          default:
            throw new Error("Invalid Operator");
        }
      }
    default:
      throw new Error("Type Mismatch");
  }
}

export function interpStatement(state: State, stmt: Statement): void {
  // TODO
  function stmtHelper(state: State, stateArr: Statement[]): void {
    stateArr.forEach(stmt => interpStatement(state, stmt));
  }
  switch (stmt.kind) {
    case "let":
      if (state.hasOwnProperty(stmt.name)) {
        throw new Error("Variable already exists");
      }
      state[stmt.name] = interpExpression(state, stmt.expression);
      break;
    case "assignment":
      let currState = state;
      while (!currState.hasOwnProperty(stmt.name)) {
        if (!currState[PARENT_STATE_KEY]) {
          throw new Error("Variable not found.");
        }
        currState = currState[PARENT_STATE_KEY];
      }
      currState[stmt.name] = interpExpression(state, stmt.expression);
      break;
    case "if":
      const test = interpExpression(state, stmt.test);
      if (typeof test === "boolean") {
        const parent: State = { [PARENT_STATE_KEY]: state };
        stmtHelper(parent, test ? stmt.truePart : stmt.falsePart);
      } else {
        throw new Error("Invalid test expression for if statement.");
      }
      break;
    case "while":
      if (typeof interpExpression(state, stmt.test) === "boolean") {
        while (interpExpression(state, stmt.test)) {
          const parent: State = { [PARENT_STATE_KEY]: state };
          stmtHelper(parent, stmt.body);
        }
      } else {
        throw new Error("Invalid test expression for while statement.");
      }
      break;
    case "print":
      console.log(interpExpression(state, stmt.expression));
      break;
  }
  return;
}

export function interpProgram(program: Statement[]): State {
  // TODO
  const state: State = {};
  program.forEach(stmt => interpStatement(state, stmt));
  return state;
}
