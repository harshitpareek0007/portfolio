import { cn } from "../../utils/cn";

export const Card = ({ className, children }) => {
  return (
    <div className={cn("bg-surface border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6", className)}>
      {children}
    </div>
  );
};
