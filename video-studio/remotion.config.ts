// Remotion build/render configuration.
// Docs: https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// H.264 MP4 is the default codec; left explicit here so it's obvious where to change it.
Config.setCodec("h264");
