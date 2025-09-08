import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FC,
} from "react";
import type { Element, Form, Rule } from "./types";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Stack,
  TextField,
} from "@mui/material";
import {
  Controller,
  useFormContext,
  useWatch,
  type ControllerRenderProps,
  type FieldValues,
} from "react-hook-form";
import { isRulesValid } from "./resolver";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FormElementProps<AdditionalProps = {}> = {
  fieldProps: ControllerRenderProps<FieldValues, string>;
  element: Element<AdditionalProps>;
  error: boolean;
  helperText?: string;
  rowIndex: number;
  columnIndex: number;
};

export type FormRendererProps = {
  form: Form;
  components?: Record<string, FC<FormElementProps>>;
  FallbackRenderer?: FC<FormElementProps>;
};

const throwFormContextError = () => {
  throw new Error(
    "FormRenderer must be used within a FormProvider (imported from react-hook-form)"
  );
};

export const FormRenderer: FC<FormRendererProps> = ({
  form,
  components,
  FallbackRenderer,
}) => {
  const formContext = useFormContext();
  if (!formContext) throwFormContextError();
  return (
    <Stack sx={{ width: "100%" }} spacing={form.spacing}>
      {form.elements.map((row, rowIndex) => {
        return (
          <Stack
            direction="row"
            key={`${rowIndex}-${row.length}`}
            sx={{ width: "100%" }}
            spacing={form.spacing}
          >
            {row.map((element, columnIndex) => {
              return (
                <Controller
                  key={element.id}
                  control={formContext.control}
                  name={element.id}
                  render={({ field }) => {
                    return (
                      <ElementRenderer
                        key={element.id}
                        element={element}
                        field={field}
                        customComponents={components}
                        FallbackRenderer={FallbackRenderer}
                        rowIndex={rowIndex}
                        columnIndex={columnIndex}
                      />
                    );
                  }}
                />
              );
            })}
          </Stack>
        );
      })}
    </Stack>
  );
};

const useElementRuleValidation = (rules?: Rule[]) => {
  const form = useFormContext();
  const checkRules = useCallback(() => {
    if (!rules) return true;
    const fieldsValue = form.getValues();
    return isRulesValid(fieldsValue, rules);
  }, [rules, form]);
  const relatedFormTargets = useMemo(() => {
    return (
      rules
        ?.map((rule) => rule.conditions.map((condition) => condition.elementId))
        .flat() || []
    );
  }, [rules]);
  const watchedValues = useWatch({
    control: form.control,
    name: relatedFormTargets,
  });
  const [isValid, setIsValid] = useState(checkRules);
  useEffect(() => setIsValid(checkRules), [watchedValues, checkRules]);
  return isValid;
};

const ElementRenderer: FC<{
  element: Element;
  field: ControllerRenderProps<FieldValues, string>;
  customComponents: FormRendererProps["components"];
  FallbackRenderer: FormRendererProps["FallbackRenderer"];
  rowIndex: number;
  columnIndex: number;
}> = ({
  element,
  field,
  customComponents,
  FallbackRenderer,
  rowIndex,
  columnIndex,
}) => {
  const formContext = useFormContext();
  if (!formContext) throwFormContextError();
  const isVisible = useElementRuleValidation(element.rules);
  if (!isVisible) return null;

  const error = formContext.formState.errors[element.id];
  const fieldProps = {
    ...field,
  };
  const props = {
    element: element,
    rowIndex: rowIndex,
    columnIndex: columnIndex,
    fieldProps,
    error: !!error,
    helperText: error ? (error.message as string) : undefined,
  };
  if (customComponents && customComponents[element.type]) {
    const CustomComponent = customComponents[element.type];
    return <CustomComponent {...props} />;
  }
  switch (element.type) {
    case "text":
      return <TextRenderer {...props} />;
    case "checkbox":
      return <CheckboxRenderer {...props} />;
    default:
      if (FallbackRenderer) return <FallbackRenderer {...props} />;
      return null;
  }
};

const TextRenderer: FC<FormElementProps> = ({
  element,
  fieldProps,
  helperText,
  error,
}) => {
  return (
    <TextField
      label={element.label}
      sx={{ width: "100%" }}
      error={error}
      helperText={helperText}
      required={element.required}
      {...element.props}
      {...fieldProps}
    />
  );
};

const CheckboxRenderer: FC<FormElementProps> = ({
  element,
  fieldProps,
  error,
  helperText,
}) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const { value = [] } = fieldProps;
      const currentValueIndex = value.indexOf(e.target.value);
      if (checked) {
        if (value.includes(e.target.value)) value.splice(currentValueIndex, 1);
        else value.push(e.target.value);
      } else if (value.includes(e.target.value) && currentValueIndex > -1) {
        value.splice(currentValueIndex, 1);
      }
      fieldProps.onChange(value);
    },
    [fieldProps]
  );
  return element.choices?.map((choice) => (
    <FormControl error={error} required={element.required}>
      <FormControlLabel
        key={choice.id}
        control={
          <Checkbox
            {...element.props}
            {...fieldProps}
            required={element.required}
            onChange={handleChange}
            value={choice.id}
            key={choice.id}
          />
        }
        sx={{ width: "100%" }}
        label={element.label}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  ));
};
