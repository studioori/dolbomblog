import { type BlogInput, type GeneratedBlog, CATEGORIES } from '@/types/blog';

// 참고 블로그 스타일을 반영한 글 생성 로직
// 추후 Lovable Cloud의 AI 기능으로 대체 예정

const getWeatherIntro = (): string => {
  const intros = [
    '오늘도 맑은 햇살이 가득한 하루입니다.',
    '선선한 바람이 불어오는 좋은 날씨예요.',
    '포근한 날씨와 함께 활기찬 하루가 시작되었습니다.',
    '따스한 햇살이 센터를 환하게 비추는 날이에요.',
    '오늘도 어르신들의 웃음소리가 가득한 하루입니다.',
  ];
  return intros[Math.floor(Math.random() * intros.length)];
};

const getClosing = (centerName: string): string => {
  return `
${centerName}은
어르신께서 활동을 하실 때에도
숙련된 요양 보호사 선생님들이 곁에 상주하여
어르신의 건강 상태를 살피고
세심히 케어를 도와드리고 있습니다.

센터의 내부시설이나 활동 등이
궁금하신 보호자님들께서는
언제든 편하게 문의해 주세요.

연락 후 부담 없이 방문하셔서 살펴보세요.`;
};

export const generateBlogContent = async (input: BlogInput): Promise<GeneratedBlog> => {
  // 실제로는 AI API를 호출하지만, 현재는 템플릿 기반 생성
  const categoryInfo = CATEGORIES.find(c => c.id === input.category)!;
  const centerName = input.centerName || '늘푸른주야간보호센터';
  
  const reactions = input.reactions.length > 0 
    ? input.reactions.join(', ') 
    : '적극적으로 참여하시며';
  
  const effects = input.effects.length > 0 
    ? input.effects 
    : categoryInfo.effects.slice(0, 2);

  // 제목 생성
  const title = `${centerName}의 ${input.activityName} - ${categoryInfo.label}`;

  // 본문 생성 (참고 블로그 스타일 반영)
  const content = `안녕하세요.
${centerName}입니다.

${getWeatherIntro()}

---

📌 오늘의 활동: ${input.activityName}

오늘은 어르신들과 함께
${input.activityName} 활동을 진행했습니다.

어르신들께서는 ${reactions}
활동에 임해주셨어요.

${input.customDetails ? `\n특별히 오늘은 ${input.customDetails}\n` : ''}

---

✨ 활동의 효과

이러한 ${categoryInfo.label}은
${effects.join(', ')} 등에
큰 도움이 됩니다.

${categoryInfo.id === 'cognitive' ? `
특히 어르신들의 두뇌를 자극하여
치매 예방에 효과적이며,
손끝을 사용하는 활동은
소근육 발달과 협응력 향상에도
도움이 됩니다.
` : ''}

${categoryInfo.id === 'physical' ? `
꾸준한 신체활동은
근력 강화와 균형감각 유지에 필수적이며,
어르신들의 일상생활 자립도를
높이는 데 큰 역할을 합니다.
` : ''}

${categoryInfo.id === 'birthday' ? `
생신잔치는 하루의 행사였지만,
그날의 웃음과 박수는 어르신의
마음에 오래 남는 기억이 돼요.

이런 순간들이 쌓여 하루하루가
조금 더 편안해진다고 생각합니다.
` : ''}

---

${getClosing(centerName)}`;

  // 해시태그 생성
  const hashtags = [
    `#${centerName.replace(/\s/g, '')}`,
    '#주야간보호센터',
    '#노인복지',
    `#${categoryInfo.label}`,
    '#어르신돌봄',
    ...effects.slice(0, 2).map(e => `#${e.replace(/\s/g, '')}`),
    '#실버케어',
    '#사회복지',
  ];

  // 약간의 지연을 추가하여 실제 API 호출처럼 느끼게
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    title,
    content,
    hashtags,
  };
};
