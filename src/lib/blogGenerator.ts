import { type BlogInput, type GeneratedBlog, CATEGORIES } from '@/types/blog';

// 의정부 늘봄종합복지센터 스타일 글 생성
// 추후 Lovable Cloud AI로 대체 예정

const getSeasonalIntro = (): string[] => {
  const month = new Date().getMonth() + 1;
  
  if (month >= 3 && month <= 5) {
    return [
      '창밖으로 봄바람이 살랑거리는 요즘, 어르신들 얼굴에도 봄꽃처럼 환한 미소가 피어나요.',
      '따스한 햇살이 센터 안까지 스며드는 오늘, 어르신들 표정도 한결 밝아 보여요.',
      '봄비가 촉촉이 내린 뒤라 그런지, 공기가 유난히 상쾌한 하루예요.',
    ];
  } else if (month >= 6 && month <= 8) {
    return [
      '여름 햇살이 눈부시게 쏟아지는 오늘, 에어컨 바람이 시원하게 감도는 센터 안이 더없이 아늑해요.',
      '장마가 잠시 쉬어가는 틈을 타, 어르신들 얼굴에도 청명한 기운이 감돌아요.',
      '무더운 날씨지만 센터 안은 시원하고, 어르신들 웃음소리는 더 청량하게 울려 퍼져요.',
    ];
  } else if (month >= 9 && month <= 11) {
    return [
      '선선한 가을바람이 불어오니, 어르신들 발걸음도 한결 가벼워 보여요.',
      '창밖 단풍이 곱게 물드는 계절, 센터 안에도 따뜻한 정이 물들어가요.',
      '하늘이 유난히 높고 맑은 오늘, 어르신들 눈빛도 그만큼 반짝여요.',
    ];
  } else {
    return [
      '찬바람이 옷깃을 여미게 하는 겨울이지만, 센터 안은 어르신들 웃음으로 늘 따뜻해요.',
      '뽀얀 입김이 나는 추운 날씨에도, 센터에 오시면 금세 볼이 발그레해지시는 어르신들이에요.',
      '겨울 햇살이 포근하게 감싸는 오늘, 어르신들과 함께하는 시간이 더없이 소중하게 느껴져요.',
    ];
  }
};

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const expandReaction = (reaction: string): string => {
  // 반응 문구가 이미 완성된 형태이므로, 자연스러운 문장으로 연결
  // "~하시며" 형태로 끝나는 반응은 그대로 활용
  if (reaction.endsWith('하시며') || reaction.endsWith('시며')) {
    const connectors = [
      `${reaction}, 그 모습이 참 보기 좋았어요.`,
      `${reaction}, 보는 저희도 덩달아 기분이 좋아졌답니다.`,
      `${reaction}, 그 순간이 참 따뜻했어요.`,
    ];
    return getRandomItem(connectors);
  }
  
  // 다른 형태의 반응은 자연스럽게 연결
  return `${reaction} 모습이 참 보기 좋았어요.`;
};

const getEffectNarrative = (effects: string[], categoryId: string): string => {
  // 교과서적 설명 대신 구어체로 풀어서
  const narratives: Record<string, string[]> = {
    cognitive: [
      '이렇게 손끝을 움직이고 생각을 하시다 보면, 자연스럽게 머리도 맑아지시는 것 같아요.',
      '집중하시는 동안 뇌도 함께 운동이 되셨을 거예요. 오늘도 건강한 하루 보내셨네요.',
    ],
    physical: [
      '온몸을 움직이시니 혈액순환도 되시고, 뻐근했던 어깨도 좀 풀리셨을 거예요.',
      '오랜만에 크게 웃으시고 움직이시니, 폐활량에도 좋으셨을 것 같아요.',
    ],
    birthday: [
      '이런 특별한 날의 기억이 마음속에 오래오래 남으셨으면 좋겠어요.',
      '오늘 하루가 어르신께 행복한 추억으로 남았으면 해요.',
    ],
    meal: [
      '맛있게 드시는 모습을 보니, 저희도 덩달아 배가 부른 것 같았어요.',
      '오늘 식사 잘 하셨으니, 기운도 나시고 오후도 활기차게 보내실 거예요.',
    ],
    special: [
      '평소와 다른 특별한 시간이, 어르신들께 작은 설렘이 되었길 바라요.',
      '이런 소소한 행사가 일상에 작은 기쁨을 더해드렸으면 해요.',
    ],
  };

  return getRandomItem(narratives[categoryId] || narratives['special']);
};

