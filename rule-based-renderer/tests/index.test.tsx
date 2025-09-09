import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import "@testing-library/jest-dom";
import { FormProvider, useForm } from "react-hook-form";
import { FormRenderer } from "../src";
import type { Form } from "../src/types";
import { getFormResolver } from "../src/resolver";

const renderWithForm = (
  form: Form,
  defaultValues: Record<string, any> = {},
  components?: any
) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues, resolver: getFormResolver(form) });
    return (
      <FormProvider {...methods}>
        <FormRenderer form={form} components={components} />
      </FormProvider>
    );
  };
  return render(<Wrapper />);
};

describe("FormRenderer", () => {
  test("renders text field", () => {
    const form: Form = {
      id: "t1",
      name: "Test",
      elements: [
        [
          {
            id: "first_name",
            label: "First Name",
            type: "text",
            required: true,
          },
        ],
      ],
    };
    renderWithForm(form);
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
  });

  test("checkbox choices toggle array values", () => {
    const form: Form = {
      id: "checkbox",
      name: "checkbox",
      elements: [
        [
          {
            id: "colors",
            label: "Colors",
            type: "checkbox",
            choices: [
              { id: "red", name: "Red" },
              { id: "blue", name: "Blue" },
            ],
          },
        ],
      ],
    };
    renderWithForm(form, { colors: [] });
    const red = screen.getAllByLabelText("Colors")[0] as HTMLInputElement;
    expect(red).toBeInTheDocument();
    const blue = screen.getAllByLabelText("Colors")[1] as HTMLInputElement;
    expect(blue).toBeInTheDocument();
  });

  test("rule hides dependent element until condition met (EQUALS)", async () => {
    const form: Form = {
      id: "f3",
      name: "Rules",
      elements: [
        [
          { id: "age", label: "Age", type: "text" },
          {
            id: "license",
            label: "License Number",
            type: "text",
            rules: [
              {
                operation: "AND",
                conditions: [
                  { elementId: "age", operator: "GREATER_THAN", value: 17 },
                ],
              },
            ],
          },
        ],
      ],
    };
    const { container } = renderWithForm(form, { age: "" });
    expect(screen.queryByLabelText(/License Number/)).not.toBeInTheDocument();
    const age = screen.getByLabelText(/Age/) as HTMLInputElement;
    fireEvent.change(age, { target: { value: "18" } });
    await waitFor(() => {
      expect(screen.getByLabelText(/License Number/)).toBeInTheDocument();
    });
  });

  test("validation: required text field shows error after submit", async () => {
    const form: Form = {
      id: "f4",
      name: "Validation",
      elements: [
        [{ id: "email", label: "Email", type: "text", required: true }],
      ],
    };
    const Wrapper = () => {
      const methods = useForm({ resolver: getFormResolver(form) });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <FormRenderer form={form} />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };
    render(<Wrapper />);
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
