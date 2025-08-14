import http from "http";
import * as google from "../../handlers/google-handler";
import { configure, hostname, port } from "../../main";

function googleProvider(modelId, provider) {
  let modelName = "Gemini";

  switch (modelId) {
    case "gemini-2.5-pro":
      modelName = "Gemini 2.5 Pro";
      break;
    case "gemini-2.5-flash":
      modelName = "Gemini 2.5 Flash";
      break;
    default:
      modelName = "Gemini (Unknown)";
      break;
  }

  const fakeModel = configure(provider, modelName);

  const server = http.createServer((req, res) => {
      google.handler(req, res, fakeModel, modelName, modelId).then();
  });

  server.listen(port, hostname, () => {
    console.log(`Fakellama is running @ :${port}`);
  });
}

export { googleProvider };
