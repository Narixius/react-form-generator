import { Suspense, useState } from "react";
import {
  Stack,
  CircularProgress,
  Snackbar,
  Grid,
  Typography,
} from "@mui/material";
import type { Form } from "react-rule-based-renderer/types";
import { ErrorBoundary } from "react-error-boundary";
import { components } from "../components/FormRenderer/components";
import { FormRenderer } from "react-rule-based-renderer";
import { FormProvider, useForm } from "react-hook-form";

export const Component = () => {
  return (
    <Stack maxWidth={1260} margin="0 auto" padding={2} gap={2}>
      <ErrorBoundary
        fallback={<div>Something went wrong loading the forms list.</div>}
      >
        <Suspense
          fallback={
            <Stack width="100%" alignItems="center" padding={2}>
              <CircularProgress />
            </Stack>
          }
        >
          <FormFetcher />
        </Suspense>
      </ErrorBoundary>
    </Stack>
  );
};

const defaultForm: Form = {
  id: "job-application",
  name: "Job Application",
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
        required: true,
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
              { elementId: "relocate", operator: "INCLUDES", value: "yes" },
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
              {
                elementId: "have_reference",
                operator: "INCLUDES",
                value: "yes",
              },
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
              {
                elementId: "have_reference",
                operator: "INCLUDES",
                value: "yes",
              },
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
const FormFetcher = () => {
  const [message, setMessage] = useState<string | null>(null);

  const [updatedForm, setUpdatedForm] = useState<string>(
    JSON.stringify(defaultForm, null, 2)
  );
  const dummyForm = useForm();
  return (
    <Stack
      sx={{
        margin: "0 auto",
      }}
      gap={"20px"}
      direction="column"
    >
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
        message={message}
      />
      <Grid
        container
        rowSpacing={2}
        spacing={defaultForm.spacing}
        direction="row"
      >
        <Grid size={6}>
          <Typography variant="body1" marginBottom="12px">
            JSON
          </Typography>
          <pre
            key="code"
            contentEditable
            style={{
              minHeight: 200,
              border: "1px solid #ccc",
              padding: 8,
              fontFamily: "monospace",
              background: "#f9f9f9",
              whiteSpace: "pre-wrap",
              outline: "none",
              maxHeight: "calc(100vh - 100px)",
              overflow: "auto",
              marginTop: 0,
            }}
            suppressContentEditableWarning
            onInput={(e) => {
              const text = (e.currentTarget.textContent ?? "").trim();
              setUpdatedForm(text);
            }}
          >
            {JSON.stringify(defaultForm, null, 2)}
          </pre>
        </Grid>
        <Grid size={6}>
          <Typography variant="body1" marginBottom="12px">
            Preview
          </Typography>
          <ErrorBoundary
            fallback={"Form structure is not valid"}
            key={updatedForm}
          >
            <FormProvider {...dummyForm}>
              <Renderer form={updatedForm} />
            </FormProvider>
          </ErrorBoundary>
        </Grid>
      </Grid>
    </Stack>
  );
};

const Renderer = ({ form }: { form: string }) => {
  let parsedForm: Form = defaultForm;
  try {
    parsedForm = JSON.parse(form) as Form;
  } catch {
    //
  }
  return <FormRenderer form={parsedForm} components={components} />;
};
