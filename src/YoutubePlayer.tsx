import YouTube, { YouTubeProps } from 'react-youtube';

interface YTPlayerProps {
    videoId: string,
    youtubeProps?: YouTubeProps,
    className?: string
}

const YTPlayer: React.FC<YTPlayerProps> = ({ videoId, youtubeProps, className}) => {
      const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  return <YouTube className={className} videoId={videoId} opts={youtubeProps ? youtubeProps.opts : opts} onReady={onPlayerReady} />;
}

export default YTPlayer