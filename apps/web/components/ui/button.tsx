import * as React from "react";

type Variant = "primary" | "secondary" | "outline" | "default" | "ghost";
type Size = "sm" | "md" | "icon";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition";
  const sizes: Record<Size, string> = {
    sm: "text-sm px-2.5 py-1.5",
    md: "text-sm px-3 py-2",
    icon: "p-2",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-black text-white hover:bg-black/80",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
    default: "bg-transparent text-gray-900 hover:bg-gray-100",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-900",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export default Button;
