import { type BlogInput, type GeneratedBlog, CATEGORIES } from '@/types/blog';

// 치과 블로그 글 생성기
// 'Storyteller' Protocol - 따뜻한 치과 의료진의 감성 에세이 스타일

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// ============================================================
// 1. 도입부 랜덤 선택 (5가지 스타일)
// ============================================================
const generateRandomOpening = (centerName: string): string => {
  const styles = [
    () => {
      const openings = [
        `"안녕하세요~" 밝은 인사와 함께 병원 문을 여신 환자분.\n\n오늘도 이렇게, ${centerName}의 하루가 시작되었어요. 로비에서 대기하시는 분들의 대화 소리, 간호사들의 상냥한 목소리... 평범하지만 특별한 하루의 시작이랍니다.`,
        `"선생님, 오늘 진료 잘 부탁드려요~"\n\n아침 일찍부터 ${centerName}를 찾아주신 환자분의 따뜻한 미소. 치과에 대한 두려움보다는 기대감이 더 크신 것 같았어요.`,
        `대기실에서 잡지를 넘기시는 환자분의 모습이 보여요.\n\n"곧 제 차례인가요?" 하시며 긴장된 듯 물으시는 목소리. "네, 금방 모시겠습니다"라는 간호사의 안심시키는 말에 표정이 한결 편안해지시더라고요.`,
      ];
      return getRandomItem(openings);
    },
    () => {
      const openings = [
        `치과, 많이 망설이셨죠?\n\n"언제 가야 하나..." 미루고 미루다가 결국 용기 내어 문을 두드리신 분들이 참 많아요. 그 마음, 저희도 잘 알아요. 오늘 ${centerName}를 찾아주신 환자분도 그런 마음으로 오셨을지도 모르겠어요.`,
        `"치과 가는 게 무서워서..." 그 마음 정말 이해해요.\n\n어릴 때 무서웠던 기억, 아픈 기억 때문에 치과를 피하게 되는 분들 정말 많으시거든요. 그래서 ${centerName}에서는 환자분들이 편안하게 진료받으실 수 있도록 세심하게 신경 쓰고 있어요.`,
        `치아 통증, 밤마다 잠 설치게 하셨죠?\n\n"병원 가야지" 하면서도 미루고 미루다, 이제는 정말 참을 수 없어 오신 분들도 계실 거예요. 빨리 와주셔서 감사해요.`,
      ];
      return getRandomItem(openings);
    },
    () => {
      const openings = [
        `"미소가 참 예쁘시네요." 누군가에게서 이런 말을 들어본 적 있으신가요?\n\n건강한 치아, 자신 있는 미소는 삶을 바꿉니다. 대화할 때 당당해지고, 사진 찍을 때 활짝 웃을 수 있고, 좋아하는 음식을 마음껏 즐길 수 있죠.`,
        `치아 하나가 삶을 바꿀 수 있다는 걸 아시나요?\n\n웃을 때 손으로 입을 가리던 분이 활짝 웃게 되고, 딱딱한 음식을 피하던 분이 좋아하는 음식을 다시 찾게 되는 순간들. ${centerName}에서는 매일 그런 변화를 목격해요.`,
        `"젊었을 때는 몰랐는데, 치아가 이렇게 중요한 건 줄."\n\n어느 환자분께서 하신 말씀이에요. 건강한 치아는 삶의 질과 직결되죠.`,
      ];
      return getRandomItem(openings);
    },
    () => {
      const month = new Date().getMonth() + 1;
      let seasonDetails: string[];
      
      if (month >= 3 && month <= 5) {
        seasonDetails = [
          `봄바람이 불어오는 계절이에요.\n\n거리에는 벚꽃이 흩날리고, 사람들의 옷차림도 한결 가벼워졌죠. "올해는 활짝 웃어보고 싶어요" 하시며 찾아오신 환자분이 생각나요.`,
          `따스한 햇살이 병원 창가로 스며들어요.\n\n"날도 좋은데 어디 놀러 가고 싶어요" 하시던 환자분. 건강한 미소로 봄을 맞이하실 수 있도록, 오늘도 최선을 다하고 있어요.`,
        ];
      } else if (month >= 6 && month <= 8) {
        seasonDetails = [
          `무더운 여름, 시원한 아이스크림이 생각나시죠?\n\n"찬걸 먹으면 이가 시려서..." 그러시며 아쉬워하시던 환자분들이 떠올라요. ${centerName}에서는 그 소박한 행복을 되찾아드리기 위해 노력하고 있어요.`,
          `여름 휴가철이 다가오고 있어요.\n\n"바다 가서 사진도 예쁘게 찍고 싶은데..." 하시며 치아 교정을 고민하시던 분도 계셨죠. 건강한 미소로 여름을 보내셨으면 좋겠어요.`,
        ];
      } else if (month >= 9 && month <= 11) {
        seasonDetails = [
          `상큼한 가을 과일이 제철이에요.\n\n"사과 먹고 싶은데 씹기가 힘들어서..." 그러시던 환자분의 말씀이 기억나요. 이 풍요로운 계절을 건강한 치아로 즐기셨으면 해요.`,
          `하늘이 유독 높고 푸른 날이 많아졌어요.\n\n"가을엔 사람이 건강해진다" 하시며 병원을 찾으시는 분들도 늘었어요. 오늘도 가을처럼 풍성한 하루를 만들어보고 있어요.`,
        ];
      } else {
        seasonDetails = [
          `따뜻한 국물 한 그릇이 생각나는 계절이에요.\n\n"겨울엔 뜨끈한 국밥이지" 하시던 환자분. 이 겨울, 따뜻한 음식과 함께 건강한 미소도 되찾으셨으면 좋겠어요.`,
          `창밖으로 흩날리는 눈송이가 예뻐요.\n\n한 해가 저무는 이 계절, "올해는 건강 챙기겠다고 다짐했는데..." 후회하시는 분들도 계실 거예요. 새해를 맞이하는 건강한 미소, 지금부터 시작해도 충분합니다.`,
        ];
      }
      return getRandomItem(seasonDetails);
    },
    () => {
      const openings = [
        `오늘, 환자분의 감동적인 한마디에 저희도 울컥했어요.\n\n"여기 오길 정말 잘한 것 같아요." 그 한마디에 그동안의 노력이 보람 있게 느껴졌어요. 무슨 일이 있었는지 궁금하시죠?`,
        `"다시 웃을 수 있어서 기뻐요."\n\n오늘 진료 후 환자분께서 하신 말씀이에요. 한 번도 자신 있게 웃어보지 못하셨다는 분이 활짝 웃으시는 모습을 보고, 저희도 행복해졌어요.`,
        `거울을 보며 환하게 웃으시는 환자분의 모습.\n\n치료 전에는 손으로 입을 가리시던 분이었어요. 그런데 오늘, "처음으로 사진을 예쁘게 찍을 수 있을 것 같아요" 하시며 웃으셨어요.`,
      ];
      return getRandomItem(openings);
    },
  ];

  const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
  return selectedStyle();
};

