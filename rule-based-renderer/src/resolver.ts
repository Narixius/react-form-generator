import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Condition, Form, Rule } from "./types";
import type { FieldValues } from "react-hook-form";
import { get } from "es-toolkit/compat";

export const isRulesValid = (data: FieldValues, rules: Rule[]) => {
  return rules
    ?.map((rule) => {
      const conditionsValue = rule.conditions.map((condition) => {
        const targetElement = condition.elementId;
        const expectedValue = condition.value;
        const actualValue = get(data, targetElement);
        return isConditionValid(condition, expectedValue, actualValue);
      });
      if (rule.operation === "AND") {
        return conditionsValue.every((v) => v);
      } else if (rule.operation === "OR") {
        return conditionsValue.some((v) => v);
      }
    })
    .every((v) => v);
};

export const isConditionValid = (
  condition: Condition,
  expectedValue: unknown,
  actualValue: unknown
) => {
  switch (condition.operator) {
    case "EQUALS":
      return actualValue === expectedValue;
    case "NOT_EQUALS":
      return actualValue !== expectedValue;
    case "IN":
      return Array.isArray(actualValue) && actualValue.includes(expectedValue);
    case "NOT_IN":
      return Array.isArray(actualValue) && !actualValue.includes(expectedValue);
    case "GREATER_THAN":
      return actualValue && (actualValue as number) > +(expectedValue as number);
    case "LESS_THAN":
      return actualValue && (actualValue as number) < +(expectedValue as number);
    default:
      return false;
  }
};

export const getFormResolver = (form: Form) => {
  const resolver: ReturnType<typeof yupResolver> = (data, ctx, options) => {
    const shape: Record<string, yup.Schema> = {};
    form.elements.flat().forEach((element) => {
      const isFieldVisible = !element.rules || isRulesValid(data, element.rules);
      if (isFieldVisible) {
        // before generating the validator, check if the field is not hidden by any rule
        let validator: yup.Schema = yup.string();
        if (element.type === "text") {
          validator = yup.string();
          if (element.required) {
            validator = validator.required("This field is required")
          }
        } else if (element.type === "checkbox" && element.required) {
          const allowed = element.choices?.map((c) => c.id) || [];
          validator = yup.array().of(yup.string().oneOf(allowed))
            .test(
              "must-contain-one",
              `This field must be checked`,
              (arr) => arr?.some((item) => item && allowed.includes(item)) ?? false
            )
        } else {
          validator = yup.mixed();
          if (element.required) {
            validator = validator.required("This field is required");
          }
        }
        shape[element.id] = validator;
      }
    });

    const schema = yup.object().shape(shape);
    return yupResolver(schema)(data, ctx, options);
  }

  return resolver;
};
