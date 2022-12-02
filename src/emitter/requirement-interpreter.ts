/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { Emitter } from "./emitter";
import { isMetaElementKind, SyntaxKind } from "../tokens";
import {
    Argument,
    ArgumentList,
    ButNotSymbol,
    Constraints,
    Define,
    EmptyAssertion,
    Import,
    LexicalGoalAssertion,
    LexicalSymbol,
    Line,
    LinkReference,
    LookaheadAssertion,
    MultiLineCommentTrivia,
    Node,
    Nonterminal,
    NoSymbolHereAssertion,
    NumberLiteral,
    OneOfList,
    OneOfSymbol,
    Parameter,
    ParameterList,
    Feature,
    Prose,
    ProseAssertion,
    RightHandSide,
    RightHandSideList,
    SingleLineCommentTrivia,
    SourceElement,
    SourceFile,
    StringLiteral,
    SymbolSet,
    SymbolSpan,
    Terminal,
    TerminalLiteral,
    TextContent,
    Trivia,
    UnicodeCharacterLiteral,
    UnicodeCharacterRange,
} from "../nodes";

/** {@docCategory Emit} */
export class RequirementInterpreterEmitter extends Emitter {
    protected override extension = ".interpreter";

    protected override emitSourceFile(node: SourceFile) {
        let lastElement: SourceElement | undefined;
        for (const element of node.elements) {
            if (lastElement) {
                if (!(isMetaElementKind(lastElement.kind) && isMetaElementKind(element.kind)) &&
                    !areContiguousCollapsedFeatures(lastElement, element)) {
                    this.writer.writeBlank();
                }
            }

            this.emitNode(element);
            this.writer.writeln();
            lastElement = element;
        }
        this.writer.writeln();
    }

    protected override emitStringLiteral(node: StringLiteral) {
        this.writer.write(JSON.stringify(node.text ?? ""));
    }

    protected override emitNumberLiteral(node: NumberLiteral) {
        this.emitTextContent(node);
    }

    protected override emitDefine(node: Define) {
        this.emitNode(node.atToken);
        this.emitNode(node.defineKeyword);
        this.writer.write(" ");
        this.emitNode(node.key);
        this.writer.write(" ");
        this.emitNode(node.valueToken);
    }

    protected override emitLine(node: Line) {
        this.emitNode(node.atToken);
        this.emitNode(node.lineKeyword);
        this.writer.write(" ");
        this.emitNode(node.number);
        if (node.path) {
            this.writer.write(" ");
            this.emitNode(node.path);
        }
    }

    protected override emitImport(node: Import) {
        this.emitNode(node.atToken);
        this.emitNode(node.importKeyword);
        this.writer.write(" ");
        this.emitNode(node.path);
    }

    protected override emitFeature(node: Feature) {
        this.emitIdentifier(node.name);
        this.emitNode(node.parameterList);
        this.writer.write(" ");
        this.emitTokenKind(node.colonToken?.kind ?? SyntaxKind.ColonToken);
        switch (node.body?.kind) {
            case SyntaxKind.OneOfList:
            case SyntaxKind.RightHandSide:
                this.writer.write(" ");
                break;
        }
        this.emitNode(node.body);
    }

