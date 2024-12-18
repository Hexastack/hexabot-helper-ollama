/*
 * Copyright © 2024 Hexastack. All rights reserved.
 *
 * Licensed under the GNU Affero General Public License v3.0 (AGPLv3) with the following additional terms:
 * 1. The name "Hexabot" is a trademark of Hexastack. You may not use this name in derivative works without express written permission.
 * 2. All derivative works must include clear attribution to the original creator and software, Hexastack and Hexabot, in a prominent location (e.g., in the software's "About" section, documentation, and README file).
 */

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Ollama, Options } from 'ollama';

import { AnyMessage } from '@/chat/schemas/types/message';
import { HelperService } from '@/helper/helper.service';
import BaseLlmHelper from '@/helper/lib/base-llm-helper';
import { LLM } from '@/helper/types';
import { LoggerService } from '@/logger/logger.service';
import { Setting } from '@/setting/schemas/setting.schema';
import { SettingService } from '@/setting/services/setting.service';

import { OLLAMA_HELPER_NAME } from './settings';

type OllamaOptions = Omit<
  Settings['ollama_helper'],
  'api_url' | 'model' | 'keep_alive'
>;

@Injectable()
export default class OllamaLlmHelper
  extends BaseLlmHelper<typeof OLLAMA_HELPER_NAME>
  implements OnApplicationBootstrap
{
  private client: Ollama;

  /**
   * Instantiate the LLM helper
   *
   * @param logger - Logger service
   */
  constructor(
    settingService: SettingService,
    helperService: HelperService,
    protected readonly logger: LoggerService,
  ) {
    super('ollama-helper', settingService, helperService, logger);
  }

  getPath(): string {
    return __dirname;
  }

  async onApplicationBootstrap() {
    const settings = await this.getSettings();

    this.client = new Ollama({ host: settings.api_url });
  }

  @OnEvent('hook:ollama_helper:api_url')
  handleApiUrlChange(setting: Setting) {
    this.client = new Ollama({ host: setting.value });
  }

  /**
   * Convert settings to options
   * @param settings Ollama Settings
   * @returns Ollama Options Object
   */
  private buildOptions(settings: Partial<OllamaOptions>): Partial<Options> {
    return {
      ...settings,
      stop: settings.stop ? settings.stop.split(',') : undefined,
    };
  }

  /**
   * Merges options
   * @param partialOptions - Options to override.
   * @param globalDefaults - Global Settings Options.
   * @returns Options
   */
  private mergeOptions(
    partialOptions: Partial<Options>,
    globalDefaults: Partial<Options>,
  ): Partial<Options> {
    const mergedOptions: Partial<Options> = { ...globalDefaults };

    for (const key in partialOptions) {
      if (partialOptions.hasOwnProperty(key)) {
        const value = partialOptions[key];
        if (value !== '' && value !== null) {
          mergedOptions[key] = value;
        }
      }
    }

    return mergedOptions;
  }

  /**
   * Generates a response using LLM
   *
   * @param prompt - The input text from the user
   * @param model - The model to be used
   * @param systemPrompt - The input text from the system
   * @returns {Promise<string>} - The generated response from the LLM
   */
  async generateResponse(
    prompt: string,
    model: string = '',
    system: string = '',
    {
      keepAlive,
      options,
    }: { keepAlive: string; options: Partial<OllamaOptions> } = {
      keepAlive: '5m',
      options: {},
    },
  ): Promise<string> {
    const {
      api_url: _apiUrl,
      model: _model,
      keep_alive: _keepAlive,
      ...globalSettings
    } = await this.getSettings();
    const opts = this.mergeOptions(
      this.buildOptions(options),
      this.buildOptions(globalSettings),
    );
    const response = await this.client.generate({
      model: model || _model,
      prompt,
      system,
      keep_alive: keepAlive || _keepAlive,
      options: opts,
      stream: false,
    });

    return response.response ? response.response : '';
  }

  /**
   * Generates a structured response from Ollama
   *
   * @param prompt - The input text from the user
   * @param model - The model to be used
   * @param systemPrompt - The input text from the system
   * @param schema - The OpenAPI data schema
   * @returns - The generated structured response from Ollama
   */
  async generateStructuredResponse<T>(
    prompt: string,
    model: string = '',
    system: string = '',
    schema: LLM.ResponseSchema,
    {
      keepAlive,
      options,
    }: { keepAlive: string; options: Partial<OllamaOptions> } = {
      keepAlive: '5m',
      options: {},
    },
  ): Promise<T> {
    const {
      api_url: _apiUrl,
      model: _model,
      keep_alive: _keepAlive,
      ...globalSettings
    } = await this.getSettings();
    const opts = this.mergeOptions(
      this.buildOptions(options),
      this.buildOptions(globalSettings),
    );
    const response = await this.client.generate({
      model: model || _model,
      prompt,
      system,
      keep_alive: keepAlive || _keepAlive,
      options: {
        ...opts,
        // Force temperature to be more deterministic
        temperature: 0,
      },
      stream: false,
      format: schema,
    });

    return JSON.parse(response.response) as T;
  }

  /**
   * Formats messages to the Ollama required data structure
   *
   * @param messages - Message history to include
   *
   * @returns Ollama message array
   */
  private formatMessages(messages: AnyMessage[]) {
    return messages.map((m) => {
      return {
        role: 'sender' in m && m.sender ? 'user' : 'assistant',
        content: 'text' in m.message && m.message.text ? m.message.text : '',
      };
    });
  }

  /**
   * Send a chat completion request with the conversation history.
   * You can use this same approach to start the conversation
   * using multi-shot or chain-of-thought prompting.
   *
   * @param prompt - The input text from the user
   * @param model - The model to be used
   * @param history - Array of messages
   * @returns The generated response from the LLM
   */
  public async generateChatCompletion(
    prompt: string,
    model: string,
    systemPrompt: string,
    history: AnyMessage[] = [],
    {
      keepAlive,
      options,
    }: { keepAlive: string; options: Partial<OllamaOptions> } = {
      keepAlive: '5m',
      options: {},
    },
  ) {
    const {
      api_url: _apiUrl,
      model: _model,
      keep_alive: _keepAlive,
      ...globalSettings
    } = await this.getSettings();
    const opts = this.mergeOptions(
      this.buildOptions(options),
      this.buildOptions(globalSettings),
    );
    const response = await this.client.chat({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...this.formatMessages(history),
        {
          role: 'user',
          content: prompt,
        },
      ],
      keep_alive: keepAlive || _keepAlive,
      options: opts,
      stream: false,
    });

    return response.message.content ? response.message.content : '';
  }
}
