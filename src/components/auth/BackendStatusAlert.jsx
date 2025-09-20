import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

const BackendStatusAlert = () => {
  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <AlertTriangle size={20} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h4 style={{
            color: '#92400e',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            Backend Configuration Notice
          </h4>
          <div style={{
            color: '#92400e',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '12px'
          }}>
            The registration feature is currently experiencing server configuration issues.
            This is likely due to missing environment variables in the deployed backend.
          </div>

          <div style={{
            backgroundColor: '#fbbf24',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Info size={14} />
              <span>For demonstration purposes:</span>
            </div>
            <div>• Try the login form (it should work)</div>
            <div>• Backend needs proper environment configuration for registration</div>
            <div>• Contact the backend administrator to set up USER_ID_TABLE_NAME</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusAlert;
