import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import { Lucide } from "@react-native-vector-icons/lucide";

import { pickAndImportSongs } from "../../scanner/fileImporter";
import { getAllSongs, setFavorite } from "../../database/songs";
import { rescanAllMetadata } from "../../scanner/rescanMetadata";

import { Song } from "../../types/music";
import { usePlayerStore } from "@/store/playerStore";

import { PopularCard } from "../../components/music/PopularCard";
import { SongRow } from "../../components/music/SongRow";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

const TABS = ["Overview", "Songs", "Albums", "Artists"] as const;

type Tab = (typeof TABS)[number];

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeTab, setActiveTab] =
    useState<Tab>("Overview");

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const currentSong = usePlayerStore(
    (s) => s.currentSong
  );

  const isPlaying = usePlayerStore(
    (s) => s.isPlaying
  );

  const setQueue = usePlayerStore(
    (s) => s.setQueue
  );

  const loadSongs = useCallback(async () => {
    const allSongs = await getAllSongs();

    setSongs(allSongs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [loadSongs])
  );

  // useEffect(() => {
  //   // eslint-disable-next-line react-hooks/set-state-in-effect -- known false positive: loadSongs sets state after an await, not synchronously. See facebook/react#34743
  //   loadSongs();
  // }, [loadSongs]);

  const handleImport = async () => {
    await pickAndImportSongs();

    await loadSongs();
  };

  const handleRescan = async () => {
    await rescanAllMetadata();

    await loadSongs();
  };

  const handleToggleFavorite = async (
    song: Song
  ) => {
    await setFavorite(
      song.id,
      !song.is_favorite
    );

    await loadSongs();
  };

  const filteredSongs = useMemo(() => {
    if (!query.trim()) {
      return songs;
    }

    const q = query.toLowerCase();

    return songs.filter(
      (song) =>
        song.title
          .toLowerCase()
          .includes(q) ||
        song.artist
          ?.toLowerCase()
          .includes(q)
    );
  }, [songs, query]);

  const popularSongs = useMemo(() => {
    return [...songs]
      .sort(
        (a, b) =>
          (b.play_count ?? 0) -
          (a.play_count ?? 0)
      )
      .slice(0, 5);
  }, [songs]);

  const showSongList =
    activeTab === "Overview" ||
    activeTab === "Songs";

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 bg-background"
    >

      {/* ========================= */}
      {/* FIXED HEADER */}
      {/* ========================= */}

      <View className="bg-background">

        {/* Discover Title */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">

          <Text className="text-display text-text-primary">
            Discover
          </Text>

          <Pressable
            onPress={() => {
              setSearchOpen((previous) => {
                if (previous) {
                  setQuery("");
                }

                return !previous;
              });
            }}
            className="touch-target p-2 rounded-pill bg-background-elevated items-center justify-center"
          >
            <Lucide
              name={
                searchOpen
                  ? "x"
                  : "search"
              }
              size={22}
              color="white"
            />
          </Pressable>

        </View>


        {/* Search Input */}
        {searchOpen && (
          <View className="px-4 pb-3">

            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search songs or artists"
              placeholderTextColor="#6B7280"
              className="bg-background-card text-text-primary px-4 py-3 rounded-card text-body"
            />

          </View>
        )}


        {/* Fixed Tabs */}
        <View className="flex-row items-center gap-6 px-4 pb-3 border-b border-border">

          {TABS.map((tab) => {

            const isActive =
              activeTab === tab;

            return (
              <Pressable
                key={tab}
                onPress={() =>
                  setActiveTab(tab)
                }
              >
                <Text
                  className={`text-body pb-2 ${isActive
                      ? "text-text-primary font-bold border-b-2 border-accent"
                      : "text-text-secondary"
                    }`}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}


          {/* Spacer */}
          <View className="flex-1" />


          {/* Import */}
          <Pressable
            onPress={handleImport}
            hitSlop={8}
            className="touch-target items-center justify-center"
          >
            <Lucide
              name="plus"
              size={20}
              color="white"
            />
          </Pressable>


          {/* Rescan */}
          <Pressable
            onPress={handleRescan}
            hitSlop={8}
            className="touch-target items-center justify-center"
          >
            <Lucide
              name="refresh-cw"
              size={18}
              color="white"
            />
          </Pressable>

        </View>

      </View>


      {/* ========================= */}
      {/* SCROLLABLE CONTENT */}
      {/* ========================= */}

      {showSongList && (

        <FlashList
          data={filteredSongs}

          ListHeaderComponent={
            activeTab === "Overview" ? (
              <View>

                {/* Popular Title */}
                <Text className="text-title-lg text-text-primary px-4 pt-5 pb-3">
                  Popular This Week
                </Text>


                {/* Popular Cards */}
                {popularSongs.length > 0 ? (

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-4 mb-4"
                  >
                    {popularSongs.map(
                      (song) => (
                        <PopularCard
                          key={song.id}
                          song={song}
                          isFavorite={
                            !!song.is_favorite
                          }
                          onPress={() =>
                            setQueue(
                              songs,
                              songs.findIndex(
                                (item) =>
                                  item.id === song.id
                              )
                            )
                          }
                          onToggleFavorite={() =>
                            handleToggleFavorite(song)
                          }
                        />
                      )
                    )}
                  </ScrollView>

                ) : (

                  <Text className="text-caption text-text-muted px-4 pb-4">
                    Import some songs to see
                    your popular tracks here.
                  </Text>

                )}


                {/* Top Songs */}
                <Text className="text-title-lg text-text-primary px-4 pt-2 pb-2">
                  Top Songs
                </Text>

              </View>
            ) : null
          }


          renderItem={({ item, index }) => (

            <SongRow
              song={item}
              isActive={
                item.id ===
                currentSong?.id
              }
              isPlaying={isPlaying}
              onPress={() =>
                setQueue(
                  filteredSongs,
                  index
                )
              }
              onMenuPress={() => { }}
            />

          )}


          keyExtractor={(item) =>
            item.id
          }

          contentContainerStyle={{
            paddingBottom: 120,
          }}

          showsVerticalScrollIndicator={false}
        />

      )}


      {/* ========================= */}
      {/* ALBUMS / ARTISTS */}
      {/* ========================= */}

      {(activeTab === "Albums" ||
        activeTab === "Artists") && (

          <View className="flex-1">

            <Text className="text-caption text-text-muted px-4 py-6">

              {activeTab} view is coming soon.

            </Text>

          </View>

        )}

    </SafeAreaView>
  );
}