import { FormProvider, useForm } from "react-hook-form";
import { FormRenderer } from "./components/FormRenderer/Renderer";
import type { Form } from "./types";
import { getFormResolver } from "./components/FormRenderer/resolver";

const formSchema: Form = {
  id: "form-1",
  name: "Sample form",
  spacing: 2,
  elements: [
    [
      {
        id: "first_name",
        label: "First Name",
        type: "text",
        required: true,
        props: {
          placeholder: "John",
        },
      },
      {
        id: "last_name",
        label: "Last Name",
        type: "text",
        required: true,
        props: {
          placeholder: "Doe",
        },
      },
    ],
    [
      {
        id: "want_job",
        label: "Do you want a job?",
        type: "checkbox",
        choices: [
          {
            id: "yes",
            name: "yes",
          },
        ],
      },
      {
        id: "job_title",
        label: "Job Title",
        type: "text",
        required: true,
        rules: [
          {
            operation: "AND",
            conditions: [
              {
                elementId: "want_job",
                operator: "IN",
                value: "yes",
              },
            ],
          },
        ],
      },
    ],
  ],
};

export default function App() {
  const form = useForm({
    resolver: getFormResolver(formSchema),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <FormRenderer form={formSchema} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
