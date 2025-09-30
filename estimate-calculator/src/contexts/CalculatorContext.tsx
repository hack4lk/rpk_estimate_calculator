import React, { createContext, useContext, useState, ReactNode } from "react";

interface SelectedOptions {
  [categoryId: string]: {
    [questionIndex: number]: number;
  };
}

interface CalculatorContextType {
  selectedOptions: SelectedOptions;
  setSelectedOption: (
    categoryId: string,
    questionIndex: number,
    optionIndex: number
  ) => void;
  removeSelectedOption: (categoryId: string, questionIndex: number) => void;
  getSelectedOption: (
    categoryId: string,
    questionIndex: number
  ) => number | undefined;
  getCategoryQuestions: (categoryId: string) => {
    [questionIndex: number]: number;
  };
  clearCategorySelections: (categoryId: string) => void;
  getAllSelections: () => SelectedOptions;
  getAllContextData: () => {
    selectedOptions: SelectedOptions;
    totalCategories: number;
    totalQuestions: number;
    completedCategories: string[];
    incompleteCategories: string[];
  };
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(
  undefined
);

interface CalculatorProviderProps {
  children: ReactNode;
}

export const CalculatorProvider: React.FC<CalculatorProviderProps> = ({
  children,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  const setSelectedOption = (
    categoryId: string,
    questionIndex: number,
    optionIndex: number
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [questionIndex]: optionIndex,
      },
    }));
  };

  const removeSelectedOption = (categoryId: string, questionIndex: number) => {
    setSelectedOptions((prev) => {
      if (!prev[categoryId]) return prev;

      const categorySelections = { ...prev[categoryId] };
      delete categorySelections[questionIndex];

      return {
        ...prev,
        [categoryId]: categorySelections,
      };
    });
  };

  const getSelectedOption = (
    categoryId: string,
    questionIndex: number
  ): number | undefined => {
    return selectedOptions[categoryId]?.[questionIndex];
  };

  const getCategoryQuestions = (categoryId: string) => {
    return selectedOptions[categoryId] || {};
  };

  const clearCategorySelections = (categoryId: string) => {
    setSelectedOptions((prev) => {
      const newSelections = { ...prev };
      delete newSelections[categoryId];
      return newSelections;
    });
  };

  const getAllSelections = (): SelectedOptions => {
    return selectedOptions;
  };

  const getAllContextData = () => {
    const categories = Object.keys(selectedOptions);
    const totalCategories = categories.length;

    let totalQuestions = 0;
    const completedCategories: string[] = [];
    const incompleteCategories: string[] = [];

    categories.forEach((categoryId) => {
      const categorySelections = selectedOptions[categoryId];
      const questionIndices = Object.keys(categorySelections).map(Number);
      totalQuestions += questionIndices.length;

      // Assuming a category is complete if it has any selections
      // You might want to modify this logic based on your requirements
      if (questionIndices.length > 0) {
        completedCategories.push(categoryId);
      } else {
        incompleteCategories.push(categoryId);
      }
    });

    return {
      selectedOptions,
      totalCategories,
      totalQuestions,
      completedCategories,
      incompleteCategories,
    };
  };

  const value: CalculatorContextType = {
    selectedOptions,
    setSelectedOption,
    removeSelectedOption,
    getSelectedOption,
    getCategoryQuestions,
    clearCategorySelections,
    getAllSelections,
    getAllContextData,
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
};
