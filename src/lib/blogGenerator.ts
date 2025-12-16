import { type BlogInput, type GeneratedBlog, CATEGORIES } from '@/types/blog';

// 의정부 늘봄종합복지센터 스타일 글 생성
// 10년차 베테랑 사회복지사의 감성 에세이 스타일

const getSeasonalIntro = (): string => {
  const month = new Date().getMonth() + 1;
  
  const intros: Record<string, string[]> = {
    spring: [
      '창밖으로 봄바람이 살랑살랑 불어오는 요즘이에요. 센터 앞 개나리도 슬슬 노란 고개를 내밀기 시작했답니다. 이런 날이면 어르신들 발걸음도 한층 가벼워지시는 것 같아요.',
      '따스한 햇살이 거실 창문으로 쏟아지는 오늘, 어르신들 표정에도 봄꽃처럼 환한 미소가 피어났답니다. 겨우내 움츠렸던 어깨들이 조금씩 펴지시는 게 눈에 보여요.',
      '봄비가 촉촉이 내린 뒤라 그런지, 공기가 유난히 상쾌한 하루였어요. 센터에 들어서시는 어르신들마다 "오늘 날씨 참 좋다"며 인사를 건네셨지요.',
    ],
    summer: [
      '여름 햇살이 눈부시게 쏟아지는 오늘이에요. 에어컨 바람이 시원하게 감도는 센터 안은 한여름 더위를 피한 작은 오아시스 같답니다. 어르신들도 "집에 있는 것보다 여기가 낫다"며 웃으셨어요.',
      '장마가 잠시 쉬어가는 틈을 타 햇빛이 반짝 고개를 내민 오늘이었어요. 어르신들 얼굴에도 청명한 기운이 감돌아, 보는 저희 마음까지 환해지더라고요.',
      '무더운 날씨지만 센터 안은 시원하고, 어르신들 웃음소리는 어느 때보다 청량하게 울려 퍼졌답니다. 땀을 닦으시며 들어오셨다가도 금세 표정이 밝아지시는 모습이 참 좋았어요.',
    ],
    autumn: [
      '선선한 가을바람이 창문 사이로 살짝 불어오는 오늘이에요. 창밖 나뭇잎들이 조금씩 울긋불긋 옷을 갈아입기 시작했더라고요. 어르신들도 "가을이 오니 기분이 좋다"며 한결 부드러운 미소를 지으셨답니다.',
      '하늘이 유난히 높고 맑은 오늘, 어르신들 눈빛도 그만큼 반짝였어요. "이런 날엔 옛날 생각이 난다"며 추억을 꺼내 놓으시는 분들도 계셨지요.',
      '창밖 단풍이 곱게 물드는 계절이에요. 센터 안에도 어르신들 사이에 따뜻한 정이 물들어가는 것 같아, 보는 저희 마음이 포근해지더라고요.',
    ],
    winter: [
      '찬바람이 옷깃을 여미게 하는 겨울이지만, 오늘 센터 안은 어르신들 웃음으로 늘 따뜻하답니다. 뽀얀 입김을 내뿜으시며 들어오셨다가도, 금세 볼이 발그레해지시는 어르신들이에요.',
      '겨울 햇살이 포근하게 내려앉은 오늘 오후였어요. 창밖엔 차가운 바람이 불지만, 센터 안은 온기로 가득 찼답니다. 어르신들과 둘러앉아 나누는 이야기에 시간이 어떻게 가는지 모르겠더라고요.',
      '눈이 올 것만 같은 잿빛 하늘 아래, 센터에 들어서면 따뜻한 온기와 함께 어르신들의 밝은 목소리가 반겨줍니다. "오늘도 왔어요" 하시며 손을 흔들어 주시는 그 모습에 괜히 눈시울이 뜨거워지더라고요.',
    ],
  };

  let season = 'spring';
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'autumn';
  else season = 'winter';

  const seasonIntros = intros[season];
  return seasonIntros[Math.floor(Math.random() * seasonIntros.length)];
};

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// 반응 키워드를 풍부한 서사로 확장
const expandReactionToNarrative = (reactions: string[], activityName: string): string => {
  if (reactions.length === 0) return '';

  const narrativeTemplates = [
    // 첫 번째 반응 확장
    (r: string) => `특히 인상 깊었던 건, ${r.replace(/시며$|하시며$/, '시는')} 어르신들의 모습이었어요. 그 표정을 보는 순간, '아, 오늘도 보람찬 하루가 되겠구나' 싶었답니다.`,
    (r: string) => `${r.replace(/시며$|하시며$/, '셨는데요')}, 그 모습이 어찌나 보기 좋던지요. 옆에서 지켜보는 저희까지 덩달아 미소가 지어졌어요.`,
    (r: string) => `한 어르신께서는 ${r.replace(/시며$|하시며$/, '셨어요')}. 그 진심 어린 모습에 저도 모르게 코끝이 찡해지더라고요.`,
  ];

  const additionalNarratives = [
    // 추가 반응들 확장
    (r: string) => `또 어떤 분은 ${r.replace(/시며$|하시며$/, '셨답니다')}. 평소 과묵하시던 분인데, 오늘따라 유독 적극적이셨지요.`,
    (r: string) => `옆자리 어르신은 ${r.replace(/시며$|하시며$/, '셨어요')}. 그 모습을 본 다른 분들도 따라 웃으시며 분위기가 한층 밝아졌답니다.`,
    (r: string) => `어느 분은 ${r.replace(/시며$|하시며$/, '셨는데')}, 그 순간만큼은 세상 근심 걱정 다 잊으신 듯했어요.`,
  ];

  let result = '\n\n';
  result += getRandomItem(narrativeTemplates)(reactions[0]);

  if (reactions.length > 1) {
    result += '\n\n';
    result += additionalNarratives[Math.floor(Math.random() * additionalNarratives.length)](reactions[1]);
  }

  if (reactions.length > 2) {
    const remaining = reactions.slice(2);
    const connectingPhrases = [
      `그 외에도 ${remaining.map(r => r.replace(/시며$|하시며$/, '시는')).join(', ')} 분들이 계셨어요.`,
      `${remaining.map(r => r.replace(/시며$|하시며$/, '시는')).join(', ')} 어르신들의 모습도 참 보기 좋았답니다.`,
    ];
    result += ' ' + getRandomItem(connectingPhrases);
  }

  return result;
};

