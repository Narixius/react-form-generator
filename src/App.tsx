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
  id: "job-application-form",
  name: "Job Application Form",
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
        id: "email",
        label: "Email",
        type: "text",
        required: true,
        props: {
          placeholder: "example@email.com",
        },
      },
      {
        id: "phone",
        label: "Phone Number",
        type: "text",
        required: false,
        props: {
          placeholder: "+1 (555) 123-4567",
        },
      },
    ],
    [
      {
        id: "relocate",
        label: "Are you willing to relocate?",
        type: "checkbox",
        choices: [{ id: "yes", name: "Yes" }],
      },
      {
        id: "preferred_city",
        label: "Preferred City",
        type: "text",
        required: true,
        props: { placeholder: "Berlin" },
        rules: [
          {
            operation: "AND",
            conditions: [
              { elementId: "relocate", operator: "IN", value: "yes" },
            ],
          },
        ],
      },
    ],
    [
      {
        id: "job_type",
        label: "Job Type",
        type: "select",
        required: true,
        choices: [
          { id: "ft", name: "Full-time" },
          { id: "pt", name: "Part-time" },
          { id: "contract", name: "Contract" },
          { id: "intern", name: "Internship" },
        ],
      },
      {
        id: "expected_salary",
        label: "Expected Salary (USD)",
        type: "text",
        required: true,
        props: { placeholder: "50000" },
        rules: [
          {
            operation: "AND",
            conditions: [
              {
                elementId: "job_type",
                operator: "NOT_EQUALS",
                value: "intern",
              },
            ],
          },
        ],
      },
    ],
    [
      {
        id: "experience_years",
        label: "Years of Experience",
        type: "text",
        required: true,
        props: { placeholder: "e.g., 3" },
      },
      {
        id: "portfolio_link",
        label: "Portfolio Link",
        type: "text",
        required: true,
        props: { placeholder: "https://yourportfolio.com" },
        rules: [
          {
            operation: "OR",
            conditions: [
              { elementId: "job_type", operator: "EQUALS", value: "des" },
              { elementId: "job_type", operator: "EQUALS", value: "intern" },
            ],
          },
        ],
      },
    ],
    [
      {
        id: "have_reference",
        label: "Do you have professional references?",
        type: "checkbox",
        choices: [{ id: "yes", name: "Yes" }],
      },
      {
        id: "reference_name",
        label: "Reference Name",
        type: "text",
        required: true,
        props: { placeholder: "Jane Smith" },
        rules: [
          {
            operation: "AND",
            conditions: [
              { elementId: "have_reference", operator: "IN", value: "yes" },
            ],
          },
        ],
      },
      {
        id: "reference_contact",
        label: "Reference Contact",
        type: "text",
        required: true,
        props: { placeholder: "jane@email.com" },
        rules: [
          {
            operation: "AND",
            conditions: [
              { elementId: "have_reference", operator: "IN", value: "yes" },
            ],
          },
        ],
      },
    ],
    [
      {
        id: "availability",
        label: "Availability (in weeks)",
        type: "text",
        required: true,
        props: { placeholder: "2" },
      },
      {
        id: "urgent_start",
        label: "Can you start immediately?",
        type: "checkbox",
        choices: [{ id: "yes", name: "Yes" }],
        rules: [
          {
            operation: "AND",
            conditions: [
              {
                elementId: "availability",
                operator: "LESS_THAN",
                value: 2,
              },
            ],
          },
        ],
      },
    ],
    [
      {
        id: "visa_status",
        label: "Visa Status",
        type: "select",
        choices: [
          { id: "citizen", name: "Citizen/PR" },
          { id: "work_permit", name: "Work Permit" },
          { id: "visa_needed", name: "Visa Sponsorship Needed" },
        ],
      },
      {
        id: "visa_explain",
        label: "Explain Visa Needs",
        type: "text",
        required: true,
        props: { placeholder: "Details..." },
        rules: [
          {
            operation: "AND",
            conditions: [
              {
                elementId: "visa_status",
                operator: "EQUALS",
                value: "visa_needed",
              },
            ],
          },
        ],
      },
    ],
    [
      {
        id: "additional_skills",
        label: "List any additional skills",
        type: "text",
        required: false,
        props: { placeholder: "e.g., Python, Photoshop..." },
      },
    ],
  ],
};

export default function App() {
  const form = useForm({
    resolver: getFormResolver(formSchema),
  });
  console.log(form.watch());
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
        label={element.label}
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
