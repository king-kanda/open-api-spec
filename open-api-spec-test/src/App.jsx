import { useState } from "react";

export default function APISpecViewer() {
  const [apiSpec, setApiSpec] = useState(null);
  const [error, setError] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const fileContent = await file.text();
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension === "json") {
          // Handle OpenAPI Spec
          const parsedSpec = JSON.parse(fileContent);
          setApiSpec({ type: "openapi", data: parsedSpec });
          setError("");
        } else if (fileExtension === "wsdl" || file.type === "text/xml") {
          // Handle WSDL
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(fileContent, "text/xml");
          
          // Get the definitions element
          const definitions = xmlDoc.getElementsByTagName("definitions")[0];
          if (!definitions) throw new Error("Invalid WSDL file.");

          // Extract service information
          const service = definitions.getElementsByTagName("service")[0];
          const serviceName = service?.getAttribute("name") || "Unknown Service";
          
          // Get the service endpoint URL
          const soapAddress = service?.getElementsByTagName("address")[0] || 
                            service?.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "address")[0];
          const baseUrl = soapAddress?.getAttribute("location") || "N/A";

          // Get operations from portType
          const portType = definitions.getElementsByTagName("portType")[0];
          const operations = Array.from(portType?.getElementsByTagName("operation") || []);

          // Get bindings to match with SOAP actions
          const bindings = Array.from(definitions.getElementsByTagName("binding"));
          
          // Create table data
          const wsdlData = operations.map(operation => {
            const operationName = operation.getAttribute("name");
            
            // Find corresponding binding operation to get SOAP action
            const bindingOperation = bindings.flatMap(binding => 
              Array.from(binding.getElementsByTagName("operation"))
            ).find(op => op.getAttribute("name") === operationName);
            
            const soapAction = bindingOperation?.getElementsByTagNameNS("http://schemas.xmlsoap.org/wsdl/soap/", "operation")[0]
              ?.getAttribute("soapAction") || "N/A";

            return {
              method: "SOAP",
              apiName: serviceName,
              uri: `${baseUrl}${soapAction ? ` (${soapAction})` : ''}`,
              operation: operationName,
              apiVersion: definitions.getAttribute("targetNamespace")?.split("/").pop() || "1.0",
              dateAdded: new Date().toLocaleDateString()
            };
          });

          setApiSpec({ type: "wsdl", data: wsdlData });
          setError("");
        } else {
          throw new Error("Unsupported file format. Please upload a JSON or WSDL file.");
        }
      } catch (err) {
        setError(err.message || "Invalid file.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center py-6">
      <h1 className="text-2xl font-bold mb-4">API Specification Viewer</h1>
      
      <div className="bg-white shadow p-4 rounded w-96">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload API Specification:
        </label>
        <input 
          type="file" 
          accept=".json,.wsdl,.xml" 
          onChange={handleFileUpload} 
          className="block w-full text-sm text-gray-500" 
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {apiSpec && (
        <div className="bg-white shadow p-6 rounded w-5/6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {apiSpec.type === "openapi" ? "REST API Endpoints" : "WSDL Services"}
          </h2>
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Method</th>
                <th className="border px-4 py-2">API Name</th>
                <th className="border px-4 py-2">URI</th>
                <th className="border px-4 py-2">API Version</th>
                <th className="border px-4 py-2">Date Added</th>
                {apiSpec.type === "wsdl" && (
                  <th className="border px-4 py-2">Operation</th>
                )}
              </tr>
            </thead>
            <tbody>
              {apiSpec.type === "openapi"
                ? Object.entries(apiSpec.data.paths || {}).flatMap(([path, methods]) =>
                    Object.entries(methods).map(([method, details]) => (
                      <tr key={`${path}-${method}`} className="border">
                        <td className="border px-4 py-2">{method.toUpperCase()}</td>
                        <td className="border px-4 py-2">
                          {apiSpec.data.info?.title || "Unknown API"}
                        </td>
                        <td className="border px-4 py-2">
                          {`${apiSpec.data.servers?.[0]?.url || ""}${path}`}
                        </td>
                        <td className="border px-4 py-2">
                          {apiSpec.data.info?.version || "N/A"}
                        </td>
                        <td className="border px-4 py-2">
                          {new Date().toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )
                : apiSpec.data.map((service, index) => (
                    <tr key={index} className="border">
                      <td className="border px-4 py-2">{service.method}</td>
                      <td className="border px-4 py-2">{service.apiName}</td>
                      <td className="border px-4 py-2">{service.uri}</td>
                      <td className="border px-4 py-2">{service.apiVersion}</td>
                      <td className="border px-4 py-2">{service.dateAdded}</td>
                      <td className="border px-4 py-2">{service.operation}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}