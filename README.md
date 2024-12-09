# Ollama Helper for Hexabot

The **Ollama Helper** is an extension for [Hexabot](https://github.com/hexastack/hexabot) that acts as a utility class to interact with the Ollama API, enabling seamless invocation of Ollama from other Hexabot extensions such as plugins and channels. Ollama is an advanced large language model that enhances Hexabot's capabilities by providing AI-powered responses and conversations.

[Hexabot](https://hexabot.ai/) is an open-source chatbot / agent solution that allows users to create and manage AI-powered, multi-channel, and multilingual chatbots with ease. If you would like to learn more, please visit the [official github repo](https://github.com/Hexastack/Hexabot/).

This helper simplifies interactions with the Ollama API by providing methods for generating responses, managing chat completions, and handling settings, which can be used across different parts of Hexabot's architecture.

## Features

- **Utility Class**: Facilitates API calls to the Ollama server for generating LLM-based responses.
- **Configurable Settings**: Configurable parameters such as API URL, model type, and LLM options.
- **Integrate with Plugins and Channels**: Ollama can be invoked directly from other Hexabot components, making it highly extensible.


## Prerequisite : Ollama Setup
Ollama makes it easy to get up and running with large language models locally. pay a visit to the official website and download it : https://ollama.com/

The Hexabot Docker Compose file for Ollama is located under the `docker` folder. By default, the configuration uses the CPU, but you can also use a GPU for better performance. Please refer to the official Ollama Docker documentation : https://hub.docker.com/r/ollama/ollama

Note that structured responses are supported starting Ollama v0.5.1.

Once Ollama is installed, make sure to enable the Ollama server when running Hexabot:

```sh
hexabot dev --services ollama
```

Also, ensure to SSH into the container and pull the model(s) you would like to use:

```sh
docker exec -it ollama ollama pull llama3.2
```

Try different models, Ollama models can be found on the Ollama library : https://ollama.com/library.

## Installation

To use the **Ollama Helper** extension within Hexabot, follow these steps:

```sh
cd ~/projects/my-chatbot
npm install hexabot-helper-ollama
hexabot dev --services ollama
```

## Configuration Settings

Below are the settings for configuring the Ollama Helper:

- **API URL**: The base URL of the Ollama server (default: `http://ollama:11434`)
- **Model**: The LLM model to be used (default: `llama3.2`)
- **Keep Alive**: Time to keep the model in memory (default: `5m`)
- **Mirostat**: Mirostat mode setting (default: `0` (disabled))
- **Mirostat Eta**: Eta value for Mirostat (default: `0.1`)
- **Mirostat Tau**: Tau value for Mirostat (default: `5.0`)
- **Context Window Size**: Maximum context length (default: `2048`)
- **Repeat Last N**: Number of previous tokens for penalty (default: `64`)
- **Repeat Penalty**: Repetition penalty (default: `1.1`)
- **Temperature**: Sampling temperature (default: `0.8`)
- **Seed**: Random seed value (default: `0`)
- **Stop**: Stop sequence for model output (default: `AI assistant:`)
- **TFS Z**: Tail free sampling value (default: `1`)
- **Maximum number of tokens**: Number of tokens to predict (default: `20`)
- **Top K**: Top-k sampling parameter (default: `40`)
- **Top P**: Top-p (nucleus) sampling parameter (default: `0.9`)
- **Min P**: Minimum probability (default: `0.0`)


## Usage

The Ollama Helper provides a variety of methods that can be used to integrate with your chatbot workflows:

```typescript
const ollamaHelper = this.helperService.use(
        HelperType.LLM,
        OllamaLlmHelper,
      );
```

### 1. Generate a Response

You can use the helper to generate responses from the model based on user input:

```typescript
const response = await ollamaHelper.generateResponse(prompt, model, systemPrompt, options);
console.log(response);
```

### 2. Generate a Chat Completion

This method uses conversation history to generate a contextual response:

```typescript
const response = await ollamaHelper.generateChatCompletion(prompt, model, systemPrompt, history, options);
console.log(response);
```

## Contributing

We welcome contributions from the community! Whether you want to report a bug, suggest new features, or submit a pull request, your input is valuable to us.

Please refer to our contribution policy first : [How to contribute to Hexabot](./CONTRIBUTING.md)

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./CODE_OF_CONDUCT.md)

Feel free to join us on [Discord](https://discord.gg/rNb9t2MFkG)

## License

This software is licensed under the GNU Affero General Public License v3.0 (AGPLv3) with the following additional terms:

1. The name "Hexabot" is a trademark of Hexastack. You may not use this name in derivative works without express written permission.
2. All derivative works must include clear attribution to the original creator and software, Hexastack and Hexabot, in a prominent location (e.g., in the software's "About" section, documentation, and README file).

---

_Happy Chatbot Building!_
