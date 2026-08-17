import { Loader2 } from "lucide-react";

const Loader = ({ className }) => {
  return (
    <Loader2 className={`animate-spin text-primary ${className}`} />
  );
};

export default Loader;
