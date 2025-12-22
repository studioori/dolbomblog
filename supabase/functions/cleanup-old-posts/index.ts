import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cleanup of posts older than 24 hours...");

    // Step 1: Find posts older than 24 hours
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: oldPosts, error: selectError } = await supabase
      .from("generated_posts")
      .select("id, image_paths")
      .lt("created_at", cutoffTime);

    if (selectError) {
      console.error("Error fetching old posts:", selectError);
      throw new Error(`Failed to fetch old posts: ${selectError.message}`);
    }

    if (!oldPosts || oldPosts.length === 0) {
      console.log("No old posts to clean up");
      return new Response(
        JSON.stringify({ message: "No posts to clean up", deleted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${oldPosts.length} posts to delete`);

    // Step 2: Delete associated storage files
    const allImagePaths: string[] = [];
    for (const post of oldPosts) {
      if (post.image_paths && Array.isArray(post.image_paths)) {
        for (const url of post.image_paths) {
          // Extract file path from public URL
          // URL format: https://xxx.supabase.co/storage/v1/object/public/daily-photos/session-xxx/file.jpg
          const match = url.match(/daily-photos\/(.+)$/);
          if (match) {
            allImagePaths.push(match[1]);
          }
        }
      }
    }

    if (allImagePaths.length > 0) {
      console.log(`Deleting ${allImagePaths.length} storage files...`);
      
      const { error: storageError } = await supabase.storage
        .from("daily-photos")
        .remove(allImagePaths);

      if (storageError) {
        console.error("Error deleting storage files:", storageError);
        // Continue with DB deletion even if storage deletion fails
      } else {
        console.log("Storage files deleted successfully");
      }
    }

    // Step 3: Delete DB records
    const postIds = oldPosts.map(p => p.id);
    
    const { error: deleteError } = await supabase
      .from("generated_posts")
      .delete()
      .in("id", postIds);

    if (deleteError) {
      console.error("Error deleting posts:", deleteError);
      throw new Error(`Failed to delete posts: ${deleteError.message}`);
    }

    console.log(`Successfully deleted ${oldPosts.length} posts and ${allImagePaths.length} files`);

    return new Response(
      JSON.stringify({ 
        message: "Cleanup completed", 
        deletedPosts: oldPosts.length,
        deletedFiles: allImagePaths.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in cleanup-old-posts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