// 사용자 입력 상세 내용을 에피소드로 대폭 확장
const expandCustomDetailsToEpisode = (details: string, activityName: string): string => {
  if (!details || !details.trim()) return '';

  const sentences = details.split(/[.!?]/).filter(s => s.trim());
  if (sentences.length === 0) return '';

  let expanded = '\n\n---\n\n';
  expanded += '오늘 특별히 기억에 남는 순간이 있었어요.\n\n';

  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    // 이름이 언급된 경우 (김OO, 박OO 등)
    const nameMatch = trimmed.match(/([가-힣]{1,2}[OO○○]{0,2})\s*어르신/);
    const name = nameMatch ? nameMatch[1] : null;

    // 다양한 확장 패턴
    if (name) {
      const nameExpansions = [
        `평소 ${name} 어르신은 조용하신 편인데, 오늘은 달랐어요. ${trimmed.replace(name + ' 어르신', '그분이')}. 주름진 눈가에 맺힌 웃음이 어찌나 고우시던지, 저도 모르게 한참을 바라보게 되더라고요.`,
        `${name} 어르신 이야기를 안 할 수가 없어요. ${trimmed}. "이 나이에 이런 호강을 다 한다"며 제 손을 꼭 잡아주셨는데, 그 따뜻한 온기가 아직도 느껴지는 것 같아요.`,
        `오늘의 주인공은 단연 ${name} 어르신이셨어요. ${trimmed}. 처음엔 쑥스러워하시더니, 점점 눈빛이 반짝이시는 게 보였답니다. 젊은 시절로 돌아가신 것 같다며 활짝 웃으셨지요.`,
      ];
      expanded += getRandomItem(nameExpansions);
    } else if (trimmed.includes('좋아') || trimmed.includes('맛있')) {
      expanded += `${trimmed}이라는 걸 알게 된 순간이었어요. 그 환한 미소를 보니, 저희가 더 많이 받는 것 같았답니다. "다음에도 이거 해줘"라며 조르시는 모습이 어린아이 같으셨지요.`;
    } else if (trimmed.includes('촬영') || trimmed.includes('사진')) {
      expanded += `${trimmed}. 카메라 앞에서 처음엔 "아이고, 내 얼굴이 뭐라고" 하시며 손사래를 치셨어요. 그런데 막상 찍으려니까 브이 포즈까지 취해 주시더라고요. 쭈글쭈글하지만 세상에서 가장 따뜻한 손으로 만든 하트, 그게 참 예뻤답니다.`;
    } else if (trimmed.includes('노래') || trimmed.includes('춤') || trimmed.includes('공연')) {
      expanded += `${trimmed}. 평소엔 "나는 못해" 하시던 분이셨는데, 막상 시작하시니 왕년의 실력이 유감없이 발휘되셨어요. 떨리는 손끝과 달리 목소리엔 힘이 있으셨고, 듣는 모든 분들이 숨을 죽이고 귀 기울였답니다. 끝나고 터져 나온 박수 소리가 아직도 귓가에 맴돌아요.`;
    } else if (trimmed.includes('케이크') || trimmed.includes('생일') || trimmed.includes('축하')) {
      expanded += `${trimmed}. 촛불 앞에서 두 손 모아 소원을 비시던 그 모습이 눈에 선해요. 무슨 소원을 비셨냐고 여쭤보니, "여기 있는 사람들 다 건강하게 해달라고 빌었지" 하시더라고요. 괜히 코끝이 찡해졌답니다.`;
    } else {
      const generalExpansions = [
        `${trimmed}. 그 순간 센터 안에 퍼진 웃음소리가 아직도 귓가에 맴돌아요. 이렇게 소소한 일상이 얼마나 소중한지, 다시 한번 깨닫게 되는 하루였답니다.`,
        `${trimmed}. 옆에서 지켜보던 저도 덩달아 미소가 지어졌어요. 어르신들의 행복이 저희의 행복이니까요.`,
        `${trimmed}. 그 모습을 보시던 다른 어르신들도 연신 고개를 끄덕이시며 공감하셨어요. 이런 게 바로 '함께'의 힘이 아닐까요.`,
      ];
      expanded += getRandomItem(generalExpansions);
    }

    if (index < sentences.length - 1) {
      expanded += '\n\n';
    }
  });

  return expanded;
};

