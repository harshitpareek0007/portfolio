import { cn } from "../../utils/cn";
import { forwardRef } from "react";

export const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5 text-text">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors",
          error ? "border-red-500 focus:ring-red-500/50" : "border-gray-300 dark:border-gray-700",
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";
