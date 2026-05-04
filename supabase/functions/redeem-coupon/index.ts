import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: '유효하지 않은 인증입니다.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: '쿠폰 코드를 입력해주세요.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedCode = code.trim().toUpperCase();
    console.log(`User ${user.id} attempting to redeem coupon: ${trimmedCode}`);

    // Find the coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', trimmedCode)
      .maybeSingle();

    if (couponError) {
      console.error('Error fetching coupon:', couponError);
      return new Response(
        JSON.stringify({ error: '쿠폰 조회 중 오류가 발생했습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!coupon) {
      console.log(`Coupon not found: ${trimmedCode}`);
      return new Response(
        JSON.stringify({ error: '존재하지 않는 쿠폰입니다.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (coupon.is_used) {
      console.log(`Coupon already used: ${trimmedCode}`);
      return new Response(
        JSON.stringify({ error: '이미 사용된 쿠폰입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: '사용자 정보 조회 중 오류가 발생했습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Smart date extension logic
    const now = new Date();
    let baseDate: Date;

    if (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) < now) {
      // Case A: New user or expired - start from now
      baseDate = now;
      console.log(`Case A: Starting from now for user ${user.id}`);
    } else {
      // Case B: Active subscription - extend from current expiry
      baseDate = new Date(profile.subscription_expires_at);
      console.log(`Case B: Extending from ${baseDate.toISOString()} for user ${user.id}`);
    }

    // Add duration_months to base date
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + coupon.duration_months);

    console.log(`New expiry date: ${newExpiryDate.toISOString()}`);

    // Update profile with new expiry date and activate
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        subscription_expires_at: newExpiryDate.toISOString(),
        is_active: true,
        updated_at: now.toISOString(),
      })
      .eq('id', user.id);

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      return new Response(
        JSON.stringify({ error: '구독 정보 업데이트 중 오류가 발생했습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark coupon as used
    const { error: updateCouponError } = await supabase
      .from('coupons')
      .update({
        is_used: true,
        used_by: user.id,
        used_at: now.toISOString(),
      })
      .eq('id', coupon.id);

    if (updateCouponError) {
      console.error('Error updating coupon:', updateCouponError);
      // Note: Profile was already updated, so we log but don't fail
    }

    console.log(`Coupon ${trimmedCode} redeemed successfully by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        duration_months: coupon.duration_months,
        new_expiry_date: newExpiryDate.toISOString(),
        message: `이용 기간이 ${coupon.duration_months}개월 연장되었습니다!`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
