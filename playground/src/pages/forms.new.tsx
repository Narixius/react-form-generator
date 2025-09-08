import { useMutation } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import {
  Stack,
  CircularProgress,
  Button,
  Snackbar,
  TextField,
} from "@mui/material";
import type { Form } from "react-rule-based-renderer/types";
import { ErrorBoundary } from "react-error-boundary";
import { components } from "../components/FormRenderer/components";
import { FormGenerator } from "../components/FormRenderer/Generator";
import { useNavigate } from "react-router";

export const Component = () => {
  return (
    <Stack maxWidth={800} margin="0 auto" padding={2} gap={2}>
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

const FormFetcher = () => {
  const [formName, setFormName] = useState<string>("");
  const [formId, setFormId] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [updatedForm, setUpdatedForm] = useState<Form | null>(null);
  const defaultForm: Form = useMemo(() => {
    return {
      id: "new-form",
      name: "New Form",
      spacing: 2,
      elements: [],
    };
  }, []);
  const navigate = useNavigate();
  const { mutate: createForm, isPending: isCreating } = useMutation({
    mutationFn() {
      return fetch(`/api/forms/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formId,
          name: formName,
          spacing: 2,
          elements: updatedForm?.elements,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to update form");
          }
          return res.json();
        })
        .then(() => {
          console.log(JSON.stringify(updatedForm));
          setMessage("Form created successfully");
          setTimeout(() => {
            navigate("/");
          }, 2000);
        });
    },
  });

  return (
    <Stack
      sx={{
        minWidth: 800,
        maxWidth: 800,
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
      <Stack direction="row" spacing={2} width="100%">
        <TextField
          label="Form Name"
          value={formName}
          fullWidth
          onChange={(e) => setFormName(e.target.value)}
        />
        <TextField
          label="Form ID"
          value={formId}
          fullWidth
          onChange={(e) => setFormId(e.target.value)}
        />
      </Stack>
      <Stack
        component="form"
        spacing={defaultForm.spacing}
        onSubmit={(e) => e.preventDefault()}
      >
        <FormGenerator
          defaultForm={defaultForm}
          components={components}
          onUpdate={(form) => setUpdatedForm(form)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          loading={isCreating}
          onClick={() => createForm()}
        >
          Save from
        </Button>
      </Stack>
    </Stack>
  );
};
