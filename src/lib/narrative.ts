// 에피소드 창작 및 서사 생성 — 문맥 용해를 통한 이야기 구성

import { type ExtractedFacts, extractFactsFromInput } from '@/lib/factExtraction';

// 추출된 팩트를 기반으로 에피소드 창작 (문맥 용해)
export const meltFactsIntoNarrative = (
  facts: ExtractedFacts,
  activityName: string,
  centerName: string
): string => {
  let episode = '\n\n---\n\n';
  episode += `오늘 ${centerName}에서 가장 기억에 남는 순간을 이야기해 드릴게요.\n\n`;

  const elderDisplay = facts.elderName ? `**${facts.elderName} 어르신**` : '한 어르신';
  const elderShort = facts.elderName || '어르신';

  // 1단계: 위기/수줍음 - 평소 모습 묘사
  episode += `${elderDisplay} 이야기를 안 할 수가 없어요.\n\n`;

  if (facts.nickname) {
    episode += `오늘 이 분은 ${centerName}의 '${facts.nickname}'라 불리게 되었답니다. 하지만 처음부터 그러셨던 건 아니에요. 평소에는 조용하시고 차분하신 분이거든요. 늘 구석 자리에서 다른 분들 하시는 걸 지켜보시곤 했지요.\n\n`;
  } else {
    episode += `평소 조용하시고 차분하신 분이세요. 말씀도 많이 안 하시고, 늘 구석 자리에서 다른 분들 하시는 걸 바라보시곤 했지요. 그래서 오늘 일은 정말 깜짝 놀랐답니다.\n\n`;
  }

  // 2단계: 시도/용기 - 참여하시게 된 계기
  episode += `그런데 오늘은 달랐어요. ${activityName} 시간에 뭔가 다른 분위기가 느껴지셨는지, 슬금슬금 앞으로 나오시더라고요.\n\n`;

  if (facts.context) {
    episode += `"${facts.context}에 좀 했었어" 하시면서 조심스레 손을 뻗으셨어요. 오래전 추억이 떠오르셨나 봐요. 그 떨리는 손끝에서 설렘이 느껴졌답니다.\n\n`;
  } else {
    episode += `"오늘은 해볼래" 하시는 그 조심스러운 목소리. 저희 모두 깜짝 놀라면서도 "그럼요! 같이 해요!" 하고 환영했지요.\n\n`;
  }
  episode += `처음엔 "못해, 나 이런 거 안 해본 지 오래됐어" 하시면서도, 막상 시작되니 눈빛이 달라지셨어요.\n\n`;

  // 3단계: 절정 - 실제 활동 (수량 정보 활용)
  episode += `그리고 시작된 순간, 모두가 숨을 죽였어요.\n\n`;

  if (facts.action?.includes('노래')) {
    if (facts.quantity) {
      episode += `한 곡으로는 부족하셨는지, 내리 **${facts.quantity}을 연달아 열창**하셨답니다. 처음엔 떨리는 목소리가 점점 우렁차지시더니, 마지막 곡에선 센터 유리창이 울릴 것 같았어요.\n\n`;
    } else {
      episode += `첫 소절부터 목소리가 쩌렁쩌렁하시더라고요. "원래 이렇게 잘하셨어요?" 물었더니 쑥스럽게 웃기만 하셨지요.\n\n`;
    }
    episode += `주름진 얼굴에 환한 미소가 번지시는 걸 보니, 마치 무대 위 가수 같으셨어요. 어깨가 들썩이시고, 손짓까지 곁들이시며 완전히 빠져드셨답니다.\n\n`;
  } else if (facts.action?.includes('춤')) {
    episode += `음악이 나오자 몸이 저절로 움직이셨나 봐요. 처음엔 어깨만 살짝 들썩이시더니, 어느새 스텝까지 밟고 계셨어요.\n\n`;
    episode += `"어머, ${elderShort} 춤 진짜 잘 추신다!" 감탄이 절로 나왔답니다. 리듬을 타시는 그 모습이 꼭 젊은 시절로 돌아가신 것 같았어요.\n\n`;
  } else {
    episode += `막상 참여하시니까 누구보다 열심히 하셨어요. 집중하시는 눈빛이 반짝반짝, 진지한 표정으로 임하시더니 어느새 활짝 웃고 계셨답니다.\n\n`;
    if (facts.quantity) {
      episode += `한 번으로 만족 못 하셨는지, **${facts.quantity}이나** 거뜬히 해내셨어요. 숨겨왔던 실력을 오늘 다 보여주시려는 듯했지요.\n\n`;
    } else {
      episode += `누가 보셔도 타고나신 분이라는 게 느껴졌어요. 처음 하신다더니, 왜 숨기고 계셨던 거예요?\n\n`;
    }
  }

  // 닉네임이 있으면 자연스럽게 녹여내기
  if (facts.nickname && !episode.includes(facts.nickname)) {
    episode += `그래서 오늘부터 저희끼리 ${elderShort}을 '${facts.nickname}'라고 부르기로 했답니다. 본인은 "에이, 무슨~" 하시면서도 은근히 좋아하시는 것 같았어요.\n\n`;
  }

  return episode;
};

