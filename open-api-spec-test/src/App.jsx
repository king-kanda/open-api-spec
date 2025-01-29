import { useState } from "react";
import SwaggerClient from "swagger-client";

export default function App() {
  const [apiSpec, setApiSpec] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const fileContent = await file.text();
        const parsedSpec = JSON.parse(fileContent); // Parse the JSON content
        setApiSpec(parsedSpec);
        setError(""); // Reset error if parsing succeeds
      } catch (err) {
        setError("Invalid JSON file. Please upload a valid OpenAPI spec.");
      }
    }
  };

  const handleFetchFromURL = async (url) => {
    setLoading(true);
    try {
      const client = await SwaggerClient({ url });
      setApiSpec(client.spec);
      setError("");
    } catch (err) {
      setError("Failed to fetch OpenAPI spec from the URL. Please try again." + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center py-6">
      <h1 className="text-2xl font-bold mb-4">OpenAPI Spec Viewer</h1>
      <p className="text-lg mb-6">Upload or fetch an OpenAPI spec file to view its details.</p>
      
      {/* File Upload */}
      <div className="bg-white shadow p-4 rounded w-96">
        <label htmlFor="open-api-spec" className="block text-sm font-medium text-gray-700 mb-2">
          Upload File:
        </label>
        <input
          type="file"
          name="open-api-spec"
          id="open-api-spec"
          accept=".json,.yaml,.yml"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Fetch from URL */}
      <div className="bg-white shadow p-4 rounded w-96 mt-4">
        <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-2">
          Fetch from URL:
        </label>
        <input
          type="text"
          id="api-url"
          placeholder="Enter OpenAPI spec URL"
          className="block w-full px-4 py-2 border rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFetchFromURL(e.target.value);
            }
          }}
        />
        {loading && <p className="text-gray-500 text-sm mt-2">Fetching spec...</p>}
      </div>

      {/* Display Parsed API Spec */}
      {apiSpec && (
        <div className="bg-white shadow p-6 rounded w-5/6 mt-8">
          <h2 className="text-xl font-semibold">{apiSpec.info?.title || "API Title"}</h2>
          <p className="text-gray-700">{apiSpec.info?.description || "API Description"}</p>
          <p className="text-gray-500 text-sm">Version: {apiSpec.info?.version}</p>

          {/* Servers */}
          <h3 className="mt-6 text-lg font-medium">Servers</h3>
          <ul className="list-disc pl-6">
            {apiSpec.servers?.map((server, index) => (
              <li key={index} className="text-gray-700">
                <strong>URL:</strong> {server.url} <br />
                <strong>Description:</strong> {server.description}
              </li>
            ))}
          </ul>

          {/* Paths */}
          <h3 className="mt-6 text-lg font-medium">Endpoints</h3>
          <div>
            {Object.keys(apiSpec.paths || {}).map((path) => (
              <div key={path} className="mt-4 border-b pb-4">
                <h4 className="font-semibold text-blue-700">{path}</h4>
                <ul className="list-disc pl-6">
                  {Object.keys(apiSpec.paths[path]).map((method) => (
                    <li key={method} className="text-gray-700">
                      <strong>Method:</strong> {method.toUpperCase()} <br />
                      <strong>Summary:</strong> {apiSpec.paths[path][method]?.summary || "N/A"} <br />
                      <strong>Description:</strong> {apiSpec.paths[path][method]?.description || "N/A"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