// ============================================================
// 2. 전개 1 - 준비 과정 (20%)
// ============================================================
const generatePreparationPhase = (activityName: string, categoryId: string): string => {
  const preparations: Record<string, string[]> = {
    implant: [
      `${activityName} 상담을 위해 내원하신 환자분의 모습이 인상 깊었어요.\n\n"이제는 제대로 씹고 싶어요" 하시며 결심에 찬 표정으로 오셨죠. 선생님과의 1:1 상담이 시작되자, 꼼꼼한 구강 검사와 3D CT 촬영이 이어졌어요.\n\n"상태가 어떤가요?" 조금은 긴장된 목소리로 물으시는 환자분. "이렇게 계획하면 충분히 좋은 결과를 기대할 수 있어요" 선생님의 자신감 있는 설명에 표정이 한결 밝아지셨어요.`,
      `오늘 ${activityName} 시술을 앞두고 환자분이 일찍 오셨어요.\n\n"긴장되네요, 잘할 수 있을까요" 하시며 조금은 떨리는 목소리. "걱정 마세요, 충분히 준비됐으니까요" 간호사의 안심시키는 말에 깊게 숨을 내쉬시더라고요.\n\n시술실로 들어가기 전, "믿고 맡겨주세요" 그 말에 환자분도 결심한 듯 고개를 끄덕이셨어요.`,
    ],
    orthodontics: [
      `${activityName} 상담 날, 환자분의 눈빛이 반짝거렸어요.\n\n"예뻐진 제 모습이 궁금해요" 하시며 설렘을 감추지 못하셨죠. 정밀 검사와 구강 스캔을 통해 정확한 진단을 진행했어요.\n\n"교정 기간은 어느 정도인가요?" 궁금해하시는 환자분께 선생님이 차근차근 설명해 드렸어요.`,
      `오늘 ${activityName} 장치 부착 날이에요.\n\n"이제 시작이네요" 하시며 거울을 보시는 환자분. 선생님이 꼼꼼하게 장치를 맞추시며 "하나하나 신경 써서 해드릴게요" 말씀하셨죠.\n\n"매번 올 때마다 조금씩 달라지는 게 보일 거예요" 그 말에 환자분의 표정에 기대감이 가득했어요.`,
    ],
    cosmetic: [
      `${activityName}를 위해 상담을 예약하신 환자분.\n\n"웃을 때 자신이 없어서..." 수줍게 말씀하시며 현재 치아 상태를 보여주셨어요. 선생님은 환자분의 원하는 스타일을 꼼꼼하게 듣고, 가장 적합한 방법을 제안해 드렸죠.\n\n"이렇게 하면 자연스럽게 예뻐지실 수 있어요" 모니터로 결과를 미리 보여드리자, 환자분의 눈이 커지셨어요.`,
      `오늘 ${activityName} 시술 날이에요.\n\n"떨리네요, 잘 부탁드려요" 하시는 환자분. "편안하게 진행해 드릴게요" 선생님의 안정적인 목소리에 긴장이 조금 풀리셨나 봐요.\n\n"지금부터 시작해 볼게요" 그 말과 함께, 환자분의 새로운 미소가 탄생하기 시작했어요.`,
    ],
    general: [
      `${activityName} 때문에 내원하신 환자분.\n\n"밤마다 아파서 잠을 못 자요" 걱정스러운 목소리로 말씀하셨죠. 선생님이 꼼꼼하게 검진하시고 문제를 정확히 파악했어요. "이 부분을 치료하면 바로 편안해지실 거예요"\n\n환자분의 표정이 한결 밝아지셨어요. "빨리 치료받고 싶어요" 그 말에 바로 진료 준비를 시작했답니다.`,
      `정기 검진과 ${activityName}를 위해 오신 환자분.\n\n"평소에는 괜찮은데 찬물 마시면 시려요" 하시며 상태를 설명해 주셨어요. 검진 결과 초기 충치가 발견됐고, 다행히 빨리 발견해서 큰 시술 없이 치료할 수 있었어요.\n\n"정기 검진 오길 잘했다" 하시며 안도하시는 환자분.`,
    ],
    pediatric: [
      `오늘 아이의 ${activityName}를 위해 부모님과 함께 내원하셨어요.\n\n"우리 아이가 치과를 무서워해서요" 걱정스러운 엄마의 목소리. 저희는 아이가 편안함을 느낄 수 있도록 준비했어요. 장난감, 만화, 그리고 상냥한 간호사 선생님들.\n\n"안녕? 오늘은 이빨 건강하게 해주는 날이야" 아이의 눈높이에 맞춰 천천히 다가갔어요.`,
      `${activityName} 날, 아이가 울지 않을까 걱정하신 부모님.\n\n"괜찮아, 잘할 수 있지?" 아이를 안심시키는 엄마의 목소리. 선생님은 아이와 눈을 맞추며 천천히 검진을 시작했어요.\n\n"와, 이빨 정말 예쁘네!" 칭찬하며 진료하는 동안 아이도 신이 나서 따라했어요.`,
    ],
    event: [
      `오늘 ${activityName}이 열리는 날이에요.\n\n아침 일찍부터 병원 로비를 정리하고, 환영 보드도 준비했어요. "무료 검진" 안내판을 보고 하나둘 모여드시는 분들. 모두 반가운 얼굴들이었어요.\n\n"이런 기회 마련해 주셔서 감사합니다" 인사를 건네시는 분들.`,
      `${activityName}을 위해 정성껏 준비했어요.\n\n건강 강좌 자료, 검진 장비, 그리고 상냥한 응대를 위한 직원들의 준비까지. 오시는 분들이 편안하게 참여하실 수 있도록 세심하게 신경 썼어요.`,
    ],
  };

  const categoryPreps = preparations[categoryId] || preparations['event'];
  return '\n\n' + getRandomItem(categoryPreps);
};

