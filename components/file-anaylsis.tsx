import React, { useState, useEffect } from "react";
import { DocumentAdd, Trash } from "lucide-react";

const FileViewer = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    const resp = await fetch("/api/assistants/files", {
      method: "GET",
    });
    const data = await resp.json();
    setFiles(data);
  };

  const handleFileDelete = async (fileId) => {
    await fetch("/api/assistants/files", {
      method: "DELETE",
      body: JSON.stringify({ fileId }),
    });
  };

  const handleFileUpload = async (event) => {
    const data = new FormData();
    if (event.target.files.length < 0) return;
    data.append("file", event.target.files[0]);
    await fetch("/api/assistants/files", {
      method: "POST",
      body: data,
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-lg shadow-lg">
      <h4 className="text-xl font-semibold text-yellow-400 mb-2">
        Upload Your Files for Assistant
      </h4>
      <p className="text-sm text-slate-300 mb-4">
        These files will be used for the Assistant's Knowledgebase.
      </p>

      <div
        className={`${files.length !== 0 ? "max-h-60" : ""} overflow-auto mb-4`}
      >
        {files.length === 0 ? (
          <div className="text-sm text-slate-400 font-semibold text-center py-4">
            No files uploaded yet
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.file_id}
              className="flex justify-between items-center p-3 hover:bg-slate-700 rounded-md mb-2"
            >
              <span className="text-white truncate">{file.filename}</span>
              <button
                onClick={() => handleFileDelete(file.file_id)}
                className="text-red-400 hover:text-red-300 transition-colors"
                aria-label={`Delete ${file.filename}`}
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex justify-center items-center p-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 transition duration-300 cursor-pointer">
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center space-x-2 cursor-pointer"
        >
          <DocumentAdd className="h-6 w-6 text-slate-900" />
          <span className="text-slate-900 font-semibold">Upload files</span>
        </label>
        <input
          type="file"
          id="file-upload"
          name="file-upload"
          className="hidden"
          multiple
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default FileViewer;
