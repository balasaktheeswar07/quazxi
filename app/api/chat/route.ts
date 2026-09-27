import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ configured: Boolean(process.env.OPENROUTER_API_KEY?.trim()) });
}

function extractErrorMessage(error: unknown): string {
  if (error == null) return 'An unknown error occurred.';
  if (typeof error === 'string') return error;

  const err = error as Record<string, unknown>;
  const data = err.data as Record<string, unknown> | undefined;
  const dataError = data?.error as Record<string, unknown> | undefined;

  const responseBody = err.responseBody as string | undefined;
  if (responseBody) {
    try {
      const parsed = JSON.parse(responseBody);
      if (parsed?.error?.message) return String(parsed.error.message);
      if (parsed?.error) return String(parsed.error);
      if (parsed?.message) return String(parsed.message);
    } catch {
      // not JSON, use raw
    }
    return responseBody;
  }

  if (dataError?.message) return String(dataError.message);
  if (data?.message) return String(data.message);
  if (err.message) return String(err.message);

  try {
    return JSON.stringify(error);
  } catch {
    return 'OpenRouter rejected the request. Check your API key and selected model.';
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : [];
    const model = typeof body.model === 'string' ? body.model : '';
    const apiKey = process.env.OPENROUTER_API_KEY?.trim() ?? '';
    const assistantName = typeof body.assistantName === 'string' ? body.assistantName : 'Mira';
    const personality = typeof body.assistantPersonality === 'string' ? body.assistantPersonality : '';
    const responsePreferences = typeof body.responsePreferences === 'string' ? body.responsePreferences : '';
    const personalNotes = typeof body.personalNotes === 'string' ? body.personalNotes : '';
    const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
    const topP = typeof body.topP === 'number' ? body.topP : 0.9;

    if (!apiKey) {
      return Response.json(
        { error: 'The server is missing OPENROUTER_API_KEY. Add it to .env.local and restart the server.' },
        { status: 503 }
      );
    }

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      headers: {
        'HTTP-Referer': 'https://bolt.new',
        'X-Title': 'Bolt AI Chat',
      },
    });

    if (!model) {
      return new Response(JSON.stringify({ error: 'Choose a model before sending a message.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openrouter.chat(model),
      system: [
        `You are ${assistantName}, the user's personal AI assistant.`,
        personality && `Personality: ${personality}`,
        responsePreferences && `How the user prefers responses: ${responsePreferences}`,
        personalNotes && `User-provided context to remember: ${personalNotes}`,
      ].filter(Boolean).join('\n\n'),
      messages: modelMessages,
      maxOutputTokens: 4000,
      temperature,
      topP,
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('[chat] stream error:', error);
        return extractErrorMessage(error);
      },
    });
  } catch (error) {
    console.error('[chat] catch error:', error);
    return new Response(extractErrorMessage(error), {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
