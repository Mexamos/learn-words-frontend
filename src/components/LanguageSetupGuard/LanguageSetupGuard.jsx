import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import SetNativeLanguageModal from '../SetNativeLanguageModal/SetNativeLanguageModal';
import { updateUserProfile } from '../../services/userService';

export default function LanguageSetupGuard({ children }) {
  const { needsLanguageSetup, updateUser } = useContext(AuthContext);

  const handleLanguageSet = async (language) => {
    const updatedUser = await updateUserProfile({ native_language: language });
    updateUser(updatedUser);
  };

  if (needsLanguageSetup) {
    return (
      <>
        {/* Render a blank/blocked state */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} />
        <SetNativeLanguageModal
          isOpen={true}
          onLanguageSet={handleLanguageSet}
        />
      </>
    );
  }

  return children;
}

