import { type BlogInput, type GeneratedBlog } from '@/types/blog';
import {
  getRandomItem,
  sensoryModules,
  locationModules,
  actionModules,
  closingModules,
  specialStyles,
} from '@/data/promptModules';
import { generateHighlightEpisode } from '@/lib/narrative';

// 돌봄 블로그 글 생성기
// 'Storyteller' Protocol - 10년차 베테랑 사회복지사의 감성 에세이 스타일
// 각 센터의 profile 정보(centerName, region)를 기반으로 동적으로 콘텐츠 생성

// 모듈식 조립 함수 (1000개 조합: 5 × 5 × 8 × 5)
const generateModularOpening = (centerName: string): string => {
  const sensory = getRandomItem(sensoryModules)();
  const location = locationModules[0]();
  const action = getRandomItem(actionModules)();
  const closing = getRandomItem(closingModules(centerName));

  return `${sensory}\n\n${location} ${action}\n\n${closing}`;
};

const generateRandomOpening = (centerName: string): string => {
  // 70% 확률로 모듈식 조립, 30% 확률로 특별 스타일
  if (Math.random() < 0.7) {
    return generateModularOpening(centerName);
  } else {
    return getRandomItem(specialStyles(centerName))();
  }
};

// ============================================================
// 2. 전개 1 - 준비 과정 (20%) : 설렘, 분주함, 호기심
// ============================================================
const generatePreparationPhase = (activityName: string, categoryId: string): string => {
  const preparations: Record<string, string[]> = {
    cognitive: [
      `${activityName}을 준비하면서 탁자 위에 재료들을 하나둘 펼쳐놓았어요.\n\n"어머, 저게 뭐야?" 하시며 호기심 가득한 눈으로 다가오시는 어르신들. 안경을 고쳐 쓰시고 꼼꼼히 살펴보시는 분, "내가 해볼게" 하며 먼저 손을 뻗으시는 분. 아직 시작도 전인데 벌써 설렘이 가득했답니다.\n\n"선생님, 이거 어렵지 않아요?" 걱정하시는 분께 "천천히 하면 돼요, 제가 도와드릴게요"라고 말씀드렸지요. 그러자 "그래, 뭐든 해봐야지!" 하시며 용기를 내셨어요.`,
      `오늘 ${activityName}을 한다고 미리 말씀드렸더니, 아침부터 어르신들 눈빛이 달랐어요.\n\n"그거 재밌겠다!" 하시는 분, "내가 젊었을 때는 잘했는데..." 하시며 추억에 잠기시는 분. 준비물을 챙기는 저희 손길을 물끄러미 바라보시다가 "내가 도와줄까?" 하고 다가오시기도 했지요.\n\n선생님들은 분주하게 자리를 배치하고, 어르신들은 삼삼오오 모여 "오늘 뭐 하는 거야?" 하고 서로 정보를 교환하셨어요. 기대감으로 웅성웅성, 센터 안이 활기로 가득 찼답니다.`,
    ],
    physical: [
      `${activityName}을 시작하기 전, 다 같이 가볍게 스트레칭부터 했어요.\n\n"아이고, 뼈가 우두둑 소리가 나" 하시면서도 열심히 따라 하시는 어르신들. 선생님의 "하나, 둘, 셋, 넷!" 구령에 맞춰 팔을 뻗으시고, 다리를 굽혔다 펴셨지요.\n\n"요즘 운동 안 했더니 몸이 뻣뻣해" 하시던 분도 금세 몸이 풀리셨는지 "어, 좀 낫네" 하시더라고요. 옆에서 준비 운동을 지켜보시던 분들도 하나둘 합류하셔서, 어느새 모두가 함께 몸을 풀고 있었답니다.`,
      `오늘 ${activityName}이 있다고 미리 말씀드렸더니, 어르신들 복장부터 달랐어요.\n\n운동화 신고 오신 분, 편한 옷으로 갈아입고 오신 분. "오늘은 내가 일등이다" 하시며 의욕을 불태우시는 모습이 참 보기 좋았지요.\n\n선생님이 "준비되셨어요?" 하고 여쭤보니, "당연하지!" 하시며 주먹을 불끈 쥐시는 어르신. 그 옆에서 "천천히 해야 해, 무리하면 안 돼" 하시며 당부하시는 분까지. 각자의 방식으로 오늘을 기대하고 계셨어요.`,
    ],
    event: [
      `오늘 ${activityName}을 위해 아침 일찍부터 분주했어요.\n\n거실을 꾸미고, 풍선도 달고, 현수막도 걸었지요. "우와, 잔치 분위기네!" 하시며 들어오시는 어르신들 눈이 휘둥그레지셨어요.\n\n"오늘 무슨 날이야?" 하시는 분께 "곧 알게 되실 거예요, 비밀이에요"라고 장난스레 말씀드렸더니, "에이, 궁금하게~" 하시면서도 기대에 찬 미소를 지으셨답니다. 평소보다 일찍 오신 분들, 머리를 단정히 빗고 오신 분들... 다들 뭔가 특별한 일이 있을 거라는 걸 눈치채신 것 같았어요.`,
      `${activityName}을 준비하면서 선생님들끼리 몰래몰래 움직였어요.\n\n어르신들 눈을 피해 장식을 하고, 음식을 준비하고... 그런데 눈치 빠르신 분이 계시더라고요. "뭔가 숨기고 있지?" 하시며 살금살금 다가오셔서, 결국 들켜버렸지 뭐예요.\n\n그래도 "비밀이에요, 잠깐만 기다려 주세요" 하니까 "알았어, 안 물을게" 하시며 설레는 표정으로 자리에 앉으셨어요. 그 두근거림이 센터 안 가득 퍼져, 저희까지 덩달아 들뜨더라고요.`,
    ],
    meal: [
      `오늘 ${activityName}을 준비하면서 주방에서 좋은 냄새가 솔솔 풍겨왔어요.\n\n"오늘 뭐야, 뭐야? 맛있는 냄새 나는데!" 하시며 두리번거리시는 어르신들. "비밀이에요, 조금만 기다리세요" 하면서도 기대되는 표정은 숨길 수가 없으셨지요.\n\n식탁을 깨끗이 닦고, 접시를 놓고, 정성껏 차려지는 밥상. "우와, 진수성찬이네!" 하시며 자리에 앉으시는 모습이 대가족 명절 같았답니다. "빨리 먹자, 배고파!" 하시는 분, "천천히 먹어야지" 하시는 분, 각자의 방식으로 기대감을 표현하셨어요.`,
      `${activityName} 메뉴를 말씀드리자마자 어르신들 반응이 뜨거웠어요.\n\n"그거 내가 좋아하는 건데!" 하시는 분, "오랜만에 먹어보네" 하시며 눈을 반짝이시는 분. 아직 음식이 나오지도 않았는데 벌써부터 기대감이 최고조였지요.\n\n주방에서 "조금만 기다려 주세요~" 하니까 "빨리빨리!" 하시며 농담을 건네시는 어르신들. 그 장난기 가득한 목소리에 저희도 웃음이 나왔답니다. 드디어 음식이 나오고, 모두의 시선이 밥상에 집중됐어요.`,
    ],
    birthday: [
      `오늘은 특별한 날이에요. ${activityName}이 있는 날이거든요!\n\n아침부터 케이크를 주문하고, 풍선도 달고, 생일 축하 현수막도 준비했답니다. 주인공 어르신 모르게 살금살금 준비하는 게 보통 일이 아니었지요.\n\n"오늘 뭔가 이상한데?" 하시며 눈치 채신 것 같으면서도, 모르는 척 자리에 앉아계시더라고요. 아, 설마 다 알고 계신 건 아니겠죠? 두근두근, 저희가 더 떨렸던 것 같아요.`,
      `${activityName}을 준비하면서 선생님들이 비밀 작전을 펼쳤어요.\n\n주인공 어르신을 다른 분들과 이야기하시도록 하고, 그 사이에 케이크와 장식을 세팅했지요. "저쪽에서 무슨 소리 났는데?" 하시며 고개를 돌리시려 할 때마다 가슴이 철렁철렁.\n\n드디어 준비 완료! 문을 열고 주인공 어르신을 모셔왔어요. 그 순간의 어르신 표정, 평생 잊지 못할 것 같아요.`,
    ],
  };

  const categoryPreps = preparations[categoryId] || preparations['event'];
  return '\n\n' + getRandomItem(categoryPreps);
};

