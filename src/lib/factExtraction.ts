// 사용자 입력에서 팩트(사실) 추출 — 문맥 용해용

export interface ExtractedFacts {
  elderName: string | null;      // 어르신 이름 (예: 양OO)
  quantity: string | null;       // 수량 (예: 세 곡, 다섯 번)
  nickname: string | null;       // 별명 (예: 명가수, 춤꾼)
  action: string | null;         // 핵심 행동 (예: 노래를 부르다, 춤을 추다)
  emotion: string | null;        // 감정/반응 (예: 즐거워하다, 감격하다)
  context: string | null;        // 배경/맥락 (예: 젊었을 적, 친척 모임)
}

export const extractFactsFromInput = (input: string): ExtractedFacts => {
  // 이름 추출: 양OO, 김oo, 박○○ 등
  const nameMatch = input.match(/([가-힣]{1,2})[Ooㅇ○0]{1,2}\s*어르신?/);
  const elderName = nameMatch ? nameMatch[1] + 'OO' : null;

  // 수량 추출: 세 곡, 다섯 번, 여러 곡 등
  const quantityMatch = input.match(/(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|여러)\s*(곡|번|차례|개|가지)/);
  const quantity = quantityMatch ? quantityMatch[0] : null;

  // 별명/칭호 추출: 명가수, 춤꾼, 챔피언 등
  const nicknameMatch = input.match(/(명가수|춤꾼|챔피언|일등|최고|스타|인기인|분위기메이커)/);
  const nickname = nicknameMatch ? nicknameMatch[1] : null;

  // 핵심 행동 추출
  const actionPatterns = [
    { pattern: /노래.*부르|불러|부르시/, action: '노래를 부르시다' },
    { pattern: /춤.*추|추시/, action: '춤을 추시다' },
    { pattern: /그림.*그리|그리시/, action: '그림을 그리시다' },
    { pattern: /만들|만드시/, action: '작품을 만드시다' },
    { pattern: /운동|체조/, action: '몸을 움직이시다' },
    { pattern: /먹|드시/, action: '맛있게 드시다' },
    { pattern: /웃|웃으시/, action: '환하게 웃으시다' },
  ];
  let action: string | null = null;
  for (const ap of actionPatterns) {
    if (ap.pattern.test(input)) {
      action = ap.action;
      break;
    }
  }

  // 감정/반응 추출
  const emotionMatch = input.match(/(감격|즐거|행복|기뻐|신나|좋아|뿌듯|감동)/);
  const emotion = emotionMatch ? emotionMatch[1] : null;

  // 배경/맥락 추출
  const contextMatch = input.match(/(젊었을\s*(?:때|적|시절)|옛날에?|친척.*모임|가족.*모임|예전에?)/);
  const context = contextMatch ? contextMatch[0] : null;

  return { elderName, quantity, nickname, action, emotion, context };
};
