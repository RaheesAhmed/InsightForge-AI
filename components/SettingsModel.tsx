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
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        <div className="p-6 border-b border-gray-300 flex items-center">
          <Building className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            VirtuHelpX Assistant Settings
          </h1>
        </div>
        <div className="p-6">
          {editMode ? (
            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-600 mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-600 mb-2"
                  htmlFor="model"
                >
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={editedModel}
                  onChange={(e) => setEditedModel(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-600 mb-2"
                  htmlFor="instructions"
                >
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  value={editedInstructions}
                  onChange={(e) => setEditedInstructions(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-2">
                  Name
                </h2>
                <p className="text-gray-800">{assistant.name}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-2">
                  Model
                </h2>
                <p className="text-gray-800">{assistant.model}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-2">
                  Instructions
                </h2>
                <div className="bg-gray-50 rounded-md p-3 border border-gray-300">
                  <pre className="whitespace-pre-wrap text-gray-800">
                    {assistant.instructions || "No instructions provided."}
                  </pre>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-2">
                  Tools
                </h2>
                <ul className="list-disc list-inside text-gray-800">
                  {assistant.tools?.map((tool: Tool, index: number) => (
                    <li key={index}>{tool.type}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 flex justify-end border-t border-gray-300">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mr-2 flex items-center transition duration-300"
              >
                <FaSave className="mr-2" /> Save
              </button>
              <button
                onClick={handleEditToggle}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md flex items-center transition duration-300"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center transition duration-300"
            >
              <FaEdit className="mr-2" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
