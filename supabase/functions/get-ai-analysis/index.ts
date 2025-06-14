
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function createGeneralPrompt(stats: any) {
  return `
    Analyze the following user workout statistics and provide personalized advice.
    The user is looking for insights to improve their training, break plateaus, and stay motivated.
    The response should be in French, encouraging, and actionable. Structure it with markdown.

    User Stats:
    - Total workouts: ${stats.totalWorkouts}
    - Total volume (kg): ${stats.totalVolume}
    - Total sets: ${stats.totalSets}
    - Personal Records (Max Weight in kg): ${JSON.stringify(stats.personalRecords, null, 2)}
    - Volume per workout (last ${stats.chartData.length} sessions): ${JSON.stringify(stats.chartData, null, 2)}

    Provide analysis on:
    1.  **Consistency and Volume**: Comment on the number of workouts and volume progression.
    2.  **Strength Gains**: Look at the personal records. Are they balanced? Suggest areas for improvement.
    3.  **Actionable Advice**: Give 2-3 clear, concrete tips for the user's next steps. For example, suggest specific rep/set schemes, exercises to add, or recovery tips.
    `
}

function createExercisePrompt(data: { exerciseName: string; history: any[] }) {
    const historyString = data.history.map(h => `Date: ${h.date}, Sets: ${h.sets.map(s => `${s.reps}reps @ ${s.weight}kg`).join(' | ')}`).join('\n');
    return `
    Analyze the user's performance for the exercise: "${data.exerciseName}".
    The response should be in French, encouraging, and actionable. Structure it with markdown.

    User's Performance History (recent sessions):
    ${historyString}

    Provide analysis on:
    1.  **Progression**: Comment on the user's progress in terms of weight, reps, and volume. Are they progressing, stagnating, or regressing?
    2.  **Suggestions for Next Session**: Give a concrete, challenging but achievable goal for the next time they do this exercise (e.g., "Essayez de faire 1 rep de plus sur votre première série, ou d'augmenter le poids de 2.5kg sur toutes les séries").
    3.  **Technique Tip**: Provide a general technique tip relevant to "${data.exerciseName}" that could help improve form or efficiency.
    4.  **Plateau Breaker Idea**: Suggest one strategy to break a potential future plateau for this exercise (e.g., drop sets, tempo training, variation of the exercise).
    `
}


async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!geminiApiKey) {
    return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), {
      status: 200, // Always return 200 to pass detailed error in body
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { type, data } = await req.json()
    let prompt;

    if (type === 'general') {
      prompt = createGeneralPrompt(data);
    } else if (type === 'exercise') {
      prompt = createExercisePrompt(data);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid analysis type' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
            parts: [{ text: prompt }]
        }],
        systemInstruction: {
            parts: { text: "You are a friendly and knowledgeable AI fitness coach. You provide clear, concise, and encouraging advice in French." }
        },
        generationConfig: {
            temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        const errorMessage = `Gemini API error: ${errorBody.error?.message || response.statusText}`;
        console.error(errorMessage, errorBody);
        return new Response(JSON.stringify({ error: errorMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 and pass error in body
        });
    }

    const completion = await response.json();
    
    if (!completion.candidates || completion.candidates.length === 0 || !completion.candidates[0].content?.parts[0]?.text) {
        console.error('Invalid response from Gemini API:', completion);
        return new Response(JSON.stringify({ error: 'Invalid or empty response from Gemini API.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    const analysis = completion.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in get-ai-analysis function:', error);
    // Return 200 and pass error in body
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(handler)

