import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  Deno.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

console.log("Fetching all users from auth...");
const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
if (listError) {
  console.error("Failed to list users:", listError);
  Deno.exit(1);
}

const users = data?.users || [];
console.log(`Found ${users.length} users. Deleting...`);
for (const user of users) {
  console.log(`Deleting user: ${user.id} (${user.email || "No email"})`);
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error(`Failed to delete user ${user.id}:`, deleteError);
  }
}

console.log("Deleting all score records...");
const { error: scoresError } = await supabaseAdmin.from("scores").delete().neq("id", "0");
if (scoresError) {
  console.error("Failed to clear scores:", scoresError);
}

console.log("Deleting all profile records...");
const { error: profilesError } = await supabaseAdmin.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
if (profilesError) {
  console.error("Failed to clear profiles:", profilesError);
}

console.log("Database reset completed successfully!");
