import Supabase from '@supabase/supabase-js/dist/umd/supabase.js'

export default class SupabaseManager {

    readonly SUPABASE_URL = "https://popahsqojmkutrjajtsj.supabase.co";
    readonly SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcGFoc3Fvam1rdXRyamFqdHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjgwNTA3MDAsImV4cCI6MTk4MzYyNjcwMH0._8_ECa6FyhzrYhuFlTcn2AO2g8otn3CflEv_RcAhdzQ";

    private supabaseClient: Supabase.SupabaseClient = null!;

    private static _instance: SupabaseManager;
    public static getInstance(): SupabaseManager {
        if (!SupabaseManager._instance) {
            SupabaseManager._instance = new SupabaseManager();
            SupabaseManager._instance.init();
        }
        return SupabaseManager._instance;
    }

    private init() {
        this.supabaseClient = Supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
    }

    public async SignUpOAuth() {
        const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
            provider: 'github'
          })

          console.log(`[SUPABASE] .. SignUp OAuth ...
            data: ${JSON.stringify(data)}
            error: ${error}
        `);
    }

    public async signUpByEmail(email: string, password: string, callback = (data: any, error: any)=>{}) {
        const { data, error } = await this.supabaseClient.auth.signUp({
            email:      email,
            password:   password,
        })

        console.log(`[SUPABASE] .. signUpByEmail ...
            data: ${JSON.stringify(data)}
            error: ${error}
        `);

        callback && callback(data, error);
    }

    public async signInWithPassword(email: string, password: string, callback = (data: any, error: any)=>{}) {
        const { data, error } = await this.supabaseClient.auth.signInWithPassword({
            email:      email,
            password:   password,
        })

        console.log(`[SUPABASE] .. signInWithPassword ...
            data: ${JSON.stringify(data)}
            error: ${error}
        `);

        callback && callback(data, error);
    }

    public async signOut(email: string, password: string) {
        const { error } = await this.supabaseClient.auth.signOut()

        console.log(`[SUPABASE] .. SignOut ...
            error: ${error}
        `);
    }

}