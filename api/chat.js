// ======================================================
// Students Homework AI
// Version 5.2
// api/chat.js
// ======================================================

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export default async function handler(
    req,
    res
) {

    // ---------------------------------------------
    // Allow POST only
    // ---------------------------------------------

    if (req.method !== "POST") {

        return res.status(405).json({

            error:
                "Method Not Allowed"

        });

    }

    try {

        const {

            studentClass,

            subject,

            question,

            language

        } = req.body;

        if (!question) {

            return res.status(400).json({

                error:
                    "Question is required."

            });

        }

        // ---------------------------------------------
        // System Prompt
        // ---------------------------------------------

        const prompt = `

You are Students Homework AI.

You are an expert CBSE teacher.

Always answer according to the latest NCERT syllabus.

Student Class:
${studentClass}

Subject:
${subject}

Question:
${question}

Rules:

1. Explain in simple language suitable for Class ${studentClass} students.

2. Give accurate and complete answers.

3. Show important formulas whenever needed.

4. Solve Maths step by step.

5. Explain Science with easy examples.

6. Give grammar-correct English.

7. If language is English, answer only in English.

8. If language is Hindi, answer only in Hindi.

Language:
${language}

`;

        // ---------------------------------------------
        // Gemini Request
        // ---------------------------------------------

        const response =
            await fetch(

                `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        contents: [

                            {

                                parts: [

                                    {

                                        text:
                                            prompt

                                    }

                                ]

                            }

                        ]

                    })

                }

            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(data);

            return res.status(500).json({

                error:
                    "Gemini API Error"

            });

        }

        const answer =

            data?.candidates?.[0]?.content?.parts?.[0]?.text ||

            "No answer generated.";

        return res.status(200).json({

            answer

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            error:
                error.message

        });

    }

}