    protected override emitParameterList(node: ParameterList) {
        this.writer.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }
                this.emitNode(node.elements[i]);
            }
        }
        this.writer.write(`]`);
    }

    protected override emitParameter(node: Parameter) {
        this.emitIdentifier(node.name);
    }

    protected override emitOneOfList(node: OneOfList) {
        this.emitTokenKind(SyntaxKind.OneKeyword);
        this.writer.write(" ");
        this.emitTokenKind(SyntaxKind.OfKeyword);
        if (node.terminals?.length) {
            this.writer.writeln();
            this.writer.indent();

            let maxLength = 1;
            for (const child of node.terminals) {
                const len = child.text?.length ?? 0;
                if (len > maxLength) maxLength = len;
            }

            const columnCount = Math.max(1, Math.floor(56 / (maxLength + 2)));
            const columnSizes = Array<number>(columnCount).fill(0);

            // compute line breaks and column widths by prospectively writing out the
            // terminals
            const savedWriter = this.writer;
            this.writer = savedWriter.clone();

            let columnOffset = 0;
            for (const terminal of node.terminals) {
                let startLine = this.writer.line;
                this.beforeEmitNode(terminal);

                if (this.writer.line !== startLine) {
                    startLine = this.writer.line;
                    columnOffset = 0;
                }

                const len = terminal.text?.length ?? 0;
                columnSizes[columnOffset] = Math.max(columnSizes[columnOffset], len + 2);
                this.emitNodeCore(terminal);
                this.afterEmitNode(terminal);

                if (this.writer.line > startLine || columnOffset + 1 === columnCount) {
                    this.writer.writeln();
                    columnOffset = 0;
                }
                else {
                    columnOffset++;
                }
            }

            this.writer = savedWriter;
            columnOffset = 0;

            let padding = "";
            for (const terminal of node.terminals) {
                let startLine = this.writer.line;
                this.beforeEmitNode(terminal);

                if (this.writer.line !== startLine) {
                    startLine = this.writer.line;
                    columnOffset = 0;
                }
                else {
                    this.writer.write(padding);
                }

                this.emitNodeCore(terminal);
                this.afterEmitNode(terminal);

                if (this.writer.line > startLine || columnOffset + 1 === columnCount) {
                    this.writer.writeln();
                    padding = "";
                    columnOffset = 0;
                }
                else {
                    const columnSize = columnSizes[columnOffset];
                    const len = (terminal.text?.length ?? 0) + 2;
                    padding = " ".repeat((columnSize - len) + 1);
                    columnOffset++;
                }
            }

            this.writer.dedent();
        }
    }

    protected override emitRightHandSideList(node: RightHandSideList) {
        this.writer.indent();
        if (node.elements) {
            for (const rhs of node.elements) {
                this.writer.writeln();
                this.emitNode(rhs);
            }
        }
        this.writer.dedent();
    }

    protected override emitRightHandSide(node: RightHandSide) {
        this.emitChildren(node);
    }

    protected override emitLinkReference(node: LinkReference): void {
        this.writer.write(` #`);
        this.writer.write(node.text);
    }

    protected override emitSymbolSpan(node: SymbolSpan) {
        this.emitNode(node.symbol);
        if (node.next) {
            this.writer.write(" ");
            this.emitNode(node.next);
        }
    }

    protected override emitPlaceholder(node: LexicalSymbol) {
        this.emitTokenKind(SyntaxKind.AtToken);
    }

    protected override emitTerminal(node: Terminal) {
        this.emitNode(node.literal);
        this.emitNode(node.questionToken);
    }

    protected override emitNonterminal(node: Nonterminal) {
        this.emitChildren(node);
    }

    protected override emitArgumentList(node: ArgumentList) {
        this.writer.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }
                this.emitNode(node.elements[i]);
            }
        }
        this.writer.write(`]`);
    }

    protected override emitArgument(node: Argument) {
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
    }

    protected override emitUnicodeCharacterRange(node: UnicodeCharacterRange) {
        this.emitTextContent(node.left);
        this.writer.write(` through `);
        this.emitTextContent(node.right);
    }

    protected override emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.emitTextContent(node);
    }

    protected override emitTerminalLiteral(node: TerminalLiteral) {
        if (node.text === "`") {
            this.writer.write("```");
        }
        else {
            this.writer.write("`");
            this.writer.write(node.text ?? "");
            this.writer.write("`");
        }
    }

    protected override emitProse(node: Prose) {
        this.writer.write("> ");
        node.fragments && this.emitNodes(node.fragments);
    }

    protected override emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write("[empty]");
    }

    protected override emitSymbolSet(node: SymbolSet) {
        this.writer.write(`{`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`,`);
                }
                this.writer.write(` `);
                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(` }`);
    }

    protected override emitLookaheadAssertion(node: LookaheadAssertion) {
        this.writer.write(`[`);
        this.emitToken(node.lookaheadKeyword);
        this.writer.write(" ");
        this.emitTokenKind(node.operatorToken?.kind ?? SyntaxKind.EqualsToken);
        this.writer.write(" ");
        this.emitNode(node.lookahead);
        this.writer.write(`]`);
    }

    protected override emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.writer.write(`[lexical goal `);
        this.emitNode(node.symbol);
        this.writer.write(`]`);
    }

    protected override emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write(`[no `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` or `);
                }

                this.emitNode(node.symbols[i]);
            }
        }

        this.writer.write(` here]`);
    }

    protected override emitConstraints(node: Constraints): void {
        this.writer.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }
        this.writer.write("] ");
    }

    protected override emitProseAssertion(node: ProseAssertion): void {
        this.writer.write(`[> `);
        if (node.fragments) {
            for (const fragment of node.fragments) {
                if (fragment.kind === SyntaxKind.Nonterminal) {
                    this.writer.write(`|`);
                    this.emitNode(fragment);
                    this.writer.write(`|`);
                }
                else {
                    this.emitNode(fragment);
                }
            }
        }

        this.writer.write(`]`);
    }

    protected override emitButNotSymbol(node: ButNotSymbol) {
        this.emitNode(node.left);
        this.writer.write(` but not `);
        this.emitNode(node.right);
    }

    protected override emitOneOfSymbol(node: OneOfSymbol) {
        this.writer.write(`one of `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` or `);
                }

                this.emitNode(node.symbols[i]);
            }
        }
    }

    protected override emitTextContent(node: TextContent) {
        if (node?.text) {
            this.writer.write(node.text);
        }
    }

    protected override beforeEmitTrivia(node: Trivia): void {
        if (node.hasPrecedingBlankLine) {
            this.writer.writeBlank();
        }
        else if (node.hasPrecedingLineTerminator) {
            this.writer.writeln();
        }
        else if (node.hasPrecedingWhiteSpace) {
            this.writer.write(" ");
        }
    }

    protected override afterEmitTrivia(node: Trivia): void {
        if (node.hasFollowingBlankLine) {
            this.writer.writeBlank();
        }
        else if (node.hasFollowingLineTerminator) {
            this.writer.writeln();
        }
        else if (node.hasFollowingWhiteSpace) {
            this.writer.write(" ");
        }
    }

    protected override emitSingleLineCommentTrivia(node: SingleLineCommentTrivia): void {
        this.emitTextRange(node);
        this.writer.writeln();
    }

    protected override emitMultiLineCommentTrivia(node: MultiLineCommentTrivia): void {
        this.emitTextRange(node);
    }
}

function isCollapsedFeature(node: Node): node is Feature & { readonly body: RightHandSide } {
    return node instanceof Feature && node.body instanceof RightHandSide;
}

function areContiguousCollapsedFeatures(left: Node, right: Node) {
    return isCollapsedFeature(left) && isCollapsedFeature(right) && left.name.text === right.name.text;
}