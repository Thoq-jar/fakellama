# Fakellama

Trick Ollama apps into using another API.
I made this because I wanted to pick between o3-mini
high, medium and low, but Jetbrains AI doesn't support that.

## Setup
### Prerequisites:
- Deno 2.0 or later
- SK_FAKELLAMA_API_KEY environment variable set to your OpenAI API key

Setup ENV:
```shell
export SK_FAKELLAMA_API_KEY=<your-key-here>
```

Build:
```shell
deno task package # Build fakellama
```
Or if you want to install:
```shell
deno task install:fakellama # Builds and installs fakellama to /usr/local/bin/
```

Test:
```shell
 curl http://localhost:9595/api/chat   -H "Content-Type: application/json"   -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello!"        
      }
    ]
  }'
```
## License
This project uses the MIT License, visit the [LICENSE](LICENSE.md) for more info!