// 활동별 현장 스케치 생성
const generateActivitySketch = (activityName: string, categoryId: string): string => {
  const sketches: Record<string, string[]> = {
    cognitive: [
      `오늘 ${activityName} 시간이었어요. 탁자 위에 준비물들을 펼쳐놓자, 어르신들 눈빛이 반짝반짝 빛나셨답니다. "이게 뭐야, 재밌겠다!" 하시며 다가오시는 분, 안경을 고쳐 쓰시며 꼼꼼히 살펴보시는 분, 벌써부터 손이 근질거리신다며 웃으시는 분까지. 기대감으로 가득 찬 거실 분위기가 참 좋았어요.`,
      `${activityName}을 시작하기 전, 어르신들께 오늘 뭘 할 건지 설명해 드렸어요. "어휴, 이걸 우리가 할 수 있을까?" 하시면서도 눈은 벌써 호기심으로 가득하셨지요. 연필을 쥐시고, 종이를 펼치시고... 어느새 센터 안이 진지한 열기로 가득 찼답니다.`,
    ],
    physical: [
      `오늘은 ${activityName} 시간! 체조 음악이 흘러나오자 어르신들 어깨가 절로 들썩이셨어요. "자, 다 같이 팔 위로!" 선생님 구령에 맞춰 하나둘 움직이시는 모습이 참 활기차셨답니다. 처음엔 뻣뻣하시던 관절도 금세 부드러워지시더라고요.`,
      `${activityName}을 위해 다 같이 둥글게 모였어요. "오늘은 내가 일등이다!" 하시며 의욕을 보이시는 분, "천천히 해야지" 하시며 차분하게 준비하시는 분. 각자의 속도로 시작하셨지만, 어느새 다 함께 박자를 맞추고 계셨지요.`,
    ],
    event: [
      `오늘은 특별한 날이에요. ${activityName}이 있는 날이거든요! 아침부터 센터 분위기가 달랐답니다. 평소보다 일찍 오신 분들, 머리를 단정히 빗으신 분들, 설레는 마음이 얼굴에 그대로 묻어나셨어요.`,
      `${activityName}을 위해 거실을 꾸미는데, 어르신들이 하나둘 모여드셨어요. "와, 잔치 분위기네!" "오늘 뭔가 특별한 거 있어?" 기대 가득한 눈빛들. 그 설렘이 저희에게도 전해지더라고요.`,
    ],
    meal: [
      `오늘 점심은 ${activityName}이에요! 맛있는 냄새가 솔솔 퍼지자, 어르신들이 "오늘 뭐야, 뭐야?" 하시며 두리번거리셨어요. 식탁에 둘러앉으시는 모습이 대가족 명절 같았답니다.`,
      `${activityName} 시간이 돌아왔어요. 밥그릇 뚜껑을 여시는 순간, "우와!" 하는 탄성이 터져 나왔답니다. 정성껏 차려진 밥상 앞에서 어르신들 눈이 휘둥그레지셨지요.`,
    ],
    birthday: [
      `오늘은 정말 특별한 날이에요. 바로 ${activityName}이 있는 날이거든요! 케이크에 초를 꽂고, 풍선도 달고, 생일 축하 현수막도 걸었답니다. 주인공 어르신께선 "이게 다 나 때문이야?" 하시며 연신 손사래를 치셨지만, 그 미소는 감출 수가 없으셨어요.`,
      `${activityName} 준비를 마치고 주인공 어르신을 모셔왔어요. 문을 열고 들어오시는 순간, "생일 축하합니다~" 노래가 울려 퍼졌지요. 깜짝 놀라시더니, 이내 눈물을 글썽이셨답니다. "내가 이런 대접을 다 받아보네" 하시던 그 목소리가 아직도 귓가에 남아있어요.`,
    ],
  };

  const categorySketchList = sketches[categoryId] || sketches['event'];
  return categorySketchList[Math.floor(Math.random() * categorySketchList.length)];
};

