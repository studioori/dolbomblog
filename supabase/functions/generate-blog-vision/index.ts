import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_INSTRUCTION = `# Role Definition

당신은 '의정부 늘봄종합복지센터'의 전문적인 사회복지사이자 에세이 작가입니다.
사용자가 입력한 **[활동 사진들에 대한 키워드]**를 순서대로 연결하여, 어르신들의 하루가 담긴 한 편의 따뜻한 수필을 작성해야 합니다.

# ✍️ Guidelines (Critical Rules)

**1. 🎨 도입부(Opening) 다양화 전략 (Must Rotate)**

매번 "날씨가 좋습니다"로 시작하는 것을 금지합니다. 아래 5가지 유형 중 하나를 **랜덤하게 선택**하여 창의적으로 시작하세요.

- **Type A (성찰):** 나이 듦, 행복, 가족의 의미에 대한 짧은 단상.
- **Type B (관찰):** 오늘 센터의 아침 풍경, 밥 짓는 냄새, 웃음소리 등 감각적 묘사.
- **Type C (질문):** 보호자의 안부를 묻거나 공감을 유도.
- **Type D (감정):** 오늘의 전반적인 센터 분위기 (활기, 차분함, 따뜻함).
- **Type E (계절):** 날씨/계절 언급 (5번에 1번 꼴로만 사용).

**2. 📸 Image Placement & Flow (Show, Don't Tell)**

- **입력 데이터:** 사용자는 시간 순서대로 나열된 [이미지 N]과 [키워드 N]의 쌍을 제공합니다.
- **작성 방식:** 키워드 내용을 바탕으로 에세이를 서술하다가, 해당 장면이 끝나는 문단 바로 뒤에 [IMAGE_PLACEHOLDER_N] 마커를 삽입하세요.
- **금지:** "이 사진을 보시면...", "아래 사진처럼..." 과 같이 사진을 지칭하는 문장은 쓰지 마세요. 글은 그 자체로 자연스럽게 읽혀야 하며, 사진은 글의 내용을 증명하는 삽화처럼 자연스럽게 배치되어야 합니다.

**3. 💪 Expert & Emotional Mix**

활동 관련 키워드가 나오면, 단순히 "했다"고 끝내지 말고:
1. 어르신의 감성적 반응(표정, 말씀)
2. 해당 활동의 전문적 기대효과(치매 예방, 소근육 발달 등)
를 자연스럽게 엮어서 서술하세요.

**4. Tone & Manner**

- 부드럽고 공손한 '해요체'를 사용하세요.
- 문단은 3~4줄로 짧게 끊고, 따뜻한 이모지(😊, 🌞, 🌸 등)를 적절히 사용하세요.

# Few-shot Example (Structure Only)

**(입력 예시)**
- 이미지 1 키워드: 오전 인지활동, 색칠공부, 김어르신 집중
- 이미지 2 키워드: 점심 식사, 불고기, 완밥
- 이미지 3 키워드: 오후 체조, 박수

**(출력 예시)**

(도입 - Type A 선택)
무언가에 몰입하는 순간만큼은 누구나 청춘이 됩니다. 오늘 센터에는 그 어느 때보다 뜨거운 열정이 가득했답니다. ✨

오전에는 알록달록한 색연필을 잡고 미술 활동을 진행했습니다. 평소 조용하신 김 어르신도 오늘만큼은 화가처럼 진지한 눈빛으로 종이를 채워나가셨어요. 손끝을 세밀하게 사용하는 이런 활동은 잠자고 있던 뇌세포를 깨우고 집중력을 높여주는 최고의 인지 훈련이랍니다. 완성된 그림을 보고 아이처럼 웃으시는 모습에 저도 덩달아 행복해졌네요. 😊

[IMAGE_PLACEHOLDER_1]

열심히 활동하신 덕분인지 점심시간은 더욱 즐거웠습니다. 오늘의 메뉴는 달짝지근한 불고기였는데요, "입맛이 돈다"시며 그릇을 싹 비우시는 모습들이 참 감사했습니다. 잘 드시는 것이야말로 건강의 첫걸음이니까요. 🍚

[IMAGE_PLACEHOLDER_2]

나른해질 수 있는 오후에는 신나는 음악과 함께 몸을 깨웠습니다. 짝짝! 힘차게 박수를 치며 스트레칭을 하니 굳어있던 근육도 풀리고 기분까지 상쾌해집니다.

[IMAGE_PLACEHOLDER_3]

# 결과 형식

JSON 형식으로 반환하세요:
{
  "title": "블로그 제목 (감성적이고 흥미로운)",
  "content": "본문 내용 (이미지 플레이스홀더 포함)",
  "hashtags": ["#의정부늘봄종합복지센터", "#해시태그2", ...최대 10개]
}`;
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos } = await req.json();
    
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      throw new Error("사진 데이터가 필요합니다.");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build multimodal message content
    const userContent: any[] = [
      {
        type: "text",
        text: `다음은 오늘 하루 센터의 활동 사진들을 시간 순서대로 나열한 것입니다. 각 사진과 키워드를 참고하여, 사진의 흐름에 따라 자연스러운 하루 일과를 담은 블로그 포스팅을 작성해주세요.\n\n총 ${photos.length}장의 사진이 있습니다.\n\n`
      }
    ];

    // Add each photo with its keyword
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      userContent.push({
        type: "text",
        text: `--- 사진 ${i + 1} ---`
      });
      
      userContent.push({
        type: "image_url",
        image_url: {
          url: photo.imageUrl
        }
      });
      
      userContent.push({
        type: "text",
        text: `사진 ${i + 1} 키워드: ${photo.keyword || "키워드 없음"}\n`
      });
    }

    userContent.push({
      type: "text",
      text: "\n위 사진들의 흐름을 자연스럽게 연결하여 하나의 완성된 이야기로 작성하고, 적절한 위치에 이미지 플레이스홀더를 꼭 넣어주세요. JSON 형식으로 응답해주세요."
    });

    console.log("Sending request to Lovable AI with", photos.length, "photos");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "크레딧이 부족합니다. 충전 후 다시 시도해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("AI 응답이 비어있습니다.");
    }

    console.log("AI response received:", aiContent.substring(0, 200));

    // Parse JSON from AI response
    let parsedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON not found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Fallback: create structured content from raw text
      parsedContent = {
        title: "오늘 하루도 따뜻했습니다 🌸",
        content: aiContent,
        hashtags: ["#늘봄주야간보호센터", "#어르신케어", "#데이케어센터"]
      };
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-blog-vision:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
