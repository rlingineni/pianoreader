import * as React from "react";

/**
 *
 * @param {{
 * options: string[],
 * selectedValue: string;
 * onChange: (value: string) => void;
 * widthClass?: string;
 * }} props Props for the component
 * @returns {JSX.Element} JSX Element
 */

export const SelectList = ({
  options,
  selectedValue,
  onChange,
  widthClass,
}) => {
  return (
    <div className={widthClass || "w-full"}>
      <select
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="form-select appearance-none
                            block
                            w-full
                            px-3
                            text-base
                            font-normal
                            text-gray-700
                            bg-white bg-clip-padding bg-no-repeat
                            border border-solid border-gray-300
                            rounded
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        aria-label="Default select example"
      >
        {options.map((option, index) => (
          <option value={option} selected={option === selectedValue}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectList;
