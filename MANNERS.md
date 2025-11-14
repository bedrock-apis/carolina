## The Importance of Good Coding Practices

- Install all recommended extensions for your development environment. These extensions assist in identifying linting errors, type issues, and help maintain a consistent code formatting style across the project.
- Strive to write code that is independent of the runtime environment whenever possible. Adhering to ECMAScript (ES) standards ensures greater compatibility and future-proofing.
- Follow established JavaScript naming conventions. Note that decorators should use PascalCase to distinguish them from regular functions.
- Minimize cross-dependent package dependencies to reduce complexity and improve maintainability.
- Avoid using namespaces or static-only classes solely for the purpose of grouping utility functions. Instead, prefer patterns that facilitate tree-shaking and modularity.
- Aim to write code that is independent of other contributors’ implementations. This approach simplifies maintenance, enhances scalability, and encourages practical solutions.
- When implementing classes similar to those in Script APIs, such as `BlockPermutation`, strive for consistency in design and implementation.
- Ensure comprehensive test coverage. If a function can be tested independently, write corresponding tests. Robust testing is essential for code reliability.
- Use code regions for big files
- Prefer `Reflect` over `Object` 

### Performance
- Avoid using Generators unless you don't have all data available or in cases where you might quit the loop before it end.
- Avoid using Iterable Protocol on arrays, use regular indexed for loop.
- Don't redeclare array when clearing, use length assignment to zero.
- Avoid using complex event handlers for hot paths (the event that runs multiple times every tick should avoid unnecessary complex object creations)

## Rationale for Choosing Bun Runtime

Bun has demonstrated superior performance in most benchmarks, as verified by ConMaster2112. While DataViews are slightly slower than V8 implementations, Bun excels in other areas.
- **Deno:** Offers good performance and an exemplary API design, but is relatively heavy and lacks certain hook features required for this project. It can compile to executables out of the box.
- **Bun:** Provides better performance in most scenarios, is lightweight, features a well-designed API, includes numerous features, and supports out-of-the-box compilation.
- **Node:** Delivers reasonable performance but is heavier, has an outdated API design, and requires third-party tools for compilation. It does, however, support hooks.

## Reasons for Preferring PNPM Over NPM

- PNPM offers a cleaner workflow.
- It is faster than NPM.
- PNPM works seamlessly with workspaces.
- It is perceived as more stable compared to Yarn.

## Justification for Using Rolldown

- Rolldown is fast and has been stress-tested.
- It is supported by active developers.
- The plugin ecosystem is extensive.
- The tool is user-friendly.
- It supports direct compilation for TypeScript.

## Selection of TurboRepo

- TurboRepo was observed in the Serenity project and performed well for monorepo management. While personal ConMaster's experience is limited, it appears to be a suitable choice for this purpose.

## Why Oxlint Was Chosen

- Oxlint is easy to use.
- It is extremely fast.
- The configuration is minimal.
- There is no need to create custom rules.

## Advantages of Vitest

- Vitest is well-suited for testing CLI tools and has proven effective in this regard.
