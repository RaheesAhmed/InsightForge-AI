import React, { useState } from "react";
import { Settings } from "lucide-react";
import { Assistant } from "@/app/(main)/admin/api";
import { EditAssistantDialog } from "./EditAssistantDialog";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/app/(main)/admin/api";

interface EditCardProps {
  assistant: Assistant | null;
  isLoading?: boolean;
  onUpdate?: () => void;
}

const EditAssistantCard = ({
  assistant,
  isLoading,
  onUpdate,
}: EditCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleUpdate = async (data: {
    name: string;
    description?: string;
    model: string;
    instructions?: string;
  }) => {
    try {
      setIsUpdating(true);
      await adminApi.updateAssistant(data);
      toast({
        title: "Success",
        description: "Assistant configuration updated successfully",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error updating assistant:", error);
      toast({
        title: "Error",
        description: "Failed to update assistant configuration",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-[#0A0F1E]/50 backdrop-blur-xl p-6 rounded-lg border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Assistant Configuration
            </h4>
            <p className="text-sm text-gray-400">
              {assistant
                ? `Current Model: ${assistant.model}`
                : "Configure your AI assistant settings"}
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            disabled={isLoading}
            className="p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors group disabled:opacity-50"
          >
            <Settings className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
          </button>
        </div>
        {assistant && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-400">Name:</span>
                <span className="ml-2 text-sm text-gray-300">
                  {assistant.name}
                </span>
              </div>
              {assistant.description && (
                <div>
                  <span className="text-sm font-medium text-gray-400">
                    Description:
                  </span>
                  <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                    {assistant.description}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-400">
                  Created:
                </span>
                <span className="ml-2 text-sm text-gray-300">
                  {formatDate(assistant.created_at)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-400">
                  Tools:
                </span>
                <span className="ml-2 text-sm text-gray-300">
                  {assistant.tools.map((tool) => tool.type).join(", ")}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-400">
                  Files Attached:
                </span>
                <span className="ml-2 text-sm text-gray-300">
                  {assistant.file_ids?.length || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <EditAssistantDialog
        assistant={assistant}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />
    </>
  );
};

export default EditAssistantCard;
