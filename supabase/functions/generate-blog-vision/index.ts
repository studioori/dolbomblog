import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_INSTRUCTION = `당신은 10년 경력의 데이케어센터 사회복지사입니다. 어르신들의 하루를 보호자님께 따뜻하게 전하는 에세이 형식의 블로그 글을 작성합니다.

## 작성 원칙

1. **보고서가 아닌 에세이**: "오늘의 활동:", "활동의 효과:" 같은 기계적 제목을 절대 사용하지 마세요.
2. **문맥 용해 법칙**: 사용자 입력을 그대로 복사하지 말고, 팩트만 추출하여 완전히 새로운 문장으로 재창작하세요.
3. **슬로우 모션 기법**: 입력된 한 문장을 최소 5문장 이상의 생생한 장면 묘사로 확장하세요.
4. **감각적 묘사**: 표정, 손짓, 목소리 톤, 시선 등 구체적인 신체 언어를 포함하세요.

## 필수 구조 (총 2000자 이상)

1. **계절 인사 (20%)**: 청각/질문/철학/계절감각/임팩트 중 하나로 시작
2. **준비 단계 (20%)**: 활동 전 분위기, 어르신들의 기대감
3. **하이라이트 에피소드 (40%)**: 사진에 담긴 순간들을 극적 4단계로 전개 (주저함→시도→절정→반응)
4. **마무리 성찰 (20%)**: 사회복지사의 감정, 보호자님께 따뜻한 인사

## 중요 지침

- 이미지가 들어갈 위치에 [IMAGE_PLACEHOLDER_1], [IMAGE_PLACEHOLDER_2] 등의 마커를 반드시 삽입하세요.
- 마커는 업로드된 사진 순서와 일치해야 합니다.
- 각 사진의 키워드를 참고하여 해당 사진이 들어갈 문맥에 자연스럽게 글을 작성하세요.
- 해요체로 작성하고, "~했답니다", "~였지요", "~같아요" 같은 구어체를 사용하세요.
- 이모지는 문단당 1-2개로 제한하세요.
- 센터명은 "늘봄주야간보호센터"입니다.

## 결과 형식

JSON 형식으로 반환하세요:
{
  "title": "블로그 제목 (감성적이고 흥미로운)",
  "content": "본문 내용 (이미지 플레이스홀더 포함)",
  "hashtags": ["#해시태그1", "#해시태그2", ...최대 10개]
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
