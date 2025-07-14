# LinkedIn Integration Implementation

## Overview

This implementation integrates LinkedIn OAuth connection functionality into the agency-linked-creator application. The integration allows users to connect their LinkedIn profiles to enable posting and social media management features.

## Files Modified/Created

### 1. LinkedinContext.tsx (New)

- **Location**: `src/context/LinkedinContext.tsx`
- **Purpose**: Manages LinkedIn connection state and provides functions for OAuth flow
- **Key Functions**:
  - `connectLinkedIn()`: Initiates OAuth flow by calling the API
  - `refreshProfile()`: Refreshes page to reflect updated connection status

### 2. ProfilesContext.tsx (Modified)

- **Updated**: LinkedIn data structure to support new profile fields
- **Added**: Support for `linkedinProfile` object with detailed user information
- **Enhanced**: Data mapping for both person and company profiles

### 3. LinkedInConnectionPanel.tsx (Modified)

- **Location**: `src/components/client/LinkedInConnectionPanel.tsx`
- **Purpose**: UI component for LinkedIn connection management
- **Features**:
  - Connect/Reconnect buttons
  - Loading states
  - Error handling
  - Connection status display
  - "Already connected? Click here" refresh functionality
  - Check Status functionality with modal display
  - Disconnect functionality

### 4. LinkedInStatusModal.tsx (New)

- **Location**: `src/components/client/LinkedInStatusModal.tsx`
- **Purpose**: Modal component to display detailed LinkedIn connection status
- **Features**:
  - Shows connection status with visual indicators
  - Displays profile information (name, email)
  - Shows connection timeline (connected date, last updated, expiry)
  - Displays permissions/scope information
  - Loading state while fetching status

### 5. ProfileDetailsPerson.tsx & ProfileDetailsCompany.tsx (Modified)

- **Updated**: Imports and integration of LinkedInConnectionPanel
- **Enhanced**: LinkedIn Integration section to use new component

### 6. App.tsx (Modified)

- **Added**: LinkedinProvider wrapper around app components

## API Integration

### Endpoints Used

#### 1. Connect LinkedIn

- **URL**: `https://web-production-2fc1.up.railway.app/api/v1/linkedin/authorize`
- **Method**: GET
- **Parameters**:
  - `profile_id`: The profile ID to connect
  - `agency_id`: The agency ID (defaults to "agency1")
  - `client_id`: The client ID
- **Response**: Returns authorization URL for OAuth flow

#### 2. Check LinkedIn Status

- **URL**: `https://web-production-2fc1.up.railway.app/api/v1/linkedin/status/{agency_id}/{client_id}/{profile_id}`
- **Method**: GET
- **Purpose**: Check current LinkedIn connection status
- **Response**: Returns detailed connection status and profile information

#### 3. Disconnect LinkedIn

- **URL**: `https://web-production-2fc1.up.railway.app/api/v1/linkedin/disconnect/{agency_id}/{client_id}/{profile_id}`
- **Method**: GET
- **Purpose**: Disconnect LinkedIn account
- **Response**: Returns user-friendly HTML confirmation page

### Flow

1. User clicks "Connect LinkedIn" button
2. System calls `/linkedin/authorize` endpoint with profile details
3. API returns authorization URL
4. Authorization URL opens in new window/tab for OAuth flow
5. After OAuth completion, server updates Firestore with connection details
6. User clicks "Already connected? Click here" to refresh and see updated status

## Data Structure

### LinkedIn Profile Object

```json
{
  "linkedin": {
    "connectedAt": "2025-07-12T17:27:01+02:00",
    "lastUpdated": "2025-07-12T17:27:01+02:00",
    "linkedinAccountName": "Marcos Santiago Soto",
    "linkedinConnected": true,
    "linkedinExpiryDate": "2025-09-10T17:27:00+02:00",
    "linkedinName": "Marcos",
    "linkedinProfile": {
      "email": "marcossantiagosoto4@gmail.com",
      "email_verified": true,
      "family_name": "Santiago Soto",
      "given_name": "Marcos",
      "locale": "en-US",
      "name": "Marcos Santiago Soto",
      "picture": "https://media.licdn.com/dms/image/...",
      "linkedinRefreshToken": null,
      "linkedinScope": "email,openid,profile,w_member_social",
      "linkedinToken": "exampletoken",
      "linkedinUserId": "8tgSZsGXtU"
    }
  }
}
```

## User Experience

### Not Connected State

- Shows "Connect LinkedIn" button
- Displays loading state during connection
- Shows error messages if connection fails
- Includes "Already connected? Click here" text for refresh

### Connected State

- Shows green dot indicator
- Displays connected account name
- Shows expiry date and connection date
- Shows connected email address
- Provides "Reconnect" button for re-authentication
- **"Check Status" button**: Opens detailed status modal
- **"Disconnect" button**: Initiates disconnection process

## Error Handling

- Network errors are caught and displayed to user
- Invalid responses show appropriate error messages
- Loading states prevent multiple simultaneous requests
- Graceful fallbacks for missing data

## Security Considerations

- OAuth flow happens in separate window/tab
- No sensitive tokens stored in frontend state
- All authentication handled by server
- Profile refresh ensures data consistency

## Usage

To use the LinkedIn integration:

1. Navigate to any profile details page (person or company)
2. Scroll to "LinkedIn Integration" section
3. Click "Connect LinkedIn" button
4. Complete OAuth flow in popup window
5. Click "Already connected? Click here" to refresh status
6. Connected profiles will show account details and status
7. Use "Check Status" to view detailed connection information in modal
8. Use "Disconnect" to remove LinkedIn connection

## Future Enhancements

- Add disconnect functionality
- Implement selective profile refresh without page reload
- Add toast notifications for better UX
- Support for multiple LinkedIn accounts per profile
- Token refresh handling