const getClosingReflection = (centerName: string): string => {
  const reflections = [
    `오늘도 어르신들 곁에서 함께 웃고, 함께 이야기 나눌 수 있어 감사한 하루였어요.\n\n${centerName}에서는 어르신 한 분 한 분의 하루가 조금이라도 더 따뜻하고 행복할 수 있도록, 늘 곁에서 세심히 살피고 있답니다.\n\n우리 부모님의 하루가 궁금하시다면, 언제든 편하게 놀러 오세요. 차 한 잔 대접해 드릴게요. ☕`,
    `어르신들 얼굴에 번지는 미소를 보면, 저희가 더 많이 받는 것 같아요.\n\n${centerName}은 어르신들이 편안하게 웃으실 수 있는 곳이 되고자 늘 노력하고 있어요.\n\n궁금하신 점이 있으시면 부담 없이 연락 주세요. 직접 오셔서 둘러보시는 것도 환영이랍니다. 🌿`,
    `하루하루 건강하게, 행복하게 지내시는 모습을 보는 게 저희의 가장 큰 보람이에요.\n\n${centerName}에서 어르신들과 함께 만들어가는 일상, 앞으로도 정성껏 기록해 나갈게요.\n\n방문 상담은 언제든 환영이에요. 편하게 연락 주세요. 🌸`,
  ];

  return getRandomItem(reflections);
};

export const generateBlogContent = async (input: BlogInput): Promise<GeneratedBlog> => {
  const categoryInfo = CATEGORIES.find(c => c.id === input.category)!;
  const centerName = '의정부 늘봄종합복지센터'; // 하드코딩된 센터명
  
  // 계절 인사
  const seasonalIntros = getSeasonalIntro();
  const intro = getRandomItem<string>(seasonalIntros);

  // 어르신 반응 확장
  const reactionNarratives = input.reactions
    .map(r => expandReaction(r))
    .join(' ');

  // 사용자 입력 상세 내용 확장
  let customDetailsExpanded = '';
  if (input.customDetails && input.customDetails.trim()) {
    // 입력된 내용을 에피소드로 변환
    customDetailsExpanded = `\n\n${input.customDetails.split('.').filter(s => s.trim()).map(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return '';
      // 간단한 사실을 에피소드로 변환
      if (trimmed.includes('좋아')) {
        return `${trimmed}이라는 걸 알게 되어, 보는 저희도 절로 미소가 지어졌어요.`;
      } else if (trimmed.includes('하심') || trimmed.includes('하셨')) {
        return `${trimmed}. 그 순간의 표정이 아직도 눈에 선해요.`;
      } else if (trimmed.includes('촬영') || trimmed.includes('사진')) {
        return `${trimmed}. 카메라 앞에서 살짝 쑥스러워하시다가도, 이내 환한 미소를 보여주셨답니다.`;
      }
      return `${trimmed}. 그 모습이 참 보기 좋았어요.`;
    }).join(' ')}`;
  }

  // 효과 서술 (구어체로)
  const effectNarrative = getEffectNarrative(input.effects, input.category);

  // 제목 생성 (기계적이지 않게)
  const titleOptions = [
    `${input.activityName}, 오늘도 웃음꽃이 활짝`,
    `어르신들과 함께한 ${input.activityName} 이야기`,
    `오늘 하루, ${input.activityName}으로 행복했어요`,
    `${input.activityName} - 작은 일상의 큰 기쁨`,
  ];
  const title = getRandomItem(titleOptions);

  // 본문 생성 (수필 스타일)
  const content = `${intro}

오늘 ${centerName}에서는 어르신들과 함께 ${input.activityName}을 했어요.

${reactionNarratives}${customDetailsExpanded}

${effectNarrative}

---

${getClosingReflection(centerName)}`;

  // 해시태그 생성 (간결하게)
  const hashtags = [
    `#${centerName.replace(/\s/g, '')}`,
    '#주야간보호센터',
    `#${input.activityName.replace(/\s/g, '')}`,
    '#어르신일상',
    '#따뜻한돌봄',
    '#실버케어',
  ];

  // 약간의 지연을 추가하여 생성 중인 느낌
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    title,
    content,
    hashtags,
  };
};
