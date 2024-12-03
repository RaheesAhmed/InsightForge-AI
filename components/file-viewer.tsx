import React, { useState, useEffect } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";

interface FileItem {
  file_id: string;
  filename: string;
}

const FileViewer = () => {
  const [files, setFiles] = useState<FileItem[]>([]);

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

  const handleFileDelete = async (fileId: string) => {
    await fetch("/api/assistants/files", {
      method: "DELETE",
      body: JSON.stringify({ fileId }),
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const data = new FormData();
    if (event.target.files && event.target.files.length > 0) {
      data.append("file", event.target.files[0]);
      await fetch("/api/assistants/files", {
        method: "POST",
        body: data,
      });
    }
  };

  return (
    <div className="bg-[#0A0F1E]/50 backdrop-blur-xl p-6 rounded-lg border border-white/10">
      <h4 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        Upload Training Data
      </h4>
      <p className="text-sm text-gray-400 mb-6">
        These files will be used for the Assistant's knowledgebase.
      </p>
      <div className="border-t border-white/10 pt-6">
        <div
          className={`${
            files.length !== 0 ? "mb-6" : ""
          } max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}
        >
          {files.length === 0 ? (
            <div className="text-sm text-gray-400 font-semibold">
              No files uploaded yet.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.file_id}
                className="flex justify-between items-center p-3 hover:bg-white/5 rounded-md transition-all duration-200 backdrop-blur-sm group"
              >
                <span className="text-gray-300 truncate">{file.filename}</span>
                <button
                  onClick={() => handleFileDelete(file.file_id)}
                  className="text-red-400 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Delete file"
                >
                  <FaTrash className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-all duration-200 group"
          >
            <FaUpload className="h-6 w-6 text-blue-400 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-gray-300 group-hover:text-white transition-colors">
              Upload files
            </span>
          </label>
          <input
            type="file"
            id="file-upload"
            name="file-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
