import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import {
  Stack,
  CircularProgress,
  Button,
  Snackbar,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import type { Form } from "react-rule-based-renderer/types";
import { ErrorBoundary } from "react-error-boundary";
import { components } from "../components/FormRenderer/components";
import { FormGenerator } from "../components/FormRenderer/Generator";

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
  const [message, setMessage] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const [updatedForm, setUpdatedForm] = useState<Form | null>(null);
  const { data: form } = useSuspenseQuery({
    queryKey: ["get-form", id],
    queryFn: () =>
      fetch(`/api/forms/${id}`).then((res) => res.json()) as Promise<{
        form: Form;
      }>,
  });

  useEffect(() => {
    setUpdatedForm(form.form);
  }, [form]);
  const navigate = useNavigate();
  const { mutate: updateForm, isPending: isUpdating } = useMutation({
    mutationFn() {
      return fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedForm),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to update form");
          }
          return res.json();
        })
        .then(() => {
          console.log(JSON.stringify(updatedForm));
          setMessage("Form updated successfully");
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
      <Typography variant="h6">{form.form.name}</Typography>
      <Stack
        component="form"
        spacing={form.form.spacing}
        onSubmit={(e) => e.preventDefault()}
      >
        <FormGenerator
          defaultForm={form.form}
          components={components}
          onUpdate={(form) => setUpdatedForm(form)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          loading={isUpdating}
          onClick={() => updateForm()}
        >
          Save from
        </Button>
      </Stack>
    </Stack>
  );
};
