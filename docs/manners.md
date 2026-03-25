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
