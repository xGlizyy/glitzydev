export type AngleMode = "deg" | "rad";

type TokenType = "number" | "const" | "func" | "op" | "lparen" | "rparen" | "postfix";
type Token = { type: TokenType; value: string };

const FUNCTIONS = new Set(["sin", "cos", "tan", "log", "ln", "sqrt"]);

// Buttons insert typographic operators (× ÷ −) for a friendlier display;
// the tokenizer normalizes them to their plain arithmetic equivalents.
const OPERATOR_ALIASES: Record<string, string> = { "×": "*", "÷": "/", "−": "-" };

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let j = i + 1;
      while (j < expression.length && /[0-9.]/.test(expression[j])) j++;
      const raw = expression.slice(i, j);
      if ((raw.match(/\./g) ?? []).length > 1) throw new Error("Número inválido");
      tokens.push({ type: "number", value: raw });
      i = j;
      continue;
    }

    if (char === "π") {
      tokens.push({ type: "const", value: "pi" });
      i++;
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let j = i + 1;
      while (j < expression.length && /[a-zA-Z]/.test(expression[j])) j++;
      const word = expression.slice(i, j);
      if (word === "e") {
        tokens.push({ type: "const", value: "e" });
      } else if (FUNCTIONS.has(word)) {
        tokens.push({ type: "func", value: word });
      } else {
        throw new Error(`Función desconocida: ${word}`);
      }
      i = j;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "lparen", value: char });
      i++;
      continue;
    }
    if (char === ")") {
      tokens.push({ type: "rparen", value: char });
      i++;
      continue;
    }
    if (char === "!" || char === "%") {
      tokens.push({ type: "postfix", value: char });
      i++;
      continue;
    }

    const normalized = OPERATOR_ALIASES[char] ?? char;
    if (["+", "-", "*", "/", "^"].includes(normalized)) {
      tokens.push({ type: "op", value: normalized });
      i++;
      continue;
    }

    throw new Error(`Carácter no reconocido: ${char}`);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private angleMode: AngleMode;

  constructor(tokens: Token[], angleMode: AngleMode) {
    this.tokens = tokens;
    this.angleMode = angleMode;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new Error("Expresión incompleta");
    this.pos++;
    return token;
  }

  parse(): number {
    if (this.tokens.length === 0) throw new Error("Expresión vacía");
    const value = this.parseExpression();
    if (this.pos < this.tokens.length) throw new Error("Expresión inválida");
    return value;
  }

  // expression := term (('+' | '-') term)*
  private parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek()?.type === "op" && (this.peek()!.value === "+" || this.peek()!.value === "-")) {
      const op = this.consume().value;
      const rhs = this.parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  // term := power (('*' | '/') power)*
  private parseTerm(): number {
    let value = this.parsePower();
    while (this.peek()?.type === "op" && (this.peek()!.value === "*" || this.peek()!.value === "/")) {
      const op = this.consume().value;
      const rhs = this.parsePower();
      if (op === "/") {
        if (rhs === 0) throw new Error("División entre cero");
        value = value / rhs;
      } else {
        value = value * rhs;
      }
    }
    return value;
  }

  // power := unary ('^' power)?  (right-associative)
  private parsePower(): number {
    const base = this.parseUnary();
    if (this.peek()?.type === "op" && this.peek()!.value === "^") {
      this.consume();
      const exponent = this.parsePower();
      return Math.pow(base, exponent);
    }
    return base;
  }

  // unary := '-' unary | postfix
  private parseUnary(): number {
    if (this.peek()?.type === "op" && this.peek()!.value === "-") {
      this.consume();
      return -this.parseUnary();
    }
    return this.parsePostfix();
  }

  // postfix := primary ('!' | '%')*
  private parsePostfix(): number {
    let value = this.parsePrimary();
    while (this.peek()?.type === "postfix") {
      const op = this.consume().value;
      value = op === "!" ? factorial(value) : value / 100;
    }
    return value;
  }

  // primary := NUMBER | CONST | FUNC '(' expression ')' | '(' expression ')'
  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new Error("Expresión incompleta");

    if (token.type === "number") {
      this.consume();
      return parseFloat(token.value);
    }

    if (token.type === "const") {
      this.consume();
      return token.value === "pi" ? Math.PI : Math.E;
    }

    if (token.type === "func") {
      this.consume();
      if (this.peek()?.type !== "lparen") throw new Error("Falta paréntesis de apertura");
      this.consume();
      const arg = this.parseExpression();
      if (this.peek()?.type !== "rparen") throw new Error("Falta paréntesis de cierre");
      this.consume();
      return applyFunction(token.value, arg, this.angleMode);
    }

    if (token.type === "lparen") {
      this.consume();
      const value = this.parseExpression();
      if (this.peek()?.type !== "rparen") throw new Error("Falta paréntesis de cierre");
      this.consume();
      return value;
    }

    throw new Error("Expresión inválida");
  }
}

function applyFunction(name: string, arg: number, angleMode: AngleMode): number {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  switch (name) {
    case "sin":
      return Math.sin(angleMode === "deg" ? toRadians(arg) : arg);
    case "cos":
      return Math.cos(angleMode === "deg" ? toRadians(arg) : arg);
    case "tan":
      return Math.tan(angleMode === "deg" ? toRadians(arg) : arg);
    case "log":
      if (arg <= 0) throw new Error("El logaritmo requiere un número positivo");
      return Math.log10(arg);
    case "ln":
      if (arg <= 0) throw new Error("El logaritmo requiere un número positivo");
      return Math.log(arg);
    case "sqrt":
      if (arg < 0) throw new Error("La raíz requiere un número no negativo");
      return Math.sqrt(arg);
    default:
      throw new Error(`Función desconocida: ${name}`);
  }
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("El factorial requiere un entero no negativo");
  }
  if (value > 170) throw new Error("Número demasiado grande");
  let result = 1;
  for (let i = 2; i <= value; i++) result *= i;
  return result;
}

export function evaluateExpression(expression: string, angleMode: AngleMode): number {
  const tokens = tokenize(expression);
  const result = new Parser(tokens, angleMode).parse();
  if (!Number.isFinite(result)) throw new Error("Resultado no válido");
  return result;
}

export function formatResult(value: number): string {
  if (Object.is(value, -0)) return "0";
  const rounded = Number(value.toPrecision(12));
  return rounded.toString();
}
