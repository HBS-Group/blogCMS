import { SupabaseClient} from '@supabase/supabase-js'; // Adjust import based on your setup

interface GetUserRoleOptions {
  tableName?: string;         // e.g., 'profiles', 'freelancers', 'user_roles'
  roleColumnName?: string;    // e.g., 'role', 'user_role', 'permission_level'
  userIdColumnName?: string;  // The column in your 'tableName' that stores the user's UUID
}

/**
 * Fetches the role of the currently authenticated user from a specified Supabase table.
 *
 * @param supabase The Supabase client instance.
 * @param options Optional parameters to customize table and column names.
 * @returns A Promise that resolves to the user's role (string) or null if not found or an error occurs.
 */
async function getUserRole(
  supabase: SupabaseClient,
  options: GetUserRoleOptions = {}
): Promise<string | null> {
  const {
    tableName = 'freelancers',    // Default to 'freelancers' as in your example
    roleColumnName = 'role',      // Default to 'role'
    userIdColumnName = 'id',      // Default to 'id' (matching user.id from auth)
  } = options;

  try {
    // 1. Get the currently authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Error fetching authenticated user:', authError.message);
      return null;
    }
    if (!user) {
      console.log('No user is currently authenticated.');
      return null;
    }

    // 2. Fetch the role from the specified table
    const { data: roleData, error: dbError } = await supabase
      .from(tableName)
      .select(`${roleColumnName}`) // Ensure the column name is correctly selected
      .eq(userIdColumnName, user.id) // Match the user's ID
      .single(); // Expecting one role (or null) per user in this table

    if (dbError) {
      // It's common for .single() to error if no row is found (PGRST116)
      // So, we check if it's that specific error or something else.
      if (dbError.code === 'PGRST116') { // PGRST116: "The result contains 0 rows"
        console.log(`User ${user.id} not found in table '${tableName}' or no role assigned.`);
      } else {
        console.error(`Error fetching user role from '${tableName}':`, dbError.message);
      }
      return null;
    }

    if (roleData && roleData[roleColumnName as keyof typeof roleData]) {
      const userRole = roleData[roleColumnName as keyof typeof roleData] as string;
      console.log(`User role from '${tableName}':`, userRole);
      return userRole;
    } else {
      console.log(`Role not found for user ${user.id} in '${tableName}' table or '${roleColumnName}' column is null/missing.`);
      return null;
    }

  } catch (error: unknown) {
    console.error('An unexpected error occurred while fetching user role:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export default getUserRole; // Or just export { getUserRole };