// ============================================================
// 4. 마무리 (20%) - 여운, 어르신 멘트 인용, 편지
// ============================================================
const generateClosing = (activityName: string, centerName: string): string => {
  const closings = [
    `모든 활동이 끝나고, 어르신들이 삼삼오오 모여 이야기를 나누셨어요.\n\n"오늘 진짜 재밌었어" "다음에도 이거 하자" 하시는 목소리가 여기저기서 들려왔지요. 한 어르신께서 제 손을 꼭 잡으시며 말씀하셨어요.\n\n"선생님, 고마워요. 이 나이에 이런 호강을 다 하네."\n\n그 따뜻한 손의 온기가 아직도 느껴지는 것 같아요. 이 일을 하면서 가장 보람찬 순간은, 바로 이런 순간이랍니다.\n\n---\n\n보호자님, 오늘도 어르신께서 건강하고 즐겁게 지내셨어요.\n\n${centerName}에서는 이렇게, 어르신 한 분 한 분의 하루가 조금이라도 더 따뜻하고 행복할 수 있도록 늘 곁에서 세심히 살피고 있답니다.\n\n우리 부모님의 하루가 궁금하시다면, 언제든 놀러 오세요. 차 한 잔 대접해 드리며, 오늘의 이야기를 들려드릴게요. ☕`,

    `하루가 저물어갈 때쯤, 한 어르신께서 창밖을 바라보시며 말씀하셨어요.\n\n"여기 오니까 하루가 금방 가. 집에만 있으면 시간이 왜 이렇게 안 가던지..."\n\n그 말씀에 저도 모르게 코끝이 찡해졌어요. 우리가 하는 일이, 이렇게 누군가의 시간을 채워드리는 것이구나 싶어서요.\n\n---\n\n보호자님께 전하고 싶은 말이 있어요.\n\n바쁘신 와중에 부모님 걱정 많이 되시죠? 저희도 그 마음 잘 알아요. 그래서 더 열심히, 더 정성껏 모시고 있답니다.\n\n${centerName}에서 어르신들과 함께 보낸 오늘 하루, 사진으로, 영상으로, 그리고 이 글로 전해드립니다.\n\n궁금한 점이 있으시면 언제든 연락 주세요. 🌸`,

    `귀가 시간이 다가오자, 어르신들이 아쉬운 표정을 감추지 못하셨어요.\n\n"내일 또 오면 되지, 뭐" 하시면서도 문 앞에서 자꾸 뒤돌아보시더라고요. 손 흔들어 인사하시는 그 모습, 매일 봐도 마음이 따뜻해진답니다.\n\n한 어르신께서 나가시며 말씀하셨어요.\n\n"선생님들 덕분에 매일이 기다려져요."\n\n그 한마디가 저희에겐 내일도 열심히 해야겠다는 원동력이 된답니다.\n\n---\n\n보호자님, 오늘 하루도 고생 많으셨어요.\n\n어르신들의 미소를 지키는 일, 저희 ${centerName}가 함께 하겠습니다.\n\n언제든 편하게 방문해 주세요. 어르신들의 생생한 일상을 직접 보여드릴게요. 🌿`,
  ];

  return '\n\n---\n\n' + getRandomItem(closings);
};