// 마무리 성찰 생성
const generateClosingReflection = (activityName: string): string => {
  const reflections = [
    `오늘 하루도 이렇게 저물어가네요.\n\n어르신들 손을 잡아드리며 "오늘 즐거우셨어요?"하고 여쭤보니, "당연하지, 매일 이랬으면 좋겠다"며 웃으셨어요. 그 말씀이 저희에겐 가장 큰 보람이랍니다.\n\n의정부 늘봄종합복지센터에서는 이렇게 어르신 한 분 한 분의 하루가 조금이라도 더 따뜻하고 행복할 수 있도록, 늘 곁에서 세심히 살피고 있어요.\n\n우리 부모님의 하루가 궁금하시다면, 언제든 편하게 놀러 오세요. 차 한 잔과 함께, 오늘의 이야기를 들려드릴게요. ☕`,
    
    `어르신들 얼굴에 번지는 미소를 볼 때마다, 저희가 더 많이 받는 것 같아요.\n\n퇴근 준비를 하며 오늘을 돌아보니, 웃음소리, 박수 소리, 도란도란 이야기 나누시던 목소리들이 떠올라요. 이런 순간들이 모여 어르신들의 하루를, 그리고 저희의 하루를 채워가는 거겠지요.\n\n의정부 늘봄종합복지센터는 어르신들이 편안하게 웃으실 수 있는 곳이 되고자 늘 노력하고 있어요.\n\n궁금하신 점이 있으시면 부담 없이 연락 주세요. 직접 오셔서 함께하시는 것도 언제든 환영이랍니다. 🌿`,
    
    `하루하루 건강하게, 행복하게 지내시는 모습을 보는 게 저희의 가장 큰 기쁨이에요.\n\n오늘도 "내일 또 와야지" 하시며 손 흔들어 주시는 어르신들. 그 한마디가 저희에겐 내일 또 열심히 해야겠다는 힘이 된답니다.\n\n의정부 늘봄종합복지센터에서 어르신들과 함께 만들어가는 일상, 앞으로도 정성껏 기록해 나갈게요.\n\n방문 상담은 언제든 환영이에요. 편하게 연락 주세요. 🌸`,
  ];

  return '\n\n---\n\n' + getRandomItem(reflections);
};

export const generateBlogContent = async (input: BlogInput): Promise<GeneratedBlog> => {
  const categoryInfo = CATEGORIES.find(c => c.id === input.category)!;
  const centerName = '의정부 늘봄종합복지센터';
  
  // 1. 도입 (계절감 & 인사)
  const intro = getSeasonalIntro();

  // 2. 전개 1: 현장 스케치 (활동명 + 분위기)
  const activitySketch = generateActivitySketch(input.activityName, input.category);

  // 3. 반응 키워드를 서사로 확장
  const reactionNarrative = expandReactionToNarrative(input.reactions, input.activityName);

  // 4. 전개 2: 하이라이트 - 사용자 입력 에피소드 확장 (글의 50%)
  const episodeExpansion = expandCustomDetailsToEpisode(input.customDetails, input.activityName);

  // 5. 마무리 (여운)
  const closing = generateClosingReflection(input.activityName);

  // 제목 생성 (감성적으로)
  const titleOptions = [
    `${input.activityName}, 오늘도 우리 어르신들 웃음꽃이 활짝`,
    `어르신들과 함께한 ${input.activityName} - 작은 일상의 큰 행복`,
    `오늘 하루, ${input.activityName}으로 가득 찬 웃음`,
    `${centerName}의 하루 | ${input.activityName} 이야기`,
    `따뜻했던 오늘, ${input.activityName}과 함께`,
  ];
  const title = getRandomItem(titleOptions);

  // 본문 조합
  const content = `${intro}

${activitySketch}
${reactionNarrative}
${episodeExpansion}
${closing}`;

  // 해시태그
  const hashtags = [
    `#${centerName.replace(/\s/g, '')}`,
    '#주야간보호센터',
    `#${input.activityName.replace(/\s/g, '')}`,
    '#어르신일상',
    '#따뜻한돌봄',
    '#노인복지',
    '#실버케어',
    '#데이케어센터',
  ];

  // 생성 중 효과를 위한 지연
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    title,
    content,
    hashtags,
  };
};
