import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message } = await request.json();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },  
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ]
        }),
      }
    );

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    return NextResponse.json({
      response: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No Response",
    });
    

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch Gemini API" },
      { status: 500 }
    );
  }
}