// ============================================================
// Main: 블로그 콘텐츠 생성
// ============================================================
export const generateBlogContent = async (input: BlogInput): Promise<GeneratedBlog> => {
  // 센터명과 지역 정보 (동적 할당)
  const centerName = input.centerName || '우리 센터';
  const region = input.region || '';
  
  // 1. 도입 (20%) - 랜덤 5가지 스타일
  const intro = generateRandomOpening(centerName);

  // 2. 전개 1 - 준비 과정 (20%)
  const preparation = generatePreparationPhase(input.activityName, input.category);

  // 3. 전개 2 - 하이라이트 에피소드 (40%) - Slow Motion
  const highlight = generateHighlightEpisode(
    input.customDetails, 
    input.reactions, 
    input.activityName,
    centerName
  );

  // 4. 마무리 (20%)
  const closing = generateClosing(input.activityName, centerName);

  // 제목 생성
  const titleOptions = [
    `${input.activityName}, 오늘도 우리 어르신들 웃음꽃이 활짝`,
    `어르신들과 함께한 ${input.activityName} - 작은 일상의 큰 행복`,
    `오늘 하루, ${input.activityName}으로 가득 찬 웃음`,
    `${centerName}의 하루 | ${input.activityName} 이야기`,
    `따뜻했던 오늘, ${input.activityName}과 함께`,
  ];
  const title = getRandomItem(titleOptions);

  // 본문 조합 (2000자 이상)
  const content = `${intro}${preparation}${highlight}${closing}`;

  // 해시태그 (지역 및 센터명 기반 동적 생성)
  const centerNameNoSpace = centerName.replace(/\s/g, '');
  const hashtags = [
    `#${centerNameNoSpace}`,
    region ? `#${region}주야간보호` : '#주야간보호',
    region ? `#${region}노인돌봄` : '#노인돌봄',
    `#${input.activityName.replace(/\s/g, '')}`,
    region ? `#${region}데이케어` : '#데이케어',
    '#어르신일상',
    '#따뜻한돌봄',
    '#노인복지',
  ];

  // 생성 중 효과
  await new Promise(resolve => setTimeout(resolve, 2500));

  return {
    title,
    content,
    hashtags,
  };
};
