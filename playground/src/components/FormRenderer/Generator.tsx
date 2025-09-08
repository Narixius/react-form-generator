import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import {
  FormRenderer,
  type FormElementProps,
  type FormRendererProps,
} from "react-rule-based-renderer";
import {
  ElementGenerator,
  ElementGeneratorDeleteDialog,
  ElementGeneratorDialog,
} from "./ElementGenerator";
import type { Form, Element } from "react-rule-based-renderer/types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";

const FormGeneratorContext = createContext<{
  components: FormRendererProps["components"];
  openDeleteModal: (element: { rowIndex: number; columnIndex: number }) => void;
  openEditModal: (element: { rowIndex: number; columnIndex: number }) => void;
  onAdd: (element: {
    rowIndex: number;
    columnIndex: number;
    newRow: boolean;
  }) => void;
}>(null!);
const useFormGeneratorContext = () => {
  const context = useContext(FormGeneratorContext);
  if (!context) {
    throw new Error(
      "useFormGeneratorContext must be used within a FormGeneratorContext.Provider"
    );
  }
  return context;
};

const GeneratorElement: FC<FormElementProps> = ({
  element,
  columnIndex,
  rowIndex,
}) => {
  const { components, openDeleteModal, openEditModal, onAdd } =
    useFormGeneratorContext();

  return (
    <ElementGenerator
      element={element}
      onUpdate={() => openEditModal({ rowIndex, columnIndex })}
      onDelete={() => openDeleteModal({ rowIndex, columnIndex })}
      components={components}
      showAddOnRight
      onAddToRight={() =>
        onAdd({ rowIndex, columnIndex: columnIndex + 1, newRow: false })
      }
      showAddOnBottom={columnIndex === 0}
      onAddToBottom={() =>
        onAdd({ rowIndex: rowIndex + 1, columnIndex, newRow: true })
      }
    />
  );
};

const FormGeneratorComponent: FC<
  FormElementProps<{ components?: FormRendererProps["components"] }>
