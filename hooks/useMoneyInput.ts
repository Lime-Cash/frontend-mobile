import { useState } from "react";

export function useMoneyInput(initialValue: string = "") {
  const [value, setValue] = useState(initialValue);

  const formatValue = (input: string | number): string => {
    return typeof input === "number" ? input.toString() : input;
  };

  const handleChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    const formattedValue =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : numericValue;

    setValue(formattedValue);
    return formattedValue;
  };

  const isValidAmount = (): boolean => {
    if (!value) return false;
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0;
  };

  return {
    value,
    displayValue: formatValue(value),
    setValue,
    handleChange,
    isValidAmount,
  };
}
