import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import {
  Button,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RemoveRedEye as PreviewIcon,
} from "@mui/icons-material";
import { Link } from "react-router";
import type { Form } from "react-rule-based-renderer/types";
import { queryClient } from "../queryClient";

export const Component = () => {
  return (
    <Stack maxWidth={800} margin="0 auto" padding={2} gap={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6">Forms list</Typography>
        <Stack direction="row" spacing={2}>
          <Link to="/forms/raw">
            <Button variant="outlined">Raw editor</Button>
          </Link>
          <Link to="/forms/new">
            <Button variant="contained">New form</Button>
          </Link>
        </Stack>
      </Stack>
      <Suspense
        fallback={
          <Stack width="100%" alignItems="center" padding={2}>
            <CircularProgress />
          </Stack>
        }
      >
        <FormsTable />
      </Suspense>
    </Stack>
  );
};

const FormsTable = () => {
  const [message, setMessage] = useState<string | null>(null);
  const { data: list, refetch } = useSuspenseQuery({
    queryKey: ["get-forms"],
    queryFn: () =>
      fetch(`/api/forms`).then((res) => res.json()) as Promise<{
        forms: Form[];
      }>,
  });
  const {
    mutate: handleDeleteForm,
    isPending: isDeleting,
    variables,
  } = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/forms/${id}`, {
        method: "DELETE",
      }),
    onSuccess() {
      // remove the deleted form from the cache to speed up UI updates before refetching the data again
      queryClient.setQueryData(["get-forms"], (data: { forms: Form[] }) => {
        if (!data) return data;
        return {
          forms: data.forms.filter((form) => form.id !== variables),
        };
      });
      refetch();
      setMessage("Table deleted successfully");
      setTimeout(() => setMessage(null), 4000);
    },
  });

  return (
    <TableContainer component={Paper}>
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
        message={message}
      />
      <Table sx={{ minWidth: 800, maxWidth: 800 }} aria-label="forms table">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Form Name</strong>
            </TableCell>
            <TableCell>
              <strong>Form ID</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Elements</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Rows</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.forms.map((form) => (
            <TableRow
              key={form.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Typography variant="subtitle1" fontWeight="medium">
                  {form.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontFamily="monospace"
                >
                  {form.id}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={`${form.elements?.flat().length || 0} elements`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={`${form.elements?.length || 0} rows`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Link to={`/forms/${form.id}`}>
                    <IconButton size="small" color="primary">
                      <PreviewIcon />
                    </IconButton>
                  </Link>
                  <Link to={`/forms/${form.id}/edit`}>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteForm(form.id)}
                  >
                    {isDeleting && variables === form.id ? (
                      <CircularProgress size="24px" color="error" />
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