// ============================================================
// 3. 하이라이트 에피소드 (40%)
// ============================================================
interface ExtractedFacts {
  patientName: string | null;
  quantity: string | null;
  nickname: string | null;
  action: string | null;
  emotion: string | null;
  context: string | null;
}

const extractFactsFromInput = (input: string): ExtractedFacts => {
  const nameMatch = input.match(/([가-힣]{1,2})[Ooㅇ○0]{1,2}(님|씨)?/);
  const patientName = nameMatch ? nameMatch[1] + 'OO' : null;

  const quantityMatch = input.match(/(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|여러)\s*(개|번|차례|가지|개월)/);
  const quantity = quantityMatch ? quantityMatch[0] : null;

  const nicknameMatch = input.match(/(미소천사|미소퀸|스마일|별|예쁜이)/);
  const nickname = nicknameMatch ? nicknameMatch[1] : null;

  const emotionMatch = input.match(/(감격|기쁨|행복|뿌듯|감동|안도|안심|만족)/);
  const emotion = emotionMatch ? emotionMatch[1] : null;

  const contextMatch = input.match(/(오랜\s*고민|오랫동안|몇\s*년|친구.*추천|가족.*권유)/);
  const context = contextMatch ? contextMatch[0] : null;

  return { patientName, quantity, nickname, action: null, emotion, context };
};

