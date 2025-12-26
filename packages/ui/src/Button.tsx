import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
}) => {
  const style: React.CSSProperties = {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    backgroundColor: variant === "primary" ? "#0070f3" : "#666",
    color: "white",
  };

  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
};
