import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePaths } = await req.json();

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "삭제할 파일이 없습니다." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Deleting files:", filePaths);

    const { data, error } = await supabase.storage
      .from("daily-photos")
      .remove(filePaths);

    if (error) {
      console.error("Storage delete error:", error);
      throw error;
    }

    console.log("Files deleted successfully:", data);

    return new Response(
      JSON.stringify({ success: true, deletedCount: filePaths.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in delete-photos:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
