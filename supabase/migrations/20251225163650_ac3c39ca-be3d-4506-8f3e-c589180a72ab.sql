-- Add writing_tone_prompt column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN writing_tone_prompt text DEFAULT NULL;

-- Migrate existing Neulbom center with their specific style
UPDATE public.profiles 
SET writing_tone_prompt = '차분하고 품격 있는 사회복지사의 따뜻한 에세이 톤을 유지하세요. ''~랍니다'', ''~답니다'', ''~이지요'', ''~입니다''와 같은 정중하고 부드러운 어미를 사용하며, ''세상에'', ''대박'', ''말이에요'' 같은 가벼운 구어체나 감탄사는 전면 금지합니다.
활동을 묘사할 때는 단순 나열 대신 현장의 소리, 빛, 공기 등 감각적인 묘사를 사용하여 생동감을 주고, 문장의 길이를 다양하게 조절하여 리듬감을 부여하세요.
각 활동(Story Block)의 끝에는 반드시 해당 활동이 어르신의 신체/인지 기능에 미치는 의학적/전문적 기대 효과를 자연스럽게 덧붙여 신뢰감을 주어야 합니다.'
WHERE center_name LIKE '%늘봄%';