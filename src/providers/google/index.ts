import * as google from "../../handlers/google-handler.ts";
import { Providers } from "../../interface.ts";
import { configure, hostname, port } from "../../main.ts";
import { genAI } from "../../main.ts";

function googleProvider(
  modelId: string,
  provider: Providers,
) {
  let modelName: string = "Gemini";

  if (genAI.getGenerativeModel({ model: "gemini-2.0-flash" })) {
    modelName = "Gemini Flash 2.0";
  }

  const fakeModel = configure(provider, modelName);

  Deno.serve(
    {
      hostname: hostname,
      port: port,
      onListen: () => console.log(`Fakellama is running @ :${port}`),
    },
    (req: Request) =>
      google.handler(
        req,
        fakeModel,
        modelName,
        modelId,
      ),
  );
}

export { googleProvider };
