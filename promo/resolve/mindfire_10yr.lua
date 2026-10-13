-- Mindfire Homes · 10 years — DaVinci Resolve project builder (Resolve 18+, free works).
--
-- 1. Set ROOT below to the absolute path of this promo/ folder (forward slashes are fine on Windows).
-- 2. Copy this file to
--      Windows: %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
--      macOS:   ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/
-- 3. In Resolve: Workspace > Scripts > mindfire_10yr
--
-- Builds two timelines (16x9 and 9x16), picture on V1, the four stems on A1-A4 so they can be
-- mixed in Fairlight, and a marker on every scene change and hit from audio/cues.json.

local ROOT = "C:/path/to/mindfire/promo"
local PROJECT = "Mindfire Homes - 10 Years"
local FPS = 30

local MARKERS = {
  { 0.0,  "Blue",   "Hook",          "Ten years ago, we made one promise" },
  { 3.0,  "Purple", "Stamp",         "VERIFIED lands on the title deed" },
  { 4.0,  "Red",    "10 YEARS",      "Impact + confetti" },
  { 5.0,  "Purple", "Tagline",       "redefining modern living" },
  { 6.0,  "Red",    "Drop / montage","Real listings + live site" },
  { 8.0,  "Yellow", "Cut: home page","" },
  { 10.0, "Yellow", "Cut: listings", "" },
  { 11.5, "Yellow", "Cut: penthouse page", "" },
  { 12.5, "Yellow", "Cut: Project Elysian (sold)", "" },
  { 13.0, "Red",    "Wall",          "A decade of homes in Abuja" },
  { 14.0, "Green",  "The Mindfire way", "Five practices, about page" },
  { 14.5, "Purple", "Stamp 01",      "" },
  { 15.5, "Purple", "Stamp 02",      "" },
  { 16.5, "Purple", "Stamp 03",      "" },
  { 17.5, "Purple", "Stamp 04",      "" },
  { 18.5, "Purple", "Stamp 05",      "" },
  { 19.0, "Purple", "Diligence is the product", "" },
  { 20.0, "Red",    "Thank you",     "" },
  { 22.0, "Cream",  "Psalm 127:1",   "Swap for the ?verse=0 render if needed" },
  { 24.0, "Yellow", "Snare roll",    "" },
  { 25.5, "Yellow", "Drop-out",      "" },
  { 26.0, "Red",    "CTA",           "Here's to the next ten." },
  { 26.5, "Purple", "URL ding",      "mindfirehomes.com" },
  { 29.0, "Red",    "Final hit",     "" },
}

local resolve = Resolve()
local pm = resolve:GetProjectManager()
local project = pm:LoadProject(PROJECT) or pm:CreateProject(PROJECT)
if not project then print("Could not create or open project " .. PROJECT) return end
project:SetSetting("timelineFrameRate", tostring(FPS))
project:SetSetting("timelineResolutionWidth", "1920")
project:SetSetting("timelineResolutionHeight", "1080")

local mp = project:GetMediaPool()
local function import(rel)
  local items = mp:ImportMedia({ ROOT .. "/" .. rel })
  if not items or #items == 0 then print("Missing: " .. rel) return nil end
  return items[1]
end

local v169 = import("out/mindfire_10yr_16x9.mp4")
local v916 = import("out/mindfire_10yr_9x16.mp4")
local stems = {
  import("audio/stem_drums.wav"),
  import("audio/stem_bass.wav"),
  import("audio/stem_music.wav"),
  import("audio/stem_fx.wav"),
}

local function build(name, clip, w, h)
  if not clip then return end
  local tl = mp:CreateEmptyTimeline(name)
  if w ~= 1920 then
    tl:SetSetting("useCustomSettings", "1")
    tl:SetSetting("timelineResolutionWidth", tostring(w))
    tl:SetSetting("timelineResolutionHeight", tostring(h))
  end
  while tl:GetTrackCount("audio") < 4 do tl:AddTrack("audio", "stereo") end
  local start = tl:GetStartFrame()
  mp:AppendToTimeline({ { mediaPoolItem = clip, mediaType = 1, trackIndex = 1, recordFrame = start } })
  for i, s in ipairs(stems) do
    if s then mp:AppendToTimeline({ { mediaPoolItem = s, mediaType = 2, trackIndex = i, recordFrame = start } }) end
  end
  for _, m in ipairs(MARKERS) do
    tl:AddMarker(math.floor(m[1] * FPS + 0.5), m[2], m[3], m[4], 1)
  end
  print("Built " .. name)
end

build("Mindfire 10yr 16x9", v169, 1920, 1080)
build("Mindfire 10yr 9x16", v916, 1080, 1920)
pm:SaveProject()
print("Done. Mix stems in Fairlight (A1 drums, A2 bass, A3 music, A4 fx), then export from Deliver.")
