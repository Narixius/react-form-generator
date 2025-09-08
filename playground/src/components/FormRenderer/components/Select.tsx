import type { FC } from "react";
import type { FormElementProps } from "react-rule-based-renderer";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

export const SelectComponent: FC<FormElementProps> = ({
  element,
  error,
  helperText,
  fieldProps,
}) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="demo-simple-select-label">{element.label}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        label={element.label}
        {...fieldProps}
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
