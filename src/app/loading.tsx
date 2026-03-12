import { FiLoader } from "react-icons/fi";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <FiLoader className="animate-spin text-blue-500" size={48} />
    </div>
  );
}
