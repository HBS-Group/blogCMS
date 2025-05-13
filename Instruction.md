# Project Development Instructions & Guidelines

## 1. Introduction

This document provides essential instructions and guidelines for developing the "HBS CMS Generator" project. Adhering to these guidelines will help maintain code quality, consistency, and collaboration efficiency.

## 2. General Coding Practices

*   **Consistency:**
    *   Follow consistent naming conventions for files, variables, functions, and components (e.g., `camelCase` for variables/functions, `PascalCase` for components and files).
    *   Use consistent code formatting. If a linter/formatter (like ESLint/Prettier) is set up, ensure it's used.
*   **Readability:**
    *   Write clear, self-documenting code. Choose descriptive names for variables, functions, and components.
    *   Add comments to explain complex logic, assumptions, or *why* something is done, not just *what* is done.
*   **Modularity:**
    *   Break down complex features into smaller, reusable functions and components.
    *   Each function/component should have a single responsibility.
*   **DRY (Don't Repeat Yourself):**
    *   Avoid duplicating code. Abstract common logic into reusable functions or components.
*   **KISS (Keep It Simple, Stupid):**
    *   Prefer simple solutions over complex ones, as long as they meet requirements.
*   **Error Handling:**
    *   Implement robust error handling for API calls, data processing, and user inputs.
    *   Provide meaningful error messages to users where appropriate.

## 3. Clean Code Principles

*   **Meaningful Names:** Variable, function, and class names should clearly reveal their intent.
*   **Functions:**
    *   **Do One Thing:** Functions should perform a single, well-defined task.
    *   **Small:** Keep functions short and focused.
    *   **Few Arguments:** Limit the number of arguments a function takes.
    *   **Avoid Side Effects:** Functions should ideally not have hidden side effects (e.g., modifying global state unexpectedly).
*   **Comments:**
    *   Use comments to explain *why* something is done, not *what* the code does (if the code itself is clear).
    *   Avoid commented-out code; use version control instead.
*   **Formatting:**
    *   Consistent indentation, spacing, and line breaks improve readability. Use Prettier or a similar tool if available.
*   **Testing:** Write unit and integration tests for critical parts of the application to ensure reliability and prevent regressions.

## 4. Core Libraries & Technologies

*   **Next.js (App Router):**
    *   **Purpose:** Full-stack React framework. Used for routing, server-side rendering (SSR), static site generation (SSG), API routes, and Server/Client Components.
    *   **Documentation:** [Next.js Docs](https://nextjs.org/docs)
*   **React:**
    *   **Purpose:** JavaScript library for building user interfaces with a component-based architecture.
    *   **Documentation:** [React Docs](https://react.dev/)
*   **Tailwind CSS:**
    *   **Purpose:** A utility-first CSS framework for rapidly building custom user interfaces. Styles are applied directly in the HTML/JSX.
    *   **Documentation:** [Tailwind CSS Docs](https://tailwindcss.com/docs)
    *   **Project Usage:** Refer to `tailwind.config.js` for theme customizations ).
*   **Lucide React:**
    *   **Purpose:** A library of simply beautiful and consistent SVG icons.
    *   **Documentation/Icons:** [Lucide Icons](https://lucide.dev/)
    *   **Usage:** Import icons as components, e.g., `import { Home } from 'lucide-react';`.
*   **(Potentially) Prisma / Database ORM:**
    *   If a database is used, Prisma (or another ORM/query builder) might be involved for database interactions. Check `prisma/schema.prisma` or `lib/db.ts` if applicable.
*   **(Potentially) Authentication Library:**
    *   Libraries like NextAuth.js might be used for handling user authentication.

## 5. Server and Client Components (Next.js App Router)

The Next.js App Router introduces a new paradigm with Server Components and Client Components.

### Server Components:
*   **Default:** Components inside the `app` directory are Server Components by default.
*   **Execution:** Run on the server (at build time or request time). Their code is *not* sent to the client.
*   **Benefits:**
    *   Directly access server-side resources (databases, file system).
    *   Reduce client-side JavaScript bundle size.
    *   Improve initial page load performance.
    *   Good for fetching data and rendering static content.
*   **Limitations:** Cannot use React Hooks like `useState`, `useEffect`, or browser-only APIs. Cannot have event listeners (`onClick`, `onChange`).

**Example (Server Component):**
```typescript:app%2Fsome-page%2Fpage.tsx
// This is a Server Component by default
async function getData() {
  // const res = await fetch('...');
  // return res.json();
  return { message: "Data from server" };
}

export default async function SomePage() {
  const data = await getData();
  return (
    <div>
      <h1>Server Component</h1>
      <p>{data.message}</p>
    </div>
  );
}