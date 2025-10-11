import * as React from "react";
export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border bg-white ${className}`} {...props} />;
}
export default Card;

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pt-6 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />;
}