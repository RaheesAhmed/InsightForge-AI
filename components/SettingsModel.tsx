import React, { useEffect, useState } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Building } from "lucide-react";

interface Tool {
  type: string;
}

interface Assistant {
  name: string;
  model: string;
  instructions: string;
  tools: Tool[];
}

export const SettingsModel = () => {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedInstructions, setEditedInstructions] = useState("");
  const [editedModel, setEditedModel] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/assistants");
        const data = await response.json();
        setAssistant(data);
        setEditedName(data.name);
        setEditedInstructions(data.instructions);
        setEditedModel(data.model);
      } catch (error) {
        console.error("Failed to fetch assistant data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    const response = await fetch("/api/assistants", {
      method: "PUT",
      body: JSON.stringify({
        name: editedName,
        instructions: editedInstructions,
        model: editedModel,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setAssistant(data);
      setEditMode(false);
    } else {
      console.error("Failed to update assistant:", response.statusText);
    }
  };

  if (!assistant) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center">
          <Building className="h-8 w-8 text-yellow-400 mr-2" />
          <h1 className="text-2xl font-bold text-yellow-400">
            ConstructAI Assistant Settings
          </h1>
        </div>
        <div className="p-6">
          {editMode ? (
            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-slate-300 mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-slate-300 mb-2"
                  htmlFor="model"
                >
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={editedModel}
                  onChange={(e) => setEditedModel(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-slate-300 mb-2"
                  htmlFor="instructions"
                >
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={editedInstructions}
                  onChange={(e) => setEditedInstructions(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                  Name
                </h2>
                <p className="text-white">{assistant.name}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                  Model
                </h2>
                <p className="text-white">{assistant.model}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                  Instructions
                </h2>
                <div className="bg-slate-700 rounded-md p-3">
                  <pre className="whitespace-pre-wrap text-white">
                    {assistant.instructions || "No instructions provided."}
                  </pre>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                  Tools
                </h2>
                <ul className="list-disc list-inside text-white">
                  {assistant.tools?.map((tool: Tool, index: number) => (
                    <li key={index}>{tool.type}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-900 flex justify-end">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded-md mr-2 flex items-center transition duration-300"
              >
                <FaSave className="mr-2" /> Save
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md flex items-center transition duration-300"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded-md flex items-center transition duration-300"
            >
              <FaEdit className="mr-2" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
