"""YouTube transcript ingester. TODO: implement for day 11–12.

Recommended implementation:
1. `pip install youtube-transcript-api yt-dlp`
2. Use yt-dlp (or YouTube Data API v3) to enumerate the channel's recent uploads:
       yt-dlp --flat-playlist --print "%(id)s|%(title)s|%(upload_date)s" \\
         "https://www.youtube.com/@{handle}/videos"
3. For each new video_id, fetch transcript:
       from youtube_transcript_api import YouTubeTranscriptApi
       segments = YouTubeTranscriptApi.get_transcript(video_id)
       text = " ".join(s["text"] for s in segments)
4. Build IngestedItem:
       external_id = video_id
       url = f"https://www.youtube.com/watch?v={video_id}"
       raw_content = full transcript
       excerpt = first ~1200 chars

Edge cases:
- Some videos have no transcript (auto-gen disabled). Skip those rather than failing.
- Long podcasts (>1hr) may exceed Haiku's input window once stuffed in the prompt.
  Truncate excerpt to 1200 chars and stash full transcript in raw_content; Scout
  scores from excerpt only.
"""

from aibi_scout.ingesters.rss import IngestedItem


def ingest_youtube(channel_url: str) -> list[IngestedItem]:
    raise NotImplementedError("YouTube ingester planned for day 11–12.")
