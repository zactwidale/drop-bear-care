'use client';

import React, { useState } from 'react';
import DBCLayout from '@/components/DBCLayout';
import { useKeyboardAvoidance } from '@/hooks/useKeyboardAvoidance';
import { useAuth } from '@/contexts/AuthProvider';
import { withAuthProtection } from '@/hocs/routeGuards';
import UserSearch from '@/components/UserSearch';
import SearchResults from '@/components/SearchResults';
import { SearchResult, type UserData } from '@/types';
import { Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FullProfile from '@/components/FullProfile';
import {
  GeoPoint,
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { reconstructTimestamp } from '@/utils/timestampUtils';

const Search = () => {
  const { userData, updateUserData } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );
  const [distance, setDistance] = useState<number>(10);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  useKeyboardAvoidance();

  const handleOpenChat = (uid: string) => {
    alert(`Opening chat with user ${uid}`);
  };

  const handleViewProfile = async (uid: string) => {
    setIsProfileLoading(true);
    setIsProfileOpen(true);

    try {
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/users/${uid}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }

      const userData: UserData = await response.json();

      // Reconstruct GeoPoint
      if (userData.location?.geopoint) {
        userData.location.geopoint = new GeoPoint(
          userData.location.geopoint.latitude,
          userData.location.geopoint.longitude
        );
      }
      // Reconstruct Timestamp
      if (userData.lastActive) {
        userData.lastActive = reconstructTimestamp(userData.lastActive)!;
      }

      setSelectedUser(userData);
    } catch (error) {
      console.error('Error fetching full user data:', error);
      setSelectedUser(null);
      // Optionally, you can set an error state here to display to the user
      // setError('Failed to load user profile. Please try again.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedUser(null);
  };

  const handleSearch = async () => {
    if (!userData || !userData.location) {
      console.error('User data or location is missing');
      return;
    }

    setIsSearching(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/user-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          currentUserLocation: userData.location,
          radiusKm: distance,
          currentUserId: userData.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const results: SearchResult[] = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      // Handle the error (e.g., show an error message to the user)
    } finally {
      setIsSearching(false);
    }
  };

  const handleNewSearch = () => {
    setSearchResults(null);
  };

  const handleHideProfile = async (uid: string, hide: boolean) => {
    if (!userData) return;

    try {
      const userRef = doc(db, 'users', userData.uid);
      const updatedHiddenProfiles = hide
        ? [...(userData.hiddenProfiles || []), uid]
        : (userData.hiddenProfiles || []).filter((id) => id !== uid);

      await updateDoc(userRef, {
        hiddenProfiles: hide ? arrayUnion(uid) : arrayRemove(uid),
      });

      updateUserData({
        hiddenProfiles: updatedHiddenProfiles,
      });
    } catch (error) {
      console.error('Error updating hidden profiles:', error);
      throw error;
    }
  };

  return (
    <>
      <DBCLayout
        title='Search'
        rightButton={
          searchResults !== null ? (
            <Button
              variant='contained'
              startIcon={<SearchIcon />}
              onClick={handleNewSearch}
            >
              New Search
            </Button>
          ) : undefined
        }
      />
      {searchResults === null ? (
        <UserSearch
          onSearch={handleSearch}
          isSearching={isSearching}
          distance={distance}
          setDistance={setDistance}
        />
      ) : (
        <SearchResults
          results={searchResults}
          currentUserData={userData!}
          onNewSearch={handleNewSearch}
          onOpenChat={handleOpenChat}
          onViewProfile={handleViewProfile}
        />
      )}
      <FullProfile
        userData={selectedUser!}
        currentUserData={userData!}
        open={isProfileOpen}
        onClose={handleCloseProfile}
        isLoading={isProfileLoading}
        onHideProfile={handleHideProfile}
        onOpenChat={handleOpenChat}
      />
    </>
  );
};

export default withAuthProtection(Search);