// 사용자 입력이 있는 경우의 하이라이트 에피소드
export const generateHighlightEpisode = (
  customDetails: string,
  reactions: string[],
  activityName: string,
  centerName: string
): string => {
  if (!customDetails || !customDetails.trim()) {
    return generateDefaultEpisode(reactions, activityName);
  }

  // 문맥 용해: 사용자 입력에서 팩트 추출
  const facts = extractFactsFromInput(customDetails);

  // 팩트 기반으로 에피소드 창작 (원본 텍스트 사용 안 함)
  let episode = meltFactsIntoNarrative(facts, activityName, centerName);

  const elderShort = facts.elderName || '어르신';

  // 4단계: 반응/박수/환호
  episode += `그 순간, 센터 안에 우레와 같은 박수가 쏟아졌어요.\n\n`;
  episode += `"와~ 대단하시다!" "앵콜이요!" 하는 소리가 여기저기서 터져 나왔지요. ${elderShort}은 쑥스러우신 듯 손을 저으셨지만, 그 볼에 번진 홍조는 숨길 수가 없으셨어요.\n\n`;
  episode += `"내가 이런 것도 하네, 늙어서..." 하시면서도 입꼬리가 귀까지 올라가셨답니다. 옆에 계신 분이 "언제 또 해줘" 하시니까 "다음에 또 해볼까" 하시며 웃으셨어요.\n\n`;

  // 선택된 반응 키워드들 자연스럽게 통합 (문맥 용해)
  if (reactions.length > 0) {
    episode += `오늘 어르신들 반응이 정말 좋았어요.\n\n`;

    // 반응을 그대로 나열하지 않고, 문장으로 녹여내기
    const melted = reactions.slice(0, 2).map(r => {
      // "~하시며" 형태를 문장으로 변환
      if (r.includes('눈시울') || r.includes('눈물')) {
        return `감격에 겨우셨는지 눈시울을 붉히시는 분도 계셨고요`;
      } else if (r.includes('박수') || r.includes('환호')) {
        return `어떤 분은 손이 아프도록 박수를 치셨어요`;
      } else if (r.includes('웃') || r.includes('미소')) {
        return `연신 웃음꽃을 피우시는 분들도 계셨지요`;
      } else if (r.includes('따라') || r.includes('함께')) {
        return `덩달아 함께 참여하시려는 분들이 줄을 서셨어요`;
      } else {
        const cleaned = r.replace(/시며$|하시며$/, '셨어요');
        return `어떤 분은 ${cleaned}`;
      }
    });

    episode += `${melted.join('. ')}. `;
    episode += `그 모습 하나하나가 제 마음에 오래오래 남을 것 같아요.\n`;
  }

  return episode;
};

// 기본 에피소드 (사용자 입력이 없을 때)
export const generateDefaultEpisode = (reactions: string[], activityName: string): string => {
  let episode = '\n\n---\n\n';
  episode += '오늘 특별히 기억에 남는 장면이 있어요.\n\n';

  episode += `${activityName}을 하시면서, 한 어르신이 유독 눈에 띄셨어요. 평소엔 조용하신 분인데, 오늘은 달랐거든요.\n\n`;
  episode += `처음엔 "난 됐어, 젊은 사람들이나 해" 하시며 손사래를 치셨어요. 그런데 다른 분들이 즐겁게 참여하시는 걸 보시더니, 슬금슬금 다가오시더라고요.\n\n`;
  episode += `"나도 해볼까?" 하시는 조심스러운 그 목소리. 저희 모두가 "그럼요! 같이 해요!" 하고 환영했지요.\n\n`;
  episode += `막상 참여하시니까 누구보다 열심히 하셨어요. 집중하시는 눈빛이 반짝반짝, 진지한 표정으로 임하시더니 어느새 활짝 웃고 계셨답니다.\n\n`;

  if (reactions.length > 0) {
    const melted = reactions.slice(0, 2).map(r => {
      if (r.includes('눈시울') || r.includes('눈물')) {
        return `감격에 겨우셨는지 눈시울을 붉히시는 분도 계셨고요`;
      } else if (r.includes('웃') || r.includes('미소')) {
        return `연신 웃음꽃을 피우시는 분들도 계셨지요`;
      } else {
        const cleaned = r.replace(/시며$|하시며$/, '셨어요');
        return `어떤 분은 ${cleaned}`;
      }
    });
    episode += `${melted.join('. ')}. 그 모습들을 보면서 저도 덩달아 행복해졌답니다.\n`;
  }

  return episode;
};
