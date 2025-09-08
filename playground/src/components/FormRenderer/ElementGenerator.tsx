import { useEffect, useMemo, type FC } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
  Drawer,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddCircleIcon,
  Add as PlusIcon,
} from "@mui/icons-material";
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import type {
  Element,
  Choice,
  Rule,
  Condition,
} from "react-rule-based-renderer/types";
import type { FormRendererProps } from "react-rule-based-renderer";

interface ElementGeneratorProps {
  element?: Element;
  onUpdate: (element: Element) => void;
  onDelete: (element?: Element) => void;
  onAddToRight: () => void;
  onAddToBottom: () => void;
  components: FormRendererProps["components"];
  allElements?: Element[];
  onClose?: () => void;
  showAddOnRight?: boolean;
  showAddOnBottom?: boolean;
  isAdding?: boolean;
}

interface ElementFormData {
  id: string;
  label: string;
  type: string;
  required: boolean;
  choices: Choice[];
  rules: Rule[];
  props?: Record<string, unknown>;
}

export const ElementGenerator: FC<ElementGeneratorProps> = ({
  element,
  onUpdate,
  onDelete,
  onAddToRight,
  showAddOnRight = false,
  onAddToBottom,
  showAddOnBottom = false,
}) => {
  const isHiddenComponent = element?.type === "hidden";
  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        paddingRight: showAddOnRight ? "30px" : undefined,
        paddingBottom: showAddOnBottom ? "30px" : undefined,
      }}
    >
      {!isHiddenComponent && (
        <Card
          sx={{
            cursor: "pointer",
            width: "100%",
          }}
          onClick={() => onUpdate(element!)}
        >
          <CardContent sx={{ padding: "12px !important" }}>
            <Stack
              direction="column"
              justifyContent="space-between"
              alignItems="start"
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="start"
                width="100%"
              >
                <Typography variant="h6" fontSize={"14px"} whiteSpace="nowrap">
                  {element?.label} {element?.required ? " *" : ""}
                </Typography>
                <Stack direction="row" spacing="1px" sx={{ mt: "-4px" }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate?.(element!);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(element);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {element?.type}
                {!!(element?.props?._rules as Rule[])?.length && (
                  <Chip
                    label="Conditional Field"
                    size="small"
                    sx={{ ml: 1, scale: "0.8", translate: "-15px" }}
                  />
                )}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!isHiddenComponent && showAddOnRight && (
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: "calc(50% - 15px)",
            right: "-10px",
            transform: "translateY(-50%)",
          }}
          onClick={onAddToRight}
        >
          <PlusIcon />
        </IconButton>
      )}

      {showAddOnBottom && (
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: "calc(100% - 5px)",
            left: "0",
            transform: "translateY(-50%)",
          }}
          onClick={onAddToBottom}
        >
          <PlusIcon />
        </IconButton>
      )}
    </Box>
  );
};

export const ElementGeneratorDeleteDialog: FC<
  Pick<ElementGeneratorProps, "element" | "onDelete" | "onClose">
