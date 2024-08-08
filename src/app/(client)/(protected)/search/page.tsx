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
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
      const response = await fetch(`/api/users/${uid}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }

      const fullUserData: UserData = await response.json();
      setSelectedUser(fullUserData);
    } catch (error) {
      console.error('Error fetching full user data:', error);
      setSelectedUser(null);
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
      const response = await fetch('/api/user-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserLocation: userData.location,
          radiusKm: distance,
          currentUserId: userData.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results: SearchResult[] = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
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
        ...userData,
        hiddenProfiles: updatedHiddenProfiles,
      });

      console.log(`Profile ${hide ? 'hidden' : 'unhidden'} successfully`);
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