const meltFactsIntoNarrative = (
  facts: ExtractedFacts, 
  activityName: string,
  centerName: string
): string => {
  let episode = '\n\n---\n\n';
  episode += `오늘 ${centerName}에서 가장 기억에 남는 순간을 이야기해 드릴게요.\n\n`;

  const patientDisplay = facts.patientName ? `**${facts.patientName}님**` : '한 환자분';

  episode += `${patientDisplay} 이야기를 꼭 해드리고 싶어요.\n\n`;
  
  if (facts.context) {
    episode += `이분은 ${facts.context} 끝에 용기 내어 저희를 찾아오셨어요. 사실 치과에 대한 두려움이 있으셔서, 문을 여는 것부터 큰 결심이 필요하셨대요.\n\n`;
  } else {
    episode += `평소 치과에 대한 두려움이 있으셨어요. "아플까 봐 무서워서..." 하시며 미루고 미루다 결국 오시게 됐죠.\n\n`;
  }

  episode += `진료실에 들어오실 때, 조금 떨리시는 걸 느낄 수 있었어요.\n\n`;
  episode += `"잘할 수 있을까요?" 조심스럽게 물으시는 목소리. "네, 충분히 잘하실 수 있어요. 함께 해요" 안심시켜 드렸죠.\n\n`;
  episode += `선생님이 친절하게 하나하나 설명해 드리자, 환자분의 표정이 조금씩 편안해지셨어요.\n\n`;

  episode += `그리고 ${activityName}가 시작됐어요.\n\n`;
  
  if (facts.quantity) {
    episode += `진료는 생각보다 빠르게 진행됐어요. **${facts.quantity}** 정도의 시간이면 충분했죠. "벌써 끝났어요?" 놀라워하시는 환자분의 표정이 아직도 눈에 선해요.\n\n`;
  } else {
    episode += `선생님의 꼼꼼한 진료가 이어졌어요. 하나하나 세심하게 신경 써주시는 모습에 환자분도 점점 안심하시는 게 느껴졌어요.\n\n`;
  }
  episode += `"생각보다 많이 안 아프네요" 환자분께서 안도하시며 말씀하셨죠.\n\n`;

  episode += `진료가 끝나고 거울을 보여드렸어요.\n\n`;
  episode += `환자분의 눈이 커지셨어요. "와... 이게 제 이빨이에요?" 믿기지 않는다는 표정. 그리고 이어진 환한 미소.\n\n`;
  
  if (facts.emotion) {
    episode += `"정말 ${facts.emotion}해요" 하시며 연신 감사해하셨어요.\n\n`;
  } else {
    episode += `"여기 오길 정말 잘한 것 같아요" 하시며 감사해하셨어요.\n\n`;
  }

  if (facts.nickname && !episode.includes(facts.nickname)) {
    episode += `오늘부터 저희는 이분을 '${facts.nickname}'라고 부르기로 했어요. 그만큼 밝고 예쁘게 웃으셨거든요.\n\n`;
  }

  return episode;
};

