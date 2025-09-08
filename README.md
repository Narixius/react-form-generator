# React Form Generator / Rule-Based Renderer

[[Live demo]]([https://](https://rrbr.narixius.workers.dev/))

Opinionated, type-safe, rule-based form rendering system for React. This monorepo contains:

- `rule-based-renderer`: A lightweight renderer that consumes a JSON(Form) definition and renders fields dynamically using React Hook Form and MUI.
- `playground`: A demo app with a form generator UI, rules editor, forms CRUD (Mirage.js), and preview utilities.

## Core Concepts

### Form Shape (`Form`)
```ts
interface Form {
	id: string;
	name: string;
	spacing?: number;
	elements: Element[][];       // 2D layout grid: rows -> columns
}
```

### Element Shape (`Element`)
```ts
type Element<Props = DefaultElementProps> = {
	id: string;
	label: string;
	type: 'text' | 'checkbox' | (string & {}); // extensible literal types
	required?: boolean;
	rules?: Rule[];              // conditional visibility rules
	props?: Props & DefaultElementProps; // component specific props merged with base
	choices?: Choice[];          // for discrete option-based components (checkbox group, etc.)
}
```

### Choices
```ts
interface Choice {
	id: string;
	name: string;
}
```

### Rules System
Rules are evaluated to determine whether an element should render or be affected by logic (e.g. disabling, hiding—extensible via resolver).

```ts
interface Rule {
	operation: 'AND' | 'OR';
	conditions: Condition[];
}

interface Condition {
	elementId: string;  // target element to read value from
	operator: 'EQUALS' | 'NOT_EQUALS' | 'INCLUDES' | 'NOT_INCLUDES' | 'GREATER_THAN' | 'LESS_THAN';
	value: unknown;     // comparison target
}
```

`operation` defines how all conditions inside the rule combine. Multiple rules may be chained (the renderer's `isRulesValid` can be adapted—currently expects all rules to pass to show).

### Default Element Props
```ts
interface DefaultElementProps {
	error?: boolean;
	helperText?: string;
	[key: string]: unknown; // flexible extension for component-specific props
}
```

## Rendering Pipeline
1. Consume a `Form` object.
2. Iterate rows (`elements: Element[][]`).
3. For each element:
	 - Evaluate `rules` (if any) using current form state (React Hook Form).
	 - Resolve component from `components` map by `element.type`.
	 - Fallback to `FallbackRenderer` if no match.
	 - Register via `Controller` (react-hook-form) and inject `fieldProps`.

## Installation (Library Only)
The `rule-based-renderer` package developed as an standalone library.

## Minimal Usage Example
```tsx
import { FormRenderer } from 'react-rule-based-renderer';
import { getFormResolver } from 'react-rule-based-renderer/resolver';
import { FormProvider, useForm } from 'react-hook-form';

const form = {
	id: 'contact-form',
	name: 'Contact Form',
	elements: [[
		{ id: 'first_name', label: 'First Name', type: 'text', required: true },
		{ id: 'subscribe', label: 'Subscribe', type: 'checkbox' }
	]]
};

export function Demo() {
	const form = useForm({
    resolver: getFormResolver(form)
  });

	return (
		<form onSubmit={form.handleSubmit(console.log)}>
      <FormProvider {...methods}>
			  <FormRenderer form={form} components={components} />
		  </FormProvider>
      <button type="submit">Submit</button>
    </form>
	);
}
```

## Extending Component Types
Add a custom type by simply referencing a new string literal in your JSON and supplying a renderer:
```ts

const CurrencyInputComponent = () => <input {...} />

components: {
	...,
	'currency-input': CurrencyInputComponent
}

// element snippet
{ id: 'budget', label: 'Budget', type: 'currency-input', props: { locale: 'en-US' } }
```

## Rules Example
```ts
rules: [
	{
		operation: 'AND',
		conditions: [
			{ elementId: 'has_license', operator: 'INCLUDES', value: 'yes' },
			{ elementId: 'country', operator: 'EQUALS', value: 'US' }
		]
	}
]
```

You can adapt the resolver logic in `rule-based-renderer/src/resolver.ts` to support additional operators or behaviors (hide, disable, compute, etc.).

## Monorepo Structure
```
root/
	package.json
	rule-based-renderer/        # core library
	playground/                 # demo + generator + CRUD + rules editor
```

## Playground Application
Includes:
- Form Generator/Preview UI
- Conditional rules builder
- Mirage.js backed CRUD for persisting forms (`/api/forms` mock endpoints)

### Run the Playground
From repo root (uses workspaces):
```bash
pnpm install
pnpm dev       # runs library build watch + playground vite dev
```
Visit: http://localhost:5173

### Build Everything
```bash
pnpm build
```

### Run Tests (library scope)
```bash
pnpm test
```
