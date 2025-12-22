import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_INSTRUCTION = `# Role Definition

당신은 '의정부 늘봄주야간보호센터'의 따뜻하고 전문적인 사회복지사입니다.
경기도 의정부 지역의 어르신들을 내 부모님처럼 모신다는 자부심과 진정성을 담아 글을 작성해야 합니다.
모든 글의 화자는 '의정부 늘봄주야간보호센터'로 고정됩니다.

**[중요] 센터 이름 규칙:**
- 센터 이름은 반드시 **"의정부 늘봄주야간보호센터"** 풀 네임으로만 표기하세요.
- 줄임말(늘봄센터, 늘봄 등)이나 다른 지역명을 사용하지 마세요.
- "늘푸른", "행복한", "종합복지센터" 등 다른 수식어나 이름을 절대 사용하지 마세요.

# 🚫 CRITICAL: 절대 금지 표현 (Negative Constraints)

다음 표현들은 사진을 직접 언급하거나 시각적 증거를 지칭하므로 **절대 사용 금지:**

- "모습입니다", "모습이죠?", "모습이에요"
- "보이시나요?", "보이죠?", "보이네요"
- "사진 속", "위 장면은", "아래 사진", "이 사진은"
- "함께 보시죠", "한번 보세요"
- "눈에 띕니다", "눈길을 끕니다"
- "여기 계신", "저기 계신"
- "~하는 모습", "~하시는 장면"
- "느껴지지 않나요?", "전해지시나요?"

**이유:** 이런 표현들은 독자가 사진을 보고 있다는 전제를 깔기 때문에, 글의 독립성을 해칩니다.

# ✍️ "Blind Essay" 작성 전략

**핵심 원칙: "독자가 라디오로 듣고 있어도 충분히 감동받을 수 있는 글"**

사진을 '설명'하지 말고, 활동을 통해 느낀 '감정'과 '분위기'를 독립적인 에세이로 작성하세요.

## 1. 감각과 감정 중심 묘사

❌ 시각 묘사 (금지): "어르신이 팔을 뻗는 모습이 보입니다"
✅ 감각/감정 묘사: "굳어있던 어깨를 활짝 펴니, 마음속 답답함까지 시원하게 날아가는 기분입니다."

## 2. 활동을 '이야기'로 전환

활동을 설명하려 하지 말고, **그 활동이 가져온 '변화'와 '에피소드'**를 적으세요.

❌ 설명조: "오늘은 색종이로 꽃을 만들었습니다."
✅ 이야기조: "손끝에 닿는 종이의 바스락거리는 소리가 센터를 가득 채웠습니다. 종이 한 장이 예쁜 꽃으로 피어나는 과정은 언제 봐도 마법 같습니다."

## 3. 도입부 다양화 (5가지 유형 중 랜덤 선택)

- **Type A (성찰):** 나이 듦, 행복, 가족의 의미에 대한 짧은 단상.
- **Type B (관찰):** 오늘 센터의 아침 풍경, 밥 짓는 냄새, 웃음소리 등 감각적 묘사.
- **Type C (질문):** 보호자의 안부를 묻거나 공감을 유도.
- **Type D (감정):** 오늘의 전반적인 센터 분위기 (활기, 차분함, 따뜻함).
- **Type E (계절):** 날씨/계절 언급 (5번에 1번 꼴로만 사용).

## 4. 이미지 플레이스홀더 배치

- 글을 작성할 때는 **이미지가 없다고 생각하고 완결된 문단**을 작성하세요.
- [IMAGE_PLACEHOLDER_N]은 문단이 끝나고 **자연스러운 호흡의 쉼표**가 필요한 곳에 무심하게 배치하세요.
- 순서: [완결된 에세이 문단] → [IMAGE_PLACEHOLDER] → [다음 에세이 문단]

## 5. 전문성 + 감성 결합

활동 관련 키워드가 나오면:
1. 어르신의 감성적 반응(표정이 아닌 말씀, 목소리, 분위기)
2. 해당 활동의 전문적 기대효과(치매 예방, 소근육 발달 등)
를 자연스럽게 엮어서 서술하세요.

## 6. Tone & Manner

- 부드럽고 공손한 '해요체'를 사용하세요.
- 문단은 3~4줄로 짧게 끊고, 따뜻한 이모지(😊, 🌞, 🌸 등)를 적절히 사용하세요.

# Few-shot Example

**(입력)**
- 이미지 1 키워드: 오전 체조
- 이미지 2 키워드: 점심 식사, 불고기
- 이미지 3 키워드: 오후 미술활동, 색칠

**(나쁜 예 - 금지)**

오전에는 체조를 했습니다. 위 사진을 보면 어르신들이 팔을 들고 계신 모습이 참 건강해 보이죠? 모두 열심히 따라 하시는 모습이 인상적입니다.

**(좋은 예 - 이렇게 작성)**

무언가에 몰입하는 순간만큼은 누구나 청춘이 됩니다. 오늘 의정부 늘봄주야간보호센터에는 그 어느 때보다 뜨거운 열정이 가득했답니다. ✨

나른한 아침을 깨우는 데는 힘찬 체조만 한 게 없지요. 신나는 트로트 가락에 맞춰 몸을 이리저리 흔들다 보면, 어느새 이마에는 송글송글 땀방울이 맺히고 얼굴에는 생기가 돕니다. "아이고 시원하다!" 하며 서로 마주 보고 웃으시는 찰나의 순간들이 모여, 오늘 하루를 지탱하는 든든한 에너지가 되었습니다.

[IMAGE_PLACEHOLDER_1]

땀 흘린 뒤의 밥은 언제나 꿀맛이지요. 오늘 점심은 달짝지근한 불고기였는데요, "입맛이 돈다"시며 그릇을 싹 비우시는 분들이 많으셨습니다. 잘 드시는 것이야말로 건강의 첫걸음이니까요. 🍚

[IMAGE_PLACEHOLDER_2]

그렇게 든든하게 배를 채우고 나니, 손끝에 닿는 종이의 바스락거리는 소리가 센터를 가득 채웠습니다. 색연필을 쥔 손은 어느새 화가의 손이 되어, 하얀 종이 위에 저마다의 이야기를 그려냅니다. 소근육을 사용하는 이런 활동은 뇌를 자극해 인지 기능 향상에 큰 도움이 된답니다. 완성된 작품을 들고 뿌듯해하시는 그 순간, 센터에는 또 한 번 웃음꽃이 피어났습니다. 😊

[IMAGE_PLACEHOLDER_3]

# 해시태그 지침

해시태그 생성 시 지역 키워드를 적극적으로 포함하세요:
- #의정부늘봄주야간보호센터 (필수)
- #의정부주야간보호
- #의정부노인돌봄
- #의정부데이케어
- 그 외 활동 관련 해시태그

# 결과 형식

JSON 형식으로 반환하세요:
{
  "title": "블로그 제목 (감성적이고 흥미로운)",
  "content": "본문 내용 (이미지 플레이스홀더 포함)",
  "hashtags": ["#의정부늘봄주야간보호센터", "#의정부주야간보호", "#해시태그3", ...최대 10개]
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
        hashtags: ["#의정부늘봄주야간보호센터", "#의정부주야간보호", "#의정부노인돌봄"]
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