const generateHighlightEpisode = (
  customDetails: string, 
  reactions: string[], 
  activityName: string,
  centerName: string
): string => {
  if (!customDetails || !customDetails.trim()) {
    return generateDefaultEpisode(reactions, activityName);
  }

  const facts = extractFactsFromInput(customDetails);
  let episode = meltFactsIntoNarrative(facts, activityName, centerName);

  episode += `진료실을 나서며 환자분께서 말씀하셨어요.\n\n`;
  episode += `"가족들한테도 꼭 소개해줘야겠어요." 그 말씀에 저희도 덩달아 기분이 좋아졌어요.\n\n`;

  if (reactions.length > 0) {
    episode += `오늘 환자분들의 반응이 정말 좋았어요.\n\n`;
    
    const melted = reactions.slice(0, 2).map(r => {
      if (r.includes('감사') || r.includes('고맙')) {
        return `감사의 인사를 건네시는 분들도 계셨고요`;
      } else if (r.includes('웃') || r.includes('미소')) {
        return `환하게 웃으시며 만족해하시는 분들도 계셨지요`;
      } else if (r.includes('추천') || r.includes('자랑')) {
        return `주변에 소개하고 싶다며 명함을 챙기시는 분들도`;
      } else {
        return `편안해하시며 만족해하시는 분들도 계셨어요`;
      }
    });
    
    episode += `${melted.join('. ')}. 그 모습 하나하나가 저희에게 큰 힘이 된답니다.\n`;
  }

  return episode;
};

const generateDefaultEpisode = (reactions: string[], activityName: string): string => {
  let episode = '\n\n---\n\n';
  episode += '오늘 특별히 기억에 남는 장면이 있어요.\n\n';

  episode += `${activityName}을(를) 마치고 돌아가시는 한 환자분의 모습이 인상 깊었어요.\n\n`;
  episode += `진료 전에는 "잘할 수 있을까요?" 하며 긴장해 하셨던 분이에요. 하지만 선생님의 친절한 설명과 꼼꼼한 진료에 점점 안심하시더라고요.\n\n`;
  episode += `"생각보다 많이 안 아프네요" 진료 중간에 안도하시는 모습에 저희도 한결 마음이 놓였어요.\n\n`;
  episode += `진료 후 거울을 보시며 환하게 웃으시던 그 모습, 정말 아름다웠어요.\n\n`;

  if (reactions.length > 0) {
    episode += `오늘 환자분들의 반응이 정말 좋았어요.\n`;
    episode += `감사의 인사를 건네시는 분, 밝게 웃으시며 만족해하시는 분, 다음에 또 오겠다며 약속하시는 분까지.\n`;
    episode += `그 모습 하나하나가 저희에게는 가장 큰 보람이랍니다.\n`;
  }

  return episode;
};

