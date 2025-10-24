// File: app/profilemain/page.js

"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Calendar, CheckSquare, Clock, Edit, FileText, Briefcase, BarChart, HardHat, Save, Camera } from 'lucide-react';
import Calender  from "../../components/calender";
import Overall_header from "@/components/Header/Overall_header";
import { toast} from 'sonner';

const ProfileDetail = ({ label, value, isLink = false }) => (
  <div className="flex flex-col space-y-0.5">
    <p className="text-[15px] text-[#265386] font-bold ">{label}</p>
    <p className={`text-[15px] font-semibold ${isLink ? 'text-blue-600 hover:underline' : 'text-gray-800'}`}>
      {value || 'N/A'}
    </p>
  </div>
);
const ActivityItem = ({ icon: Icon, title, time, type }) => (
  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 transition hover:shadow-md">
    <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-100 text-green-700' : type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
      <Icon size={18} />
    </div>
    <div className="flex-grow">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);

// --- Main Profile Page Component ---

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collegeName, setCollegeName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null); 
  const fileInputRef = useRef(null); 
  const supabase = createClientComponentClient();



  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    return "just now";
  };

  const getAvatarSignedUrl = useCallback(() => {
    return null;
  }, []); 

  const fetchData = useCallback(async (userId) => {
    setLoading(true);
    setCurrentUserId(userId);

 
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        department:department_id (name, stream_id),
        stream:stream_id (stream)
      `)
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError.message);
      toast.error("Error fetching profile. Please try refreshing.");
      setLoading(false);
      return;
    }
    
    // 2. Fetch College Name
    if (profile.clg_id) {
      const { data: college } = await supabase
        .from('College')
        .select('clg_name')
        .eq('id', profile.clg_id)
        .single();
      
      setCollegeName(college?.clg_name || "College not specified");
    } else {
       setCollegeName("College not specified");
    }
    
    // --- Use the stored URL directly, adding cache-buster if it exists ---
    let finalAvatarUrl = null;
    if (profile.avatar_url) {
        finalAvatarUrl = `${profile.avatar_url}&t=${new Date().getTime()}`;
    }
    
    setAvatarUrl(finalAvatarUrl);
    setProfileData(profile);
    
    // Initialize form data on initial fetch
    setEditFormData({
        name: profile.name || '',
        surname: profile.surname || '', // <-- FIX 1: Added surname to form state
        stream: profile.stream?.stream || profile.branch || '',
        branch: profile.branch || '', 
        role: profile.role || 'Student',
    });

    // 3. Fetch Recent Activity 
    const { data: interviewActivity } = await supabase
      .from('avee_interview')
      .select('domain, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2);
      
    const { data: jobActivity } = await supabase
      .from('jobs')
      .select('job_role, created_at') 
      .limit(1);

    const activityList = [];
    
    interviewActivity?.forEach(item => {
      activityList.push({
        icon: FileText,
        title: `Completed ${item.domain || 'Technical'} Interview`,
        time: formatActivityTime(item.created_at),
        createdAt: item.created_at,
        type: 'success'
      });
    });
    
    activityList.push({
      icon: Briefcase,
      title: `Applied for "Software Developer" Job`,
      time: '45 min ago', 
      createdAt: new Date(),
      type: 'info'
    });
    
    activityList.push({
        icon: Clock,
        title: `New Announcement: AI Ethics Webinar`,
        time: '60 min ago',
        createdAt: new Date(),
        type: 'info'
    });

    activityList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setRecentActivity(activityList.slice(0, 4));
    setLoading(false);
  }, [supabase]); 


  useEffect(() => {
    let ignore = false;
    
    const fetchUserAndData = async () => {
        setLoading(true); 
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id && !ignore) {
            await fetchData(session.user.id);
        } else {
            if (!ignore) {
                setLoading(false);
            }
        }
    };
    
    fetchUserAndData();
    
    return () => {
        ignore = true;
    };
  }, [fetchData, supabase]); 
  
  // Handlers for edit mode
  const handleEdit = () => {
      setIsEditing(true);
   
      setEditFormData({
          name: profileData.name || '',
          surname: profileData.surname || '', 
          stream: profileData.stream?.stream || profileData.branch || '',
      });
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
      setLoading(true); 

      const updatedFields = {
          name: editFormData.name,
          surname: editFormData.surname, 
          branch: editFormData.stream, 
      };

      const { error } = await supabase
          .from('profiles')
          .update(updatedFields)
          .eq('user_id', currentUserId);

      if (error) {
          console.error("Error saving profile:", error.message);
          toast.error(`Failed to save changes: ${error.message}`);
          setLoading(false); 
      } else {
          await fetchData(currentUserId);
          setIsEditing(false); 
          toast.success("Profile updated successfully!");
      }
  };
  

  const handleAvatarUpload = async (event) => {
      try {
          if (!currentUserId) throw new Error("User not authenticated.");

          const file = event.target.files[0];
          if (!file) return;

          setLoading(true);

       
          const fileExt = file.name.split('.').pop();
          const filePath = `${currentUserId}/avatar.${fileExt}`; 
          
          
          const { error: uploadError } = await supabase.storage
              .from('avatars') 
              .upload(filePath, file, { 
                  cacheControl: '3600', 
                  upsert: true
              });

          if (uploadError) {
              throw uploadError;
          }
          
          
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('avatars')
              .createSignedUrl(filePath, 604800); 

          if (signedUrlError) {
              throw signedUrlError;
          }
          
          const fullSignedUrl = signedUrlData.signedUrl;

       
          const { error: updateError } = await supabase
              .from('profiles')
              .update({ avatar_url: fullSignedUrl }) 
              .eq('user_id', currentUserId);

          if (updateError) {
              throw updateError;
          }

        
          await fetchData(currentUserId); 
         toast.success("Profile image updated successfully!");

      } catch (error) {
          console.error(error);
          toast.error(`Error: ${error.message}. wait for update.`);
      } finally {
          setLoading(false);
          if (fileInputRef.current) {
              fileInputRef.current.value = null;
          }
      }
  };
  
  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };


  if (loading) {
    return <div className="p-8 text-center">Loading profile data...</div>;
  }
  
  const studentID = profileData.roll_no || profileData.user_id?.slice(0, 8);
  const streamName = profileData.stream?.stream || profileData.branch || 'N/A';
  const departmentName = profileData.department?.name || 'N/A';
  
  // Use 'name' and 'surname' from profileData, then fall back
  const userName = (profileData.name || 'Student') + ' ' + (profileData.surname || '');
  

  const [firstNameDisplay, lastNameDisplay] = userName.split(/\s+/, 2);


  return (
    <>
     <div className="mb-3 mt-4">
      <Overall_header/>
      </div>
    <div className="px-4 py-8 md:pl-72 lg:pl-72 bg-gray-50 min-h-screen"  >
     
      <div className="relative mb-6 rounded-lg overflow-hidden shadow-xl">
        
     
        <div className="w-full h-48 bg-cover bg-center bg-[#2166ac] relative overflow-hidden rounded-t-lg"> 
           
           <video 
                autoPlay 
                loop 
                muted
               
                className="w-full h-full object-cover opacity-80 absolute top-0 left-0"
                preload="auto"
                playsInline 
            >
             
                <source src="/bg_profile.mp4" type="video/mp4" />
            
                <img src="/images/banner-default.png" alt="Profile Banner Fallback" className="w-full h-full object-cover opacity-70" />
            </video>
        </div>

       <div className="relative z-10  shadow-lg rounded-b-lg p-6 pt-0 -mt-16 md:p-8 md:pt-0" style={{
                    background: 'linear-gradient(to right , #cfeef6ff, #f8f8f8ff',
                   
                  }}>

          
       
         <div className="flex items-end space-x-6">
            
          
            <div 

        className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 -mt-99 flex-shrink-0 group cursor-pointer"
        onClick={triggerFileInput} 
    >

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={loading}
                />
            
                {/* Standard <img> tag pointing to the stored URL or fallback */}
                <img 
        src={avatarUrl || `/avee.png`} 
        alt="User Avatar" 
        width={128} 
        height={128} 
        className="rounded-full object-cover object-center w-full h-full transition-opacity duration-300 group-hover:opacity-75 absolute inset-0"
    />
                {/* Active Status Badge (Positioned at the bottom of the image circle) */}
                <span className="absolute bottom-0 right-0 px-2 py-0.5 bg-[#2DC5DB] text-white text-xs font-bold rounded-full shadow-lg border-2 border-white transform translate-x-1/4 translate-y-1/4">
                    Active
                </span>
                
                {/* Upload Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
                    <Camera size={24} className="text-white"/>
                </div>
            </div>

   <div className="flex-grow pt-1">
    
    {/* Line 1: User Name (Primary Header) */}
    <p className="text-3xl text-[18px] font-bold text-[#09407F] mb-1">{userName.trim()}</p>
    
    <p className="text-base text-gray-600 mb-0.5">
        <span className="font-semibold text-[13px] text-[#09407F]">Role: {profileData.role || 'Student'}</span> 
        <span className="font-extrabold mx-2 text-[#09407F]">|</span> 
        <span className="font-semibold text-[13px] text-[#09407F]">Student ID: {studentID}</span>
    </p>
    <p className="text-sm text-[#09407F] text-[13px] ">
       College: {collegeName}
    </p>

</div>
          </div>
        </div>
      </div>

     
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 px-4">
         
    {/* Left Column (Personal Information) */}
    <div className="lg:col-span-2">
         <p className="text-xl font-bold text-[#09407F] mb-6 pb-2">Personal Information</p>
      <div className=" p-4 pr-3 rounded-lg shadow-md" style={{
                background: 'linear-gradient(to left, #fafcfcff , #E1FBFF)',
              }}>
      
        
        {/* KEY CHANGE: grid-cols-3 for the 3-item first row */}
        <div className="grid grid-cols-3 gap-y-5 gap-x-3 text-black" >
          
         
          <div className="flex flex-col space-y-0.5">
            {/* FIX 3a: Display profileData.name */}
            <ProfileDetail label="First Name" value={isEditing ? null : profileData.name || ''} />
            {isEditing && (
                <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleChange}
                    className="p-1 border border-blue-300 rounded text-sm text-black font-semibold"
                />
            )}
          </div>

          <div className="flex flex-col space-y-0.5">
            {/* FIX 3b: Display profileData.surname */}
            <ProfileDetail 
                label="Last Name" 
                value={isEditing ? null : profileData.surname || ''} 
            />
            {isEditing && (
                // <-- FIX 4: Connected input to 'surname' state
                <input
                    type="text"
                    name="surname" 
                    value={editFormData.surname}
                    onChange={handleChange}
                    className="p-1 border border-blue-300 rounded text-sm text-black font-semibold"
                />
            )}
          </div>
          
          <ProfileDetail label="User Role" value={profileData.role || 'Student'} />


        
           <ProfileDetail label="Student ID" value={studentID} />
          
          <div className="flex flex-col space-y-0.5">
            <ProfileDetail label="Branch" value={isEditing ? null : profileData.branch || 'N/A'} />
            {isEditing && (
                <input
                    type="text"
                    name="branch"
                    value={editFormData.branch}
                    onChange={handleChange}
                    className="p-1 border border-blue-300 rounded text-sm text-black font-semibold" 
                />
            )}
          </div>
          
          <ProfileDetail label="semester" value={profileData.sem ? ` ${profileData.sem}` : '2025-26'} />



          <div className="col-span-3"> 
            <ProfileDetail label="College Name" value={collegeName} />
          </div>
          
          
        
          <div className="flex flex-col space-y-0.5">
            <ProfileDetail label="Stream" value={isEditing ? null : streamName} />
            {isEditing && (
                <input
                    type="text"
                    name="stream"
                   value={editFormData.branch || ''}
                    onChange={handleChange}
                    className="p-1 border border-blue-300 rounded text-sm text-black font-semibold"
                />
            )}
          </div>
          
          <ProfileDetail label="Department" value={departmentName} />
          
          {/* Empty slot in the grid to maintain alignment */}
          <div></div> 
          
          {/* Extra Detail (optional, placed after the main 4 rows) */}
          <div className="col-span-3"> 
              <ProfileDetail label="Email Address" value={profileData.email} isLink />
         
          </div>
        </div>
       
        <div className="mt-8 flex justify-end"> 
          {isEditing ? (
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white font-semibold  hover:bg-green-700 transition flex items-center gap-2" style={{ borderRadius: '8px',background: 'linear-gradient(to right, #2DC2DB , #2B87D0)' }}>
                <Save size={18} />
                Save Changes
              </button>
          ) : (
              <button onClick={handleEdit} className="px-4 py-2 text-white font-semibold  hover:bg-blue-700 transition flex items-center gap-2" style={{ borderRadius: '8px', background: 'linear-gradient(to right, #2DC2DB , #2B87D0)', }}>
                <Edit size={18} />
                Edit Profile
              </button>
          )}
        </div>
      </div>
    </div>
 
        <div className="lg:col-span-1">
          <div className="">
            <p className="text-[18px] font-bold text-[#09407F] -mb-3">Recent Activity</p>
            <div className="p-3 pl-2">
      <Calender  />
    </div>
            
            
           
          </div>
        </div>
      </div>
    </div>
    </>
  );
}