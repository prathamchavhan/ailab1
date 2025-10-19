"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect ,useState } from "react";
import toast, { Toaster } from "react-hot-toast";
export default function CallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
 const [checkingAccess, setCheckingAccess] = useState(true);
  useEffect(() => {
    const handleAuth = async () => {
      // Step 1: Get the current authenticated user.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      

      // If there's no user or an error occurred, redirect to login.
      if (userError || !user) {
        router.push("/login");
        return;
      }

    
      const { data: premiumAccess, error: premiumError } = await supabase
        .from('Premium_access')
        .select('access')
        .eq('email', user.email)
        .single(); 

      
      if (premiumError || !premiumAccess?.access) {
        console.error("Access denied for user:", user.email);
        toast.error("Access denied. You don't have Premium access.");
        await supabase.auth.signOut();
           
        router.push("/login?error=access_denied");
        return;
      }

      
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

     
      if (!profile) {
        
        router.push("/profile/create");
      } else {
      
        const redirectTo = sessionStorage.getItem("loginRedirect");
        if (redirectTo) {
          sessionStorage.removeItem("loginRedirect");
          router.push(redirectTo);
        } else {
          
          router.push("/dashboard");
        }
      }
       setCheckingAccess(false);
    };

    handleAuth();
  }, [router, supabase]);
  if (checkingAccess) {
  return (
    
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
     <Toaster
  position="top-center"
  reverseOrder={false}
/>
      
      <p>Verifying session and permissions...</p>
    </div>
  
  );
}
    return null;
}
