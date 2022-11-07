# Usage

```
Syntax:                   requirement-interpreter [options] [...files]

Examples:                 requirement-interpreter es6.interpreter
                          requirement-interpreter --out es6.md --format markdown es6.interpreter

Options:
 -f, --format FORMAT      The output format.
 -h, --help               Prints this message.
     --noChecks           Does not perform static checking of the interpreter.
     --noEmit             Does not emit output.
     --noEmitOnError      Does not emit output if there are errors.
 -o, --out FILE           Specify the output file.
 -v, --version            Prints the version.
```