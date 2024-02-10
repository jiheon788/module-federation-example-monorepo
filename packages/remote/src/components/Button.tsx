import React from "react";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children }: IButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => {
        console.log("click remoted button");
      }}
    >
      {children}
    </button>
  );
};

export default Button;
