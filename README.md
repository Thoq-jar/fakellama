# Fakellama

Trick Ollama apps into using another API.
I made this because I wanted to pick between o3-mini
high, medium and low, but Jetbrains AI doesn't support that.

## Setup
### Prerequisites:
- Deno 2.0 or later
- SK_FAKELLAMA_API_KEY environment variable set to your OpenAI API key

```shell
export SK_FAKELLAMA_API_KEY=<your-key-here>
```

```shell
deno task package # Build fakellama
```

## License
This project uses the MIT License, visit the [LICENSE](LICENSE.md) for more info!