import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import {
  Stack,
  CircularProgress,
  Button,
  Snackbar,
  Typography,
} from "@mui/material";
import { useParams } from "react-router";
import type { Form } from "react-rule-based-renderer/types";
import { ErrorBoundary } from "react-error-boundary";
import { FormRenderer } from "react-rule-based-renderer";
import { components } from "../components/FormRenderer/components";
import { FormProvider, useForm } from "react-hook-form";
import { getFormResolver } from "react-rule-based-renderer/resolver";

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
  const { data: form } = useSuspenseQuery({
    queryKey: ["get-form", id],
    queryFn: () =>
      fetch(`/api/forms/${id}`).then((res) => res.json()) as Promise<{
        form: Form;
      }>,
  });

  const hookForm = useForm({
    resolver: getFormResolver(form.form),
  });

  const handleSubmit = (data: unknown) => {
    setMessage("Form submitted!");
    console.log("form submitted", data);
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

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
        onSubmit={hookForm.handleSubmit(handleSubmit)}
        spacing={form.form.spacing}
      >
        <FormProvider {...hookForm}>
          <FormRenderer form={form.form} components={components} />
        </FormProvider>
        <Button type="submit" variant="contained" fullWidth size="large">
          Submit
        </Button>
      </Stack>
    </Stack>
  );
};
