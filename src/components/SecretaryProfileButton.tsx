import { useAuthStore } from '../store/auth';

interface SecretaryProfileButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SecretaryProfileButton({ onClick, className = "" }: SecretaryProfileButtonProps) {
  const { user } = useAuthStore();
  
  // If user has a profile image URL, display it
  if (user?.profileImageUrl) {
    return (
      <button
        onClick={onClick}
        className={`h-8 w-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity cursor-pointer ${className}`}
        title="Profile"
      >
        <img 
          src={user.profileImageUrl} 
          alt="Profile" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span class="text-white font-semibold text-xs">
                    ${user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              `;
            }
          }}
        />
      </button>
    );
  }
  
  // Fallback to initials if no profile image
  return (
    <button
      onClick={onClick}
      className={`h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center ${className}`}
      title="Profile"
    >
      <span className="text-white font-semibold text-xs">
        {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
      </span>
    </button>
  );
}
