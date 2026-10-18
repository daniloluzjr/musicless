import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  TextInput,
  Linking,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import {
  Mic,
  Disc,
  Activity,
  Music,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  Sliders,
  Sparkles,
  Info,
  UploadCloud,
  Link2,
  Star,
  CheckCircle2,
  Trash2,
  Piano,
  Wind,
  Heart,
  X,
  ExternalLink,
} from 'lucide-react-native';
import { StemTrack, StemType } from './src/types';
import { audioEngine } from './src/audio/StemAudioEngine';

const GithubIcon = ({ size = 18, color = '#f8fafc' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </Svg>
);

const InstagramIcon = ({ size = 18, color = '#f8fafc' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <Circle cx="17.5" cy="6.5" r="1.5" fill={color} />
  </Svg>
);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const INITIAL_TRACKS: StemTrack[] = [
  {
    id: 'vocals',
    name: 'Vocals',
    subtitle: 'Lead & Backing Vocals (Karaoke)',
    color: '#38bdf8', // Cyan
    iconName: 'Mic',
    volume: 0.85,
    isMuted: false,
    isSolo: false,
  },
  {
    id: 'drums',
    name: 'Drums',
    subtitle: 'Kick, Snare, Cymbals (Drumless)',
    color: '#fb923c', // Orange
    iconName: 'Disc',
    volume: 0.9,
    isMuted: false,
    isSolo: false,
  },
  {
    id: 'bass',
    name: 'Bass',
    subtitle: 'Bassline & Sub (Bassless)',
    color: '#c084fc', // Purple
    iconName: 'Activity',
    volume: 0.95,
    isMuted: false,
    isSolo: false,
  },
  {
    id: 'piano',
    name: 'Keyboards & Piano',
    subtitle: 'Piano, Organ, Synth Keys (Teclado)',
    color: '#f43f5e', // Rose
    iconName: 'Piano',
    volume: 0.85,
    isMuted: false,
    isSolo: false,
  },
  {
    id: 'brass',
    name: 'Brass & Horns',
    subtitle: 'Saxophone, Trumpet, Winds (Sax / Corneta)',
    color: '#eab308', // Gold
    iconName: 'Wind',
    volume: 0.85,
    isMuted: false,
    isSolo: false,
  },
  {
    id: 'other',
    name: 'Guitar & Other',
    subtitle: 'Acoustic & Electric Guitars, FX',
    color: '#34d399', // Emerald
    iconName: 'Music',
    volume: 0.8,
    isMuted: false,
    isSolo: false,
  },
];

export default function App() {
  const [tracks, setTracks] = useState<StemTrack[]>(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activePreset, setActivePreset] = useState<string>('all');
  const [levels, setLevels] = useState<Record<StemType, number>>({
    vocals: 0,
    drums: 0,
    bass: 0,
    piano: 0,
    brass: 0,
    other: 0,
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('5');

  const handleOpenPayPal = () => {
    const cleanAmount = donationAmount.trim().replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanAmount);
    const url = num && num > 0
      ? `https://paypal.me/luxdeveloper/${num}EUR`
      : 'https://paypal.me/luxdeveloper';
    Linking.openURL(url);
  };

  const [importTab, setImportTab] = useState<'file' | 'url'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [urlStatusMessage, setUrlStatusMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    rawFile?: File;
  } | null>(null);
  const [isSongLoaded, setIsSongLoaded] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songSubtitle, setSongSubtitle] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const handleChooseFile = () => {
    if (Platform.OS === 'web') {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'audio/*,.mp3,.wav,.flac,.m4a';
      fileInput.style.display = 'none';

      fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
          setSelectedFile({
            name: file.name,
            size: sizeMB,
            rawFile: file,
          });
          setSongTitle(file.name);
          setSongSubtitle(`Custom Audio Track • ${sizeMB}`);
          setIsSongLoaded(true);

          try {
            const arrayBuffer = await file.arrayBuffer();
            const trackDuration = await audioEngine.loadFullTrack(arrayBuffer);
            setDuration(trackDuration);
            setCurrentTime(0);
            setIsPlaying(false);
          } catch (err) {
            console.error('Error decoding audio track', err);
          }
        }
        fileInput.remove();
      };

      document.body.appendChild(fileInput);
      fileInput.click();
    } else {
      Alert.alert('File Picker', 'Native audio file selection.');
    }
  };

  const handleChangeSong = () => {
    audioEngine.reset();
    setIsPlaying(false);
    setIsSongLoaded(false);
    setSelectedFile(null);
    setSongTitle('');
    setSongSubtitle('');
    setDuration(0);
    setCurrentTime(0);
    setUrlStatus('idle');
    setUrlStatusMessage('');
    setUrlInput('');
    setIsProcessingUrl(false);
    setIsProcessingFile(false);
    setActivePreset('all');
    setTracks(INITIAL_TRACKS);
  };

  const pollForSeparatedStems = (trackId: string, songName: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes polling
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/track-stems/${trackId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.is_separated && data.stems) {
          clearInterval(interval);
          setUrlStatusMessage(`Demucs AI completed! Loading 6 isolated studio stems...`);
          const stemBuffers: Partial<Record<StemType, ArrayBuffer>> = {};
          let loaded = 0;
          await Promise.all(
            (['vocals', 'drums', 'bass', 'piano', 'brass', 'other'] as StemType[]).map(async (stemKey) => {
              const stemUrl = data.stems[stemKey];
              if (stemUrl) {
                const sRes = await fetch(stemUrl);
                stemBuffers[stemKey] = await sRes.arrayBuffer();
                loaded++;
                setUrlStatusMessage(`Loading 6 isolated studio stems (${loaded}/6)...`);
              }
            })
          );
          const wasPlaying = audioEngine.getIsPlaying();
          const curTime = audioEngine.getCurrentTime();
          const trackDuration = await audioEngine.loadAllStems(stemBuffers);
          setDuration(trackDuration);
          audioEngine.seek(curTime);
          setCurrentTime(curTime);
          if (wasPlaying) {
            await audioEngine.play();
            setIsPlaying(true);
          }
          setSongSubtitle((prev) => `${prev.split('•')[0].trim()} • Demucs v4 AI Studio Stems (6 Tracks Isolated)`);
          setUrlStatus('success');
          setUrlStatusMessage(`✨ Demucs v4 AI: 6 isolated studio tracks loaded for "${songName}"! Zero bleed.`);
        }
      } catch {
        // silent retry
      }
    }, 5000);
  };

  const handleSeparateUploadedFile = async () => {
    if (!selectedFile) return;
    setIsProcessingFile(true);

    try {
      const formData = new FormData();
      if (selectedFile.rawFile) {
        formData.append('file', selectedFile.rawFile);
      }

      const response = await fetch(`${API_BASE_URL}/separate`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'AI Separation Started',
          'Meta Demucs v4 is isolating 6 studio tracks in the background. They will automatically load once ready!'
        );
        pollForSeparatedStems(data.track_id, selectedFile.name);
      } else {
        throw new Error('Backend offline');
      }
    } catch {
      Alert.alert(
        'Track Loaded into Player',
        `"${selectedFile.name}" is already loaded and ready to play in the mixer!\n\nTo run full AI 6-stem separation (Demucs v4), start the backend server:\ncd backend && python server.py`
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleProcessUrl = async () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setUrlStatus('error');
      setUrlStatusMessage('Please paste a valid YouTube, YouTube Music, or Spotify link.');
      return;
    }

    setUrlStatus('loading');
    setUrlStatusMessage('Connecting to backend & extracting audio with yt-dlp...');
    setIsProcessingUrl(true);

    try {
      const response = await fetch(`${API_BASE_URL}/separate-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to process link');
      }

      const data = await response.json();
      setUrlStatusMessage(`Stream ready: "${data.title}". Decoding into player...`);

      // Set song metadata in the player
      setSongTitle(data.title);
      setSongSubtitle(`${data.artist} • YouTube Stream`);

      if (data.stems) {
        setSongSubtitle(`${data.artist} • Demucs v4 AI Studio Stems (6 Tracks Isolated)`);
        setUrlStatusMessage(`Loading 6 isolated studio stems (0/6)...`);
        const stemKeys: StemType[] = ['vocals', 'drums', 'bass', 'piano', 'brass', 'other'];
        const stemBuffers: Partial<Record<StemType, ArrayBuffer>> = {};
        let loaded = 0;
        await Promise.all(
          stemKeys.map(async (stemKey) => {
            const stemUrl = data.stems[stemKey];
            if (stemUrl) {
              const res = await fetch(stemUrl);
              stemBuffers[stemKey] = await res.arrayBuffer();
              loaded++;
              setUrlStatusMessage(`Loading 6 isolated studio stems (${loaded}/6)...`);
            }
          })
        );
        setUrlStatusMessage(`Decoding audio buffers into mixer...`);
        const trackDuration = await audioEngine.loadAllStems(stemBuffers);
        setDuration(trackDuration || data.duration);
        setCurrentTime(0);
        setIsPlaying(false);
        setIsSongLoaded(true);
        setUrlStatus('success');
        setUrlStatusMessage(`Ready! Loaded 6 isolated studio stems for "${data.title}". Zero bleed!`);
      } else {
        // Fetch and decode full track into 6-stem crossover filter engine immediately
        const audioResponse = await fetch(data.audio_url);
        const audioBuffer = await audioResponse.arrayBuffer();
        const trackDuration = await audioEngine.loadFullTrack(audioBuffer);

        setDuration(trackDuration || data.duration);
        setCurrentTime(0);
        setIsPlaying(false);
        setIsSongLoaded(true);

        setUrlStatus('success');
        setUrlStatusMessage(`Loaded "${data.title}". Isolating 6 studio stems in background with Demucs AI...`);

        // Start background polling for AI isolated stems
        if (data.track_id) {
          pollForSeparatedStems(data.track_id, data.title);
        }
      }
    } catch (err: any) {
      console.error('URL extraction error:', err);
      setUrlStatus('error');
      setUrlStatusMessage(
        err.message || 'Could not connect to backend. Make sure the server is running on port 8000.'
      );
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Sync with audio engine
  useEffect(() => {
    audioEngine.setOnTimeUpdate((time) => {
      setCurrentTime(time);
      setDuration(audioEngine.getDuration());

      // Update real-time meters
      if (audioEngine.getIsPlaying()) {
        setLevels({
          vocals: audioEngine.getStemLevel('vocals'),
          drums: audioEngine.getStemLevel('drums'),
          bass: audioEngine.getStemLevel('bass'),
          piano: audioEngine.getStemLevel('piano'),
          brass: audioEngine.getStemLevel('brass'),
          other: audioEngine.getStemLevel('other'),
        });
      }
    });

    audioEngine.updateMix(tracks);
  }, []);

  const togglePlay = async () => {
    if (isProcessingUrl) {
      setUrlStatus('loading');
      setUrlStatusMessage('Downloading and decoding studio stems, please wait a moment...');
      return;
    }
    if (!isSongLoaded && duration === 0) {
      setUrlStatus('error');
      setUrlStatusMessage('Please paste a YouTube/Spotify link or choose an audio file first!');
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      await audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleRewind = () => {
    audioEngine.seek(0);
    setCurrentTime(0);
  };

  const handleSeek = (ratio: number) => {
    const newTime = ratio * duration;
    audioEngine.seek(newTime);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (id: StemType, newVol: number) => {
    const updated = tracks.map((t) => (t.id === id ? { ...t, volume: newVol } : t));
    setTracks(updated);
    audioEngine.updateMix(updated);
    setActivePreset('custom');
  };

  const handleToggleMute = (id: StemType) => {
    const updated = tracks.map((t) => (t.id === id ? { ...t, isMuted: !t.isMuted } : t));
    setTracks(updated);
    audioEngine.updateMix(updated);
    setActivePreset('custom');
  };

  const handleToggleSolo = (id: StemType) => {
    const targetTrack = tracks.find((t) => t.id === id);
    const newSoloState = !targetTrack?.isSolo;

    const updated = tracks.map((t) => (t.id === id ? { ...t, isSolo: newSoloState } : t));
    setTracks(updated);
    audioEngine.updateMix(updated);
    setActivePreset('custom');
  };

  const applyPreset = (preset: 'all' | 'karaoke' | 'drums' | 'bass' | 'piano' | 'brass' | 'guitar') => {
    setActivePreset(preset);
    let updated = tracks.map((t) => ({ ...t, isMuted: false, isSolo: false }));

    if (preset === 'karaoke') {
      updated = updated.map((t) => (t.id === 'vocals' ? { ...t, isMuted: true } : t));
    } else if (preset === 'drums') {
      updated = updated.map((t) => (t.id === 'drums' ? { ...t, isMuted: true } : t));
    } else if (preset === 'bass') {
      updated = updated.map((t) => (t.id === 'bass' ? { ...t, isMuted: true } : t));
    } else if (preset === 'piano') {
      updated = updated.map((t) => (t.id === 'piano' ? { ...t, isMuted: true } : t));
    } else if (preset === 'brass') {
      updated = updated.map((t) => (t.id === 'brass' ? { ...t, isMuted: true } : t));
    } else if (preset === 'guitar') {
      updated = updated.map((t) => (t.id === 'other' ? { ...t, isMuted: true } : t));
    }

    setTracks(updated);
    audioEngine.updateMix(updated);
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    audioEngine.setPlaybackRate(speed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderIcon = (type: StemType, color: string) => {
    const size = 22;
    switch (type) {
      case 'vocals':
        return (
          <Image
            source={require('./assets/microfone.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'drums':
        return (
          <Image
            source={require('./assets/bateria.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'bass':
        return (
          <Image
            source={require('./assets/baixo.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'piano':
        return (
          <Image
            source={require('./assets/piano.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'brass':
        return (
          <Image
            source={require('./assets/corneta.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
      case 'other':
        return (
          <Image
            source={require('./assets/guitarra.png')}
            style={{ width: size, height: size, tintColor: color }}
            resizeMode="contain"
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Sliders size={20} color="#38bdf8" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>MusicLess</Text>
              <View style={styles.openSourceTag}>
                <Text style={styles.openSourceText}>OPEN SOURCE</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Stem Separation & Practice Player</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.starGithubBtn}
            onPress={() => Linking.openURL('https://github.com/daniloluzjr/musicless')}
          >
            <Star size={14} color="#eab308" fill="#eab308" />
            <Text style={styles.starGithubText}>Star on GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoBtn}
            onPress={() => setShowInfoModal(true)}
          >
            <Info size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* DONATION & CREATOR POPUP MODAL */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInfoModal(false)}
        >
          <Pressable
            style={styles.donationModalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleBadge}>
                <Heart size={18} color="#ef4444" fill="#ef4444" />
                <Text style={styles.modalTitleText}>Support MusicLess</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInfoModal(false)}
              >
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Creator Socials */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => Linking.openURL('https://github.com/daniloluzjr')}
              >
                <GithubIcon size={16} color="#f8fafc" />
                <Text style={styles.socialBtnText}>GitHub</Text>
                <ExternalLink size={12} color="#64748b" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialBtn, styles.instagramBtn]}
                onPress={() => Linking.openURL('https://instagram.com/luxdeveloper')}
              >
                <InstagramIcon size={16} color="#f8fafc" />
                <Text style={styles.socialBtnText}>Instagram</Text>
                <ExternalLink size={12} color="#64748b" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </View>

            {/* Message in English */}
            <Text style={styles.donationDescText}>
              Help us keep the project open-source & 100% free! Donate to support server infrastructure, model upgrades, and maintenance.
            </Text>

            {/* PayPal QR Code */}
            <View style={styles.qrContainer}>
              <Image
                source={require('./assets/paypal_qr.png')}
                style={styles.qrImage}
                resizeMode="contain"
              />
              <Text style={styles.qrHintText}>Scan with your camera to donate with PayPal</Text>
            </View>

            {/* Donation Input & Button */}
            <View style={styles.donationInputGroup}>
              <View style={styles.donationAmountWrapper}>
                <Text style={styles.currencySymbol}>€</Text>
                <TextInput
                  style={styles.donationInput}
                  keyboardType="numeric"
                  value={donationAmount}
                  onChangeText={setDonationAmount}
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>

              <TouchableOpacity
                style={styles.donateActionBtn}
                onPress={handleOpenPayPal}
              >
                <Heart size={16} color="#ffffff" fill="#ffffff" />
                <Text style={styles.donateActionBtnText}>Donate with PayPal</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickChipsRow}>
              {['2', '5', '10', '20'].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickChip,
                    donationAmount === val && styles.quickChipActive,
                  ]}
                  onPress={() => setDonationAmount(val)}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      donationAmount === val && styles.quickChipTextActive,
                    ]}
                  >
                    €{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Direct PayPal.me Link */}
            <TouchableOpacity
              style={styles.directLinkRow}
              onPress={() => Linking.openURL('https://paypal.me/luxdeveloper')}
            >
              <Text style={styles.directLinkText}>paypal.me/luxdeveloper ↗</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* TRANSPORT & TRACK CONTROLS */}
        <View style={styles.playerCard}>
          {!isSongLoaded ? (
            /* IN-PLAYER INPUT HUB (REPLACES TEST SONG) */
            <View style={styles.trackInputHub}>
              <View style={styles.hubHeaderRow}>
                <View style={styles.hubTitleGroup}>
                  <Music size={16} color="#38bdf8" />
                  <Text style={styles.hubTitle}>Load Song to Practice</Text>
                </View>
                <View style={styles.badgesRowCompact}>
                  <View style={[styles.platformBadge, { backgroundColor: '#ef444422', borderColor: '#ef444466' }]}>
                    <Text style={[styles.platformBadgeText, { color: '#ef4444' }]}>YouTube</Text>
                  </View>
                  <View style={[styles.platformBadge, { backgroundColor: '#22c55e22', borderColor: '#22c55e66' }]}>
                    <Text style={[styles.platformBadgeText, { color: '#22c55e' }]}>Spotify</Text>
                  </View>
                  <View style={[styles.platformBadge, { backgroundColor: '#38bdf822', borderColor: '#38bdf866' }]}>
                    <Text style={[styles.platformBadgeText, { color: '#38bdf8' }]}>MP3/WAV</Text>
                  </View>
                </View>
              </View>

              {/* TAB SELECTOR */}
              <View style={styles.importTabRowCompact}>
                <TouchableOpacity
                  style={[
                    styles.importTabBtnCompact,
                    importTab === 'url' && styles.importTabBtnActive,
                  ]}
                  onPress={() => setImportTab('url')}
                >
                  <Link2 size={13} color={importTab === 'url' ? '#38bdf8' : '#94a3b8'} />
                  <Text
                    style={[
                      styles.importTabTextCompact,
                      importTab === 'url' && styles.importTabTextActive,
                    ]}
                  >
                    Paste Link (YouTube / Spotify)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.importTabBtnCompact,
                    importTab === 'file' && styles.importTabBtnActive,
                  ]}
                  onPress={() => setImportTab('file')}
                >
                  <UploadCloud size={13} color={importTab === 'file' ? '#38bdf8' : '#94a3b8'} />
                  <Text
                    style={[
                      styles.importTabTextCompact,
                      importTab === 'file' && styles.importTabTextActive,
                    ]}
                  >
                    Upload Audio File
                  </Text>
                </TouchableOpacity>
              </View>

              {importTab === 'url' ? (
                <View>
                  <View style={styles.urlInputRow}>
                    <View style={styles.urlInputBoxCompact}>
                      <Link2 size={16} color="#64748b" style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.urlTextInput}
                        placeholder="Paste YouTube, YouTube Music or Spotify link..."
                        placeholderTextColor="#64748b"
                        value={urlInput}
                        onChangeText={setUrlInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onSubmitEditing={handleProcessUrl}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.loadSongBtn, isProcessingUrl && styles.loadSongBtnLoading]}
                      onPress={handleProcessUrl}
                      disabled={isProcessingUrl}
                    >
                      <Text style={styles.loadSongBtnText}>
                        {isProcessingUrl ? 'Extracting...' : 'Load & Separate'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {urlStatus !== 'idle' && (
                    <View
                      style={[
                        styles.urlStatusCardCompact,
                        urlStatus === 'loading' && styles.urlStatusCardLoading,
                        urlStatus === 'success' && styles.urlStatusCardSuccess,
                        urlStatus === 'error' && styles.urlStatusCardError,
                      ]}
                    >
                      <View style={styles.urlStatusIconRow}>
                        {urlStatus === 'loading' && <RotateCcw size={14} color="#38bdf8" />}
                        {urlStatus === 'success' && <CheckCircle2 size={14} color="#22c55e" />}
                        {urlStatus === 'error' && <Info size={14} color="#ef4444" />}
                        <Text
                          style={[
                            styles.urlStatusTextCompact,
                            urlStatus === 'loading' && { color: '#38bdf8' },
                            urlStatus === 'success' && { color: '#22c55e' },
                            urlStatus === 'error' && { color: '#ef4444' },
                          ]}
                        >
                          {urlStatusMessage}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.fileInputRow}>
                  <TouchableOpacity
                    style={styles.chooseFileBtn}
                    onPress={handleChooseFile}
                  >
                    <UploadCloud size={16} color="#38bdf8" />
                    <Text style={styles.chooseFileBtnText}>Choose Audio File from Device (MP3 / WAV / FLAC / M4A)</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* NOW PLAYING TRACK INFO */
            <View style={styles.nowPlayingRow}>
              <View style={styles.nowPlayingInfo}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>READY</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.songTitle} numberOfLines={1}>{songTitle}</Text>
                  <Text style={styles.artistName} numberOfLines={1}>{songSubtitle}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeSongHeaderBtn}
                onPress={handleChangeSong}
              >
                <Text style={styles.changeSongHeaderText}>Change Song</Text>
              </TouchableOpacity>
            </View>
          )}

              {/* TIMELINE PROGRESS BAR */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.progressBarBg}
                onPress={(e) => {
                  if (Platform.OS === 'web') {
                    const target = e.currentTarget as unknown as HTMLElement;
                    const rect = target.getBoundingClientRect();
                    const nativeEvent = e.nativeEvent as unknown as MouseEvent;
                    const clickX = nativeEvent.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                    handleSeek(ratio);
                  } else {
                    handleSeek(0.5);
                  }
                }}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` },
                  ]}
                />
              </TouchableOpacity>

              {/* CONTROLS ROW */}
              <View style={styles.transportRow}>
                {/* Speed Selector */}
                <View style={styles.speedGroup}>
                  {[0.75, 1.0, 1.25].map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedBtn,
                        playbackSpeed === speed && styles.speedBtnActive,
                      ]}
                      onPress={() => changeSpeed(speed)}
                    >
                      <Text
                        style={[
                          styles.speedText,
                          playbackSpeed === speed && styles.speedTextActive,
                        ]}
                      >
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Play/Pause & Rewind */}
                <View style={styles.mainControls}>
                  <TouchableOpacity style={styles.secondaryCtrlBtn} onPress={handleRewind}>
                    <RotateCcw size={20} color="#cbd5e1" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.playBtn, isProcessingUrl && { opacity: 0.6 }]}
                    onPress={togglePlay}
                    disabled={isProcessingUrl}
                  >
                    {isProcessingUrl ? (
                      <RotateCcw size={24} color="#0f172a" />
                    ) : isPlaying ? (
                      <Pause size={28} color="#0f172a" />
                    ) : (
                      <Play size={28} color="#0f172a" style={{ marginLeft: 3 }} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </View>
              </View>
            </View>

            {/* PRESET PRACTICE MODES */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Practice Modes</Text>
              <Text style={styles.sectionHint}>Mute your instrument with a single click</Text>
            </View>

            <View style={styles.presetRow}>
              <TouchableOpacity
                style={[styles.presetButton, activePreset === 'karaoke' && styles.presetButtonActive]}
                onPress={() => applyPreset('karaoke')}
              >
                <Image
                  source={require('./assets/microfone.png')}
                  style={{ width: 16, height: 16, tintColor: activePreset === 'karaoke' ? '#fff' : '#38bdf8' }}
                  resizeMode="contain"
                />
                <Text style={[styles.presetText, activePreset === 'karaoke' && styles.presetTextActive]}>
                  Karaoke
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, activePreset === 'drums' && styles.presetButtonActive]}
                onPress={() => applyPreset('drums')}
              >
                <Image
                  source={require('./assets/bateria.png')}
                  style={{ width: 16, height: 16, tintColor: activePreset === 'drums' ? '#fff' : '#fb923c' }}
                  resizeMode="contain"
                />
                <Text style={[styles.presetText, activePreset === 'drums' && styles.presetTextActive]}>
                  Drums
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, activePreset === 'bass' && styles.presetButtonActive]}
                onPress={() => applyPreset('bass')}
              >
                <Image
                  source={require('./assets/baixo.png')}
                  style={{ width: 16, height: 16, tintColor: activePreset === 'bass' ? '#fff' : '#c084fc' }}
                  resizeMode="contain"
                />
                <Text style={[styles.presetText, activePreset === 'bass' && styles.presetTextActive]}>
                  Bass
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, activePreset === 'piano' && styles.presetButtonActive]}
                onPress={() => applyPreset('piano')}
              >
                <Image
                  source={require('./assets/piano.png')}
                  style={{ width: 16, height: 16, tintColor: activePreset === 'piano' ? '#fff' : '#f43f5e' }}
                  resizeMode="contain"
                />
                <Text style={[styles.presetText, activePreset === 'piano' && styles.presetTextActive]}>
                  Keys / Piano
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, activePreset === 'brass' && styles.presetButtonActive]}
                onPress={() => applyPreset('brass')}
              >
                <Image
                  source={require('./assets/corneta.png')}
                  style={{ width: 16, height: 16, tintColor: activePreset === 'brass' ? '#fff' : '#eab308' }}
                  resizeMode="contain"
                />
                <Text style={[styles.presetText, activePreset === 'brass' && styles.presetTextActive]}>
                  Brass / Sax
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, activePreset === 'guitar' && styles.presetButtonActive]}
                onPress={() => applyPreset('guitar')}
              >
                <Image
                  source={require('./assets/guitarra.png')}
                  style={{ width: 16, height: 16, tintColor: activePreset === 'guitar' ? '#fff' : '#34d399' }}
                  resizeMode="contain"
                />
                <Text style={[styles.presetText, activePreset === 'guitar' && styles.presetTextActive]}>
                  Guitar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, activePreset === 'all' && styles.presetButtonActive]}
                onPress={() => applyPreset('all')}
              >
                <Volume2 size={16} color={activePreset === 'all' ? '#fff' : '#94a3b8'} />
                <Text style={[styles.presetText, activePreset === 'all' && styles.presetTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4-STEMS MIXER SECTION */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Multi-Track Stem Mixer</Text>
              <Text style={styles.sectionHint}>Adjust volume faders, mute or solo any instrument</Text>
            </View>

            <View style={styles.channelsList}>
              {tracks.map((track) => {
                const hasAnySolo = tracks.some((t) => t.isSolo);
                const isSilenced = track.isMuted || (hasAnySolo && !track.isSolo);
                const level = levels[track.id] || 0;

                return (
                  <View key={track.id} style={[styles.channelCard, isSilenced && styles.channelSilenced]}>
                    <View style={styles.channelHeader}>
                      <View style={styles.channelLabelGroup}>
                        <View style={[styles.channelIconBox, { backgroundColor: `${track.color}22` }]}>
                          {renderIcon(track.id, track.color)}
                        </View>
                        <View>
                          <Text style={styles.channelName}>{track.name}</Text>
                          <Text style={styles.channelSubtitle}>{track.subtitle}</Text>
                        </View>
                      </View>

                      <View style={styles.channelActions}>
                        <TouchableOpacity
                          style={[
                            styles.toggleBtn,
                            track.isMuted ? styles.muteBtnActive : styles.toggleBtnInactive,
                          ]}
                          onPress={() => handleToggleMute(track.id)}
                        >
                          {track.isMuted ? (
                            <VolumeX size={15} color="#ef4444" />
                          ) : (
                            <Volume2 size={15} color="#94a3b8" />
                          )}
                          <Text
                            style={[
                              styles.toggleBtnText,
                              track.isMuted && styles.muteTextActive,
                            ]}
                          >
                            MUTE
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.toggleBtn,
                            track.isSolo ? styles.soloBtnActive : styles.toggleBtnInactive,
                          ]}
                          onPress={() => handleToggleSolo(track.id)}
                        >
                          <Headphones
                            size={15}
                            color={track.isSolo ? '#eab308' : '#94a3b8'}
                          />
                          <Text
                            style={[
                              styles.toggleBtnText,
                              track.isSolo && styles.soloTextActive,
                            ]}
                          >
                            SOLO
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.meterContainer}>
                      <View
                        style={[
                          styles.meterBar,
                          {
                            width: `${Math.min(100, (isSilenced ? 0 : level) * 100 * (track.volume || 1))}%`,
                            backgroundColor: track.color,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.faderRow}>
                      <Text style={styles.faderLabel}>Volume</Text>
                      <View style={styles.volStepContainer}>
                        {[0, 0.25, 0.5, 0.75, 1.0].map((step) => {
                          const isSelected = track.volume >= step && !track.isMuted;
                          return (
                            <TouchableOpacity
                              key={step}
                              style={[
                                styles.volStepBtn,
                                isSelected && { backgroundColor: track.color },
                              ]}
                              onPress={() => handleVolumeChange(track.id, step)}
                            >
                              <Text
                                style={[
                                  styles.volStepText,
                                  isSelected && styles.volStepTextActive,
                                ]}
                              >
                                {Math.round(step * 100)}%
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0c1322',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#38bdf833',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  openSourceTag: {
    backgroundColor: '#38bdf822',
    borderColor: '#38bdf866',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openSourceText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starGithubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#eab30866',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
  },
  starGithubText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  donationModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  instagramBtn: {
    borderColor: '#e1306c44',
  },
  socialBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  donationDescText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrImage: {
    width: 140,
    height: 140,
  },
  qrHintText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  donationInputGroup: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  donationAmountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    width: 90,
  },
  currencySymbol: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  donationInput: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    paddingVertical: 8,
  },
  donateActionBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  donateActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickChipActive: {
    backgroundColor: '#0284c733',
    borderColor: '#38bdf8',
  },
  quickChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  quickChipTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  directLinkRow: {
    paddingVertical: 4,
  },
  directLinkText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  sectionHeader: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  sectionHint: {
    fontSize: 12,
    color: '#64748b',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  presetText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  playerCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20,
  },
  trackInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f9fafb',
  },
  artistName: {
    fontSize: 12,
    color: '#9ca3af',
  },
  timeBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 4,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speedGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1f2937',
    borderRadius: 6,
  },
  speedBtnActive: {
    backgroundColor: '#38bdf833',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  speedText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  speedTextActive: {
    color: '#38bdf8',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  secondaryCtrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748b',
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  statusText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  channelsList: {
    gap: 12,
    marginBottom: 20,
  },
  channelCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  channelSilenced: {
    opacity: 0.45,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  channelLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  channelIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  channelSubtitle: {
    color: '#64748b',
    fontSize: 11,
  },
  channelActions: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleBtnInactive: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  toggleBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  muteBtnActive: {
    backgroundColor: '#ef444422',
    borderColor: '#ef4444',
  },
  muteTextActive: {
    color: '#ef4444',
  },
  soloBtnActive: {
    backgroundColor: '#eab30822',
    borderColor: '#eab308',
  },
  soloTextActive: {
    color: '#eab308',
  },
  meterContainer: {
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  meterBar: {
    height: '100%',
    borderRadius: 2,
  },
  faderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  faderLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  volStepContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  volStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#1e293b',
    borderRadius: 4,
  },
  volStepText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  volStepTextActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
  uploadCard: {
    backgroundColor: '#0c1322',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#38bdf855',
  },
  importTabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  importTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  importTabBtnActive: {
    backgroundColor: '#38bdf822',
    borderColor: '#38bdf8',
  },
  importTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  importTabTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  tabContentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  platformBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  urlInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    maxWidth: 600,
    marginBottom: 14,
  },
  urlTextInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
    outlineWidth: 0,
  },
  uploadCardTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
  },
  uploadCardDesc: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    maxWidth: 500,
  },
  uploadActionBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
  },
  uploadActionBtnLoading: {
    opacity: 0.7,
    borderColor: '#64748b',
  },
  uploadActionBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  selectedFileCard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38bdf844',
  },
  selectedFileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  selectedFileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#38bdf822',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFileName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedFileSize: {
    color: '#38bdf8',
    fontSize: 12,
    marginTop: 2,
  },
  clearFileBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ef444422',
  },
  selectedFileActionsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  changeFileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  changeFileBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  urlStatusCard: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
  },
  urlStatusCardLoading: {
    backgroundColor: '#38bdf815',
    borderColor: '#38bdf866',
  },
  urlStatusCardSuccess: {
    backgroundColor: '#22c55e15',
    borderColor: '#22c55e66',
  },
  urlStatusCardError: {
    backgroundColor: '#ef444415',
    borderColor: '#ef444466',
  },
  urlStatusIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  urlStatusText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  sectionHeaderCenter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 480,
    lineHeight: 18,
  },
  changeSongHeaderBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf855',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  changeSongHeaderText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  trackInputHub: {
    backgroundColor: '#0c1322',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#38bdf833',
    marginBottom: 16,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  hubTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hubTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  badgesRowCompact: {
    flexDirection: 'row',
    gap: 6,
  },
  importTabRowCompact: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  importTabBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  importTabTextCompact: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urlInputBoxCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  loadSongBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadSongBtnLoading: {
    opacity: 0.6,
  },
  loadSongBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  fileInputRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  chooseFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf866',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  chooseFileBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  urlStatusCardCompact: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  urlStatusTextCompact: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  nowPlayingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  nowPlayingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#22c55e1a',
    borderColor: '#22c55e66',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    color: '#22c55e',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
