import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FC,
} from "react";
import type { Element, Form, Rule } from "../../types";
import { Checkbox, FormControlLabel, Stack, TextField } from "@mui/material";
import {
  Controller,
  useFormContext,
  useWatch,
  type ControllerRenderProps,
  type FieldValues,
} from "react-hook-form";
import { isRulesValid } from "./resolver";

export type FormElementProps<AdditionalProps = object> = ControllerRenderProps<
  FieldValues,
  string
> & {
  element: Element;
  error: boolean;
  helperText?: string;
} & AdditionalProps;

export type FormRendererProps = {
  form: Form;
  components?: Record<string, FC<FormElementProps>>;
};

const throwFormContextError = () => {
  throw new Error(
    "FormRenderer must be used within a FormProvider (imported from react-hook-form)"
  );
};

export const FormRenderer: FC<FormRendererProps> = ({ form, components }) => {
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
            {row.map((element) => {
              return (
                <Controller
                  control={formContext.control}
                  name={element.id}
                  render={({ field }) => {
                    return (
                      <ElementRenderer
                        key={element.id}
                        element={element}
                        field={field}
                        customComponents={components}
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
}> = ({ element, field, customComponents }) => {
  const formContext = useFormContext();
  if (!formContext) throwFormContextError();
  const isVisible = useElementRuleValidation(element.rules);
  if (!isVisible) return null;

  const error = formContext.formState.errors[element.id];
  const fieldProps = {
    ...field,
    error: !!error,
    helperText: error ? (error.message as string) : undefined,
  };
  switch (element.type) {
    case "text":
      return (
        <TextRenderer
          key={element.id}
          element={element}
          fieldProps={fieldProps}
        />
      );
    case "checkbox":
      return (
        <CheckboxRenderer
          key={element.id}
          element={element}
          fieldProps={fieldProps}
        />
      );
    default:
      if (customComponents && customComponents[element.type]) {
        const CustomComponent = customComponents[element.type];
        return (
          <CustomComponent key={element.id} element={element} {...fieldProps} />
        );
      }
      return null;
  }
};

const TextRenderer: FC<{
  element: Element;
  fieldProps: ControllerRenderProps<FieldValues, string>;
}> = ({ element, fieldProps }) => {
  return (
    <TextField
      label={element.label}
      {...element.props}
      sx={{ width: "100%" }}
      {...fieldProps}
    />
  );
};

const CheckboxRenderer: FC<{
  element: Element;
  fieldProps: ControllerRenderProps<FieldValues, string>;
}> = ({ element, fieldProps }) => {
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
    <FormControlLabel
      control={
        <Checkbox
          {...element.props}
          {...fieldProps}
          onChange={handleChange}
          value={choice.id}
          key={choice.id}
        />
      }
      sx={{ width: "100%" }}
      label={element.label}
    />
  ));
};