// ============================================================
// 4. 마무리 (20%)
// ============================================================
const generateClosing = (activityName: string, centerName: string): string => {
  const closings = [
    `진료가 모두 끝나고, 환자분이 돌아가시는 모습을 배웅했어요.\n\n"정말 고생하셨어요" 하시며 손 흔들어 주시는 그 모습에 마음이 따뜻해졌어요.\n\n---\n\n오늘도 ${centerName}에서는 환자분들의 건강한 미소를 위해 최선을 다하고 있어요.\n\n치과에 대한 두려움, 이제 내려놓으셔도 돼요. 저희가 함께하니까요.\n\n언제든 편하게 찾아오세요. 따뜻한 미소로 맞이해 드릴게요. 🦷`,

    `하루가 저물어갈 때쯤, 오늘 방문하신 환자분들의 얼굴이 떠올라요.\n\n처음 오실 때는 긴장해 하셨던 분들도, 돌아가실 때는 밝은 표정이 되어 있으셨죠. 그 변화를 볼 때마다 이 일을 하는 보람을 느껴요.\n\n---\n\n${centerName}는 언제나 환자분들을 위해 열려 있어요.\n\n건강한 치아, 당당한 미소. 함께 만들어가요.\n\n궁금한 점이 있으시면 언제든 문의해 주세요. 😊`,

    `오늘도 수고 많으셨어요.\n\n치과 방문, 쉽지 않은 결정이셨을 텐데 용기 내어 오셔서 정말 감사해요. 오늘의 경험이 조금이나마 편안한 기억으로 남으셨길 바라요.\n\n---\n\n${centerName}에서는 환자분 한 분 한 분을 소중하게 생각합니다.\n\n다음에 또 뵐 날을 기대할게요. 그때도 환한 미소로 만나요! ✨`,
  ];

  return '\n\n---\n\n' + getRandomItem(closings);
};

// ============================================================
// Main: 블로그 콘텐츠 생성
// ============================================================
export const generateBlogContent = async (input: BlogInput): Promise<GeneratedBlog> => {
  const centerName = input.centerName || '우리 치과';
  const region = input.region || '';
  
  const intro = generateRandomOpening(centerName);
  const preparation = generatePreparationPhase(input.activityName, input.category);
  const highlight = generateHighlightEpisode(
    input.customDetails, 
    input.reactions, 
    input.activityName,
    centerName
  );
  const closing = generateClosing(input.activityName, centerName);

  const titleOptions = [
    `${input.activityName}, 오늘도 환자분들의 환한 미소`,
    `${centerName}에서 함께한 ${input.activityName} 이야기`,
    `오늘 하루, ${input.activityName}으로 가득 찬 행복`,
    `건강한 미소를 위한 ${input.activityName}`,
    `${input.activityName} - 당당하게 웃을 수 있는 날`,
  ];
  const title = getRandomItem(titleOptions);

  const content = `${intro}${preparation}${highlight}${closing}`;

  const centerNameNoSpace = centerName.replace(/\s/g, '');
  const hashtags = [
    `#${centerNameNoSpace}`,
    region ? `#${region}치과` : '#치과',
    region ? `#${region}임플란트` : '#임플란트',
    `#${input.activityName.replace(/\s/g, '')}`,
    '#치아건강',
    '#치과블로그',
    '#미소만들기',
    '#건강한치아',
  ];

  await new Promise(resolve => setTimeout(resolve, 2500));

  return {
    title,
    content,
    hashtags,
  };
};
