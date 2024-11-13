import React from "react";
import { Pencil } from "lucide-react"; // Using lucide-react for consistency

interface EditCardProps {
  onClick: () => void;
}

const EditCard = ({ onClick }: EditCardProps) => {
  return (
    <div className="bg-white border border-gray-300 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Edit Settings</h2>
          <p className="text-sm text-gray-600">
            Configure your assistant settings.
          </p>
        </div>
        <button
          onClick={onClick}
          className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Pencil className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default EditCard;
