import { useState } from "react";

export default function App() {
  const [apiSpec, setApiSpec] = useState(null);
  const [error, setError] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const fileContent = await file.text();
        const parsedSpec = JSON.parse(fileContent); // Parse the JSON content
        setApiSpec(parsedSpec);
        setError(""); // Reset error if parsing succeeds
      } catch (err) {
        setError("Invalid JSON file. Please upload a valid OpenAPI spec."  + err);
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline text-red-500" >
      Hello world!
      </h1>
      <h1>OpenAPI Spec Viewer</h1>
      <p>Upload an OpenAPI spec file to view its details.</p>
      
      {/* File Upload */}
      <div>
        <label htmlFor="open-api-spec">File Input: </label>
        <input 
          type="file" 
          name="open-api-spec" 
          id="open-api-spec" 
          accept=".json,.yaml,.yml" 
          onChange={handleFileUpload} 
        />
      </div>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {/* Display Parsed API Spec */}
      {apiSpec && (
        <div style={{ marginTop: "20px" }}>
          {/* API Info */}
          <h2>{apiSpec.info?.title || "API Title"}</h2>
          <p>{apiSpec.info?.description || "API Description"}</p>
          <p>Version: {apiSpec.info?.version}</p>

          {/* Servers */}
          <h3>Servers</h3>
          <ul>
            {apiSpec.servers?.map((server, index) => (
              <li key={index}>
                <strong>URL:</strong> {server.url} <br />
                <strong>Description:</strong> {server.description}
              </li>
            ))}
          </ul>

          {/* Paths */}
          <h3>Endpoints</h3>
          <div>
            {Object.keys(apiSpec.paths || {}).map((path) => (
              <div key={path}>
                <h4>{path}</h4>
                <ul>
                  {Object.keys(apiSpec.paths[path]).map((method) => (
                    <li key={method}>
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
