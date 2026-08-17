import { cn } from "../../utils/cn";

export const Button = ({ className, variant = "primary", isLoading, children, ...props }) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="mr-2 h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" /> : null}
      {children}
    </button>
  );
};
