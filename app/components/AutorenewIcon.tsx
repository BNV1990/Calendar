import React from 'react';
import { MdAutorenew } from 'react-icons/md';

interface AutorenewIconProps {
  size?: number;
  color?: string;
  onClick?: () => void;
}

const AutorenewIcon: React.FC<AutorenewIconProps> = ({ size = 24, color = '#555', onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '40px', // Match input height
      height: '40px', // Match input height
      borderRadius: '6px', // Match input border radius
      backgroundColor: '#ffffff', // White background to match input
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)', // Match input wrapper shadow
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      border: '1px solid #dcdcdc', // Match input border
    }} className="autorenew-icon">
      <MdAutorenew size={size} color={color} />
    </div>
  );
};

export default AutorenewIcon;