> = ({ ...props }) => {
  const form = useMemo(() => {
    const formSchema = JSON.parse(
      JSON.stringify(props.fieldProps.value)
    ) as Form;
    formSchema.elements.forEach((row) => {
      row.forEach((element) => {
        element.props = element.props || {};
        element.props._rules = element.rules;
        element.rules = undefined;
      });
    });
    if (!formSchema?.elements.length) {
      formSchema.elements = [
        [
          {
            id: "dummy-element",
            type: "hidden",
            label: "hidden",
          },
        ],
      ];
    }
    return formSchema;
  }, [props.fieldProps.value]);

  const allElements = useMemo(
    () => props.fieldProps.value?.elements?.flat(),
    [props.fieldProps.value]
  );

  const [newElementPosition, setNewElementPosition] = useState<{
    rowIndex: number;
    columnIndex: number;
    newRow: boolean;
  } | null>(null);

  const [editingElement, setEditingElement] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);

  const [deletingElement, setDeletingElement] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);

  const findElement = (rowIndex: number, columnIndex: number) => {
    if (!form || !form.elements[rowIndex]) return undefined;
    return form.elements[rowIndex][columnIndex] || undefined;
  };

  const onAdd = (element: {
    rowIndex: number;
    columnIndex: number;
    newRow: boolean;
  }) => {
    setNewElementPosition(element);
  };

  const openEditModal = (element: { rowIndex: number; columnIndex: number }) =>
    setEditingElement(element);
  const openDeleteModal = (element: {
    rowIndex: number;
    columnIndex: number;
  }) => setDeletingElement(element);

  const handleDelete = () => {
    if (deletingElement) {
      const currentElements = props.fieldProps.value.elements || [];
      const updatedRow = currentElements[deletingElement.rowIndex].filter(
        (_: Element, idx: number) => idx !== deletingElement.columnIndex
      );
      const updatedElements = [...currentElements];

      updatedElements[deletingElement.rowIndex] = updatedRow;

      if (updatedElements[deletingElement.rowIndex].length === 0) {
        updatedElements.splice(deletingElement.rowIndex, 1);
      }
      props.fieldProps.onChange({
        ...props.fieldProps.value,
        elements: updatedElements,
      });
    }
  };

  const handleUpdate = (updatedElement: Element) => {
    const generatedForm = props.fieldProps.value;
    if (newElementPosition) {
      if (newElementPosition.newRow) {
        generatedForm.elements.splice(newElementPosition.rowIndex, 0, [
          updatedElement,
        ]);
      } else {
        generatedForm.elements[newElementPosition?.rowIndex].splice(
          newElementPosition.columnIndex,
          0,
          updatedElement
        );
      }
    }
    if (editingElement) {
      generatedForm.elements[editingElement?.rowIndex][
        editingElement?.columnIndex
      ] = updatedElement;
    }
    props.fieldProps.onChange({ ...generatedForm });
  };

  const onDiscard = () => {
    setEditingElement(null);
    setDeletingElement(null);
    setNewElementPosition(null);
  };

  return (
    <FormGeneratorContext.Provider
      value={{
        components: props.element.props?.components,
        openDeleteModal,
        openEditModal,
        onAdd,
      }}
    >
      <FormRenderer
        form={form}
        components={generatorComponents}
        FallbackRenderer={GeneratorElement}
      />
      <ElementGeneratorDeleteDialog
        element={
          deletingElement
            ? findElement(deletingElement.rowIndex, deletingElement.columnIndex)
            : undefined
        }
        onClose={onDiscard}
        onDelete={handleDelete}
      />
      <ElementGeneratorDialog
        element={
          newElementPosition
            ? {
                id: ``,
                label: "",
                type: "text",
                required: false,
                props: {
                  placeholder: "",
                  components: props.element.props?.components,
                },
                rules: [],
              }
            : editingElement
            ? findElement(editingElement.rowIndex, editingElement.columnIndex)
            : undefined
        }
        isAdding={!!newElementPosition}
        components={props.element.props?.components}
        onClose={onDiscard}
        allElements={allElements}
        onUpdate={handleUpdate}
      />
    </FormGeneratorContext.Provider>
  );
};

const generatorComponents: FormRendererProps["components"] = {
  generator: FormGeneratorComponent,
  text: GeneratorElement,
  checkbox: GeneratorElement,
};

export type FormGeneratorProps = {
  defaultForm?: Form;
  components?: FormRendererProps["components"];
  onUpdate?: (form: Form) => void;
};

export const FormGenerator: FC<FormGeneratorProps> = ({
  defaultForm,
  components,
  onUpdate,
}) => {
  const form = useForm<{ generatedForm: Form }>({
    defaultValues: {
      generatedForm: defaultForm,
    },
  });

  const formState = useWatch({
    control: form.control,
    name: "generatedForm",
  });

  useEffect(() => {
    onUpdate?.(formState);
  }, [formState, onUpdate]);

  const generatedForm = useWatch({
    control: form.control,
    name: "generatedForm",
  });
  const renderedForm = useForm();

  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <Card sx={{ overflow: "auto" }}>
          <CardContent>
            <Typography variant="body1" marginBottom="12px">
              From Generator
            </Typography>
            <FormProvider {...form}>
              <FormRenderer
                form={{
                  id: "generator-form",
                  name: "Generator",
                  elements: [
                    [
                      {
                        id: "generatedForm",
                        type: "generator",
                        label: "Form Generator",
                        props: {
                          components,
                        },
                      },
                    ],
                  ],
                }}
                components={generatorComponents}
              />
            </FormProvider>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={6}>
        <Card>
          <CardContent>
            <Typography variant="body1" marginBottom="12px">
              Preview
            </Typography>
            <FormProvider {...renderedForm}>
              <FormRenderer form={generatedForm} components={components} />
            </FormProvider>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
