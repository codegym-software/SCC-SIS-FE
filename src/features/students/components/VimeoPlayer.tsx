import { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';
import { lessonProgressApi } from '@/shared/api/lesson-progress';

interface VimeoPlayerProps {
    videoUrl: string;
    lessonId: number;
    lastPosition?: number;
    onProgressUpdate?: (progress: number, completed: boolean) => void;
}

export function VimeoPlayer({ videoUrl, lessonId, lastPosition = 0, onProgressUpdate }: VimeoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Track session start time and last update
    const sessionStartRef = useRef<number>(Date.now());
    const lastUpdateRef = useRef<number>(Date.now());
    const lastPositionRef = useRef<number>(0);

    // Extract video ID from Vimeo URL
    const getVimeoVideoId = (url: string): string | null => {
        const patterns = [
            /vimeo\.com\/(\d+)/,
            /player\.vimeo\.com\/video\/(\d+)/,
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    useEffect(() => {
        const videoId = getVimeoVideoId(videoUrl);
        if (!videoId || !containerRef.current) return;

        // Initialize Vimeo Player - để Vimeo tự động tính height theo video gốc
        const player = new Player(containerRef.current, {
            id: parseInt(videoId),
            responsive: true,
            controls: true,
            autoplay: false,
        });

        playerRef.current = player;

        // Resume from last position if available
        if (lastPosition > 0) {
            player.setCurrentTime(lastPosition).catch(console.error);
        }

        // Get video duration
        let videoDuration = 0;
        player.getDuration().then((duration) => {
            videoDuration = Math.floor(duration);
        });

        // Track progress every 5 seconds
        const progressInterval = setInterval(async () => {
            try {
                const currentTime = await player.getCurrentTime();
                const duration = videoDuration || (await player.getDuration());
                
                if (duration > 0) {
                    const progress = Math.min(100, Math.floor((currentTime / duration) * 100));
                    setProgressPercentage(progress);
                    
                    const now = Date.now();
                    const timeSpent = Math.floor((now - lastUpdateRef.current) / 1000);
                    lastUpdateRef.current = now;
                    
                    // Update backend
                    await lessonProgressApi.updateVideoProgress({
                        lessonId,
                        currentPosition: Math.floor(currentTime),
                        duration: Math.floor(duration),
                        timeSpent,
                    });
                    
                    lastPositionRef.current = Math.floor(currentTime);
                    
                    // Check if completed (>= 90% or near end)
                    const completed = progress >= 90 || currentTime >= duration - 5;
                    if (completed && !isCompleted) {
                        setIsCompleted(true);
                        onProgressUpdate?.(100, true);
                    } else if (!completed) {
                        onProgressUpdate?.(progress, false);
                    }
                }
            } catch (error) {
                console.error('Error tracking progress:', error);
            }
        }, 5000);

        // Track when video ends
        player.on('ended', async () => {
            try {
                const duration = videoDuration || (await player.getDuration());
                await lessonProgressApi.updateVideoProgress({
                    lessonId,
                    currentPosition: Math.floor(duration),
                    duration: Math.floor(duration),
                    timeSpent: 0,
                });
                setIsCompleted(true);
                setIsPlaying(false);
                onProgressUpdate?.(100, true);
            } catch (error) {
                console.error('Error marking as completed:', error);
            }
        });

        // Track play/pause state
        player.on('play', () => setIsPlaying(true));
        player.on('pause', () => setIsPlaying(false));

        // Cleanup
        return () => {
            clearInterval(progressInterval);
            player.destroy();
        };
    }, [videoUrl, lessonId]);

    const handleStop = async () => {
        if (playerRef.current) {
            await playerRef.current.pause();
            await playerRef.current.setCurrentTime(0);
            setIsPlaying(false);
        }
    };

    const handleToggleFullscreen = async () => {
        if (playerRef.current) {
            const isFullscreen = await playerRef.current.getFullscreen();
            if (isFullscreen) {
                await playerRef.current.exitFullscreen();
            } else {
                await playerRef.current.requestFullscreen();
            }
        }
    };

    const handleTogglePlay = async () => {
        if (playerRef.current) {
            const paused = await playerRef.current.getPaused();
            if (paused) {
                await playerRef.current.play();
            } else {
                await playerRef.current.pause();
            }
        }
    };

    return (
        <div className="relative w-full">
            {/* Vimeo Player - Sử dụng controls có sẵn của Vimeo */}
            <div 
                ref={containerRef} 
                className="w-full rounded-lg overflow-hidden shadow-2xl bg-black"
            />
            
            {/* Completed badge - top right */}
            {isCompleted && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-2xl z-50 pointer-events-none">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Hoàn thành
                </div>
            )}
        </div>
    );
}
