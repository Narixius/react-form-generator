import { FormProvider, useForm } from "react-hook-form";
import {
  FormRenderer,
  type FormElementProps,
} from "./components/FormRenderer/Renderer";
import type { Form } from "./types";
import { getFormResolver } from "./components/FormRenderer/resolver";
import type { FC } from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

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
        type: "select",
        required: true,
        choices: [
          {
            id: "dev",
            name: "Developer",
          },
          {
            id: "des",
            name: "Designer",
          },
        ],
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
        <FormRenderer
          form={formSchema}
          components={{
            select: SelectComponent,
          }}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

const SelectComponent: FC<FormElementProps> = ({
  element,
  error,
  helperText,
  ...props
}) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="demo-simple-select-label">{element.label}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        label="Age"
        {...props}
      >
        {element.choices?.map((choice) => (
          <MenuItem value={choice.id} key={choice.id}>
            {choice.name}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};
