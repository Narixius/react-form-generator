export interface Form {
  id: string;
  name: string;
  spacing?: number;
  elements: Element[][];
}

type DefaultProps = {
  'error'?: boolean,
  'helperText'?: string,
  [key: string]: unknown
}

export type Element<Props = DefaultProps> = {
  id: string;
  label: string;
  type: 'text' | 'checkbox' | (string & {}),
  required?: boolean;
  rules?: Rule[]
  props?: Props,
  choices?: Choice[]
}

export interface Choice {
  id: string,
  name: string
}

export interface Rule {
  operation: 'AND' | 'OR';
  conditions: Condition[];
}
export interface Condition {
  elementId: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | "GREATER_THAN" | "LESS_THAN";
  value: unknown;
}