> = ({ element, onDelete, onClose }) => {
  const isOpen = !!element;

  const handleDelete = () => {
    onDelete?.();
    onClose?.();
  };
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Delete Element</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          Are you sure you want to delete "{element?.label}"? This action cannot
          be undone.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const operators = [
  { value: "EQUALS", label: "Equals" },
  { value: "NOT_EQUALS", label: "Not Equals" },
  { value: "INCLUDES", label: "Includes" },
  { value: "NOT_INCLUDES", label: "Not Includes" },
  { value: "GREATER_THAN", label: "Greater Than" },
  { value: "LESS_THAN", label: "Less Than" },
];

export const ElementGeneratorDialog: FC<
  Pick<
    ElementGeneratorProps,
    | "components"
    | "element"
    | "allElements"
    | "onUpdate"
    | "onClose"
    | "isAdding"
  >
> = ({ components, element, allElements, onUpdate, onClose, isAdding }) => {
  const isOpen = !!element;
  const elementTypes = useMemo(() => {
    const allComponents = components
      ? Object.keys(components).map((key) => ({
          value: key,
          label: key,
        }))
      : [];

    if (allComponents.findIndex((e) => e.value === "checkbox") === -1)
      allComponents.unshift({ label: "checkbox", value: "checkbox" });

    if (allComponents.findIndex((e) => e.value === "text") === -1)
      allComponents.unshift({ label: "text", value: "text" });

    return allComponents;
  }, [components]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    ...form
  } = useForm<ElementFormData>({
    defaultValues: {
      id: element?.id || "",
      label: element?.label || "",
      type: element?.type || "text",
      required: element?.required || false,
      choices: element?.choices || [],
      rules: (element?.props?._rules || []) as Rule[],
      props: element?.props || {},
    },
  });

  useEffect(() => {
    if (element) {
      form.reset({
        id: element?.id || "",
        label: element?.label || "",
        type: element?.type || "text",
        required: element?.required || false,
        choices: element?.choices || [],
        rules: (element?.props?._rules || []) as Rule[],
        props: element?.props || {},
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);

  const [rules, selectedType] = useWatch({
    control,
    name: ["rules", "type"],
  });

  const showChoices =
    ["checkbox", "select"].includes(selectedType) || !!element?.choices;
  const onSubmit = (data: ElementFormData) => {
    const updatedElement: Element = {
      id: data.id,
      label: data.label,
      type: data.type as "text" | "checkbox" | (string & {}),
      required: data.required,
      rules: rules,
      props: data.props,
      ...(showChoices && { choices: data.choices }),
    };
    onUpdate?.(updatedElement);
    onClose?.();
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "choices",
  });

  const addChoice = () => {
    append({
      id: `choice-${Date.now()}`,
      name: "",
    });
  };

  const addRule = () => {
    const newRule: Rule = {
      operation: "AND",
      conditions: [],
    };
    form.setValue("rules", [...rules, newRule]);
  };

  const updateRule = (index: number, updatedRule: Rule) => {
    const newRules = [...rules];
    newRules[index] = updatedRule;
    form.setValue("rules", newRules);
  };

  const deleteRule = (index: number) => {
    form.setValue(
      "rules",
      rules.filter((_, i) => i !== index)
    );
  };

  const addCondition = (ruleIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions.push({
      elementId: "",
      operator: "EQUALS",
      value: "",
    });
    form.setValue("rules", newRules);
  };

  const updateCondition = (
    ruleIndex: number,
    conditionIndex: number,
    updatedCondition: Condition
  ) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions[conditionIndex] = updatedCondition;
    form.setValue("rules", newRules);
  };

  const deleteCondition = (ruleIndex: number, conditionIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions.splice(conditionIndex, 1);
    form.setValue("rules", newRules);
  };
  return (
    <Drawer open={isOpen} onClose={onClose} anchor="left">
      <Box padding="20px" minWidth="400px">
        <Typography variant="h6" mb="20px">
          {isAdding ? "Add" : "Update"} Element
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* <DialogContent> */}
          <Stack spacing={3}>
            <Controller
              name="id"
              control={control}
              rules={{ required: "ID is required" }}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  label="Element ID"
                  error={!!errors.id}
                  helperText={errors.id?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="label"
              control={control}
              rules={{ required: "Label is required" }}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  label="Label"
                  error={!!errors.label}
                  helperText={errors.label?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Element Type</InputLabel>
                  <Select size="small" {...field} label="Element Type">
                    {elementTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="required"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Required"
                />
              )}
            />

            {showChoices && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Choices
                </Typography>
                <Stack spacing={2}>
                  {fields.map((field, index) => (
                    <Stack
                      key={field.id}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <Controller
                        name={`choices.${index}.id`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Choice ID"
                            size="small"
                            sx={{ flex: 1 }}
                          />
                        )}
                      />
                      <Controller
                        name={`choices.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Choice Name"
                            size="small"
                            sx={{ flex: 2 }}
                          />
                        )}
                      />
                      <IconButton onClick={() => remove(index)} color="error">
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button
                    onClick={addChoice}
                    startIcon={<AddIcon />}
                    variant="outlined"
                  >
                    Add Choice
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Rules Management */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Rules
              </Typography>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="rules-content"
                  id="rules-header"
                >
                  <Typography>Conditional Rules ({rules.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {rules.map((rule, ruleIndex) => (
                      <Paper key={ruleIndex} elevation={1} sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="subtitle1">
                              Rule {ruleIndex + 1} ({rule.operation})
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                onClick={() => {
                                  const newOperation =
                                    rule.operation === "AND" ? "OR" : "AND";
                                  updateRule(ruleIndex, {
                                    ...rule,
                                    operation: newOperation,
                                  });
                                }}
                              >
                                Switch to{" "}
                                {rule.operation === "AND" ? "OR" : "AND"}
                              </Button>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteRule(ruleIndex)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </Stack>

                          <Divider />

                          <Typography variant="body2" color="text.secondary">
                            Conditions ({rule.conditions.length})
                          </Typography>

                          <Stack spacing={1}>
                            {rule.conditions.map(
                              (_condition, conditionIndex) => (
                                <Paper
                                  key={conditionIndex}
                                  variant="outlined"
                                  sx={{ p: 2 }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    <FormControl
                                      size="small"
                                      sx={{ minWidth: 120 }}
                                    >
                                      <InputLabel>Element</InputLabel>
                                      <Select
                                        value={
                                          rule.conditions[conditionIndex]
                                            .elementId
                                        }
                                        label="Element"
                                        onChange={(e) => {
                                          updateCondition(
                                            ruleIndex,
                                            conditionIndex,
                                            {
                                              ...rule.conditions[
                                                conditionIndex
                                              ],
                                              elementId: e.target.value,
                                            }
                                          );
                                        }}
                                      >
                                        {allElements?.map((el) => (
                                          <MenuItem key={el.id} value={el.id}>
                                            {el.label}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>

                                    <FormControl
                                      size="small"
                                      sx={{ minWidth: 120 }}
                                    >
                                      <InputLabel>Operator</InputLabel>
                                      <Select
                                        value={
                                          rule.conditions[conditionIndex]
                                            .operator
                                        }
                                        label="Operator"
                                        onChange={(e) => {
                                          updateCondition(
                                            ruleIndex,
                                            conditionIndex,
                                            {
                                              ...rule.conditions[
                                                conditionIndex
                                              ],
                                              operator: e.target.value as
                                                | "EQUALS"
                                                | "NOT_EQUALS"
                                                | "INCLUDES"
                                                | "NOT_INCLUDES"
                                                | "GREATER_THAN"
                                                | "LESS_THAN",
                                            }
                                          );
                                        }}
                                      >
                                        {operators?.map((op) => (
                                          <MenuItem
                                            key={op.value}
                                            value={op.value}
                                          >
                                            {op.label}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>

                                    <TextField
                                      size="small"
                                      label="Value"
                                      value={
                                        rule.conditions[conditionIndex].value
                                      }
                                      onChange={(e) => {
                                        updateCondition(
                                          ruleIndex,
                                          conditionIndex,
                                          {
                                            ...rule.conditions[conditionIndex],
                                            value: e.target.value,
                                          }
                                        );
                                      }}
                                      sx={{ flex: 1 }}
                                    />

                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        deleteCondition(
                                          ruleIndex,
                                          conditionIndex
                                        )
                                      }
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </Stack>
                                </Paper>
                              )
                            )}
                          </Stack>

                          <Button
                            size="small"
                            startIcon={<AddCircleIcon />}
                            onClick={() => addCondition(ruleIndex)}
                            variant="outlined"
                          >
                            Add Condition
                          </Button>
                        </Stack>
                      </Paper>
                    ))}

                    <Button
                      onClick={addRule}
                      startIcon={<AddIcon />}
                      variant="outlined"
                      fullWidth
                    >
                      Add Rule
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Stack>
          {/* </DialogContent> */}
          <Stack direction="row" mt="20px">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isAdding ? "Add" : "Update"} Element
            </Button>
          </Stack>
        </form>
      </Box>
    </Drawer>
  );
};